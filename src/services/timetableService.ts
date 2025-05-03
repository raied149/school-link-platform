import { TimeSlot, TimetableFilter, WeekDay, SlotType } from '@/types/timetable';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { normalizeTimeString, mapDayToNumber, mapNumberToDay } from '@/utils/timeUtils';

// Service methods
export const timetableService = {
  getTimeSlots: async (filter?: TimetableFilter): Promise<TimeSlot[]> => {
    try {
      let query = supabase.from('timetable').select(`
        id,
        start_time,
        end_time,
        day_of_week,
        subject_id,
        teacher_id,
        section_id
      `);
      
      if (filter) {
        if (filter.dayOfWeek) {
          // Convert day name to number (0-6 for Sunday-Saturday)
          const dayNumber = mapDayToNumber(filter.dayOfWeek);
          query = query.eq('day_of_week', dayNumber);
        }
        
        if (filter.classId) {
          // For class filtering, we need to use the sections related to this class
          const { data: sections } = await supabase
            .from('sections')
            .select('id')
            .eq('class_id', filter.classId);
          
          if (sections && sections.length > 0) {
            const sectionIds = sections.map(section => section.id);
            query = query.in('section_id', sectionIds);
          }
        }
        
        if (filter.sectionId) {
          query = query.eq('section_id', filter.sectionId);
        }
        
        if (filter.teacherId) {
          query = query.eq('teacher_id', filter.teacherId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching time slots:", error);
        throw error;
      }
      
      // Convert database records to TimeSlot objects
      const slots: TimeSlot[] = [];
      
      for (const record of data || []) {
        // Get section info to get the class_id
        const { data: sectionData } = await supabase
          .from('sections')
          .select('class_id')
          .eq('id', record.section_id)
          .single();
          
        // Get subject info for title
        let title = '';
        let slotType: SlotType = 'event';
        
        if (record.subject_id) {
          slotType = 'subject';
          
          const { data: subjectData } = await supabase
            .from('subjects')
            .select('name')
            .eq('id', record.subject_id)
            .single();
            
          if (subjectData) {
            title = subjectData.name;
          }
        }
        
        // Convert day_of_week number to day name - Fix: Cast string to WeekDay
        const dayOfWeekString = mapNumberToDay(record.day_of_week);
        
        // Only add to slots if it's a valid day of week
        const validWeekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (validWeekDays.includes(dayOfWeekString as WeekDay)) {
          const validWeekDay = dayOfWeekString as WeekDay;
          
          slots.push({
            id: record.id,
            startTime: record.start_time,
            endTime: record.end_time,
            dayOfWeek: validWeekDay,
            slotType,
            title,
            subjectId: record.subject_id,
            teacherId: record.teacher_id,
            classId: sectionData?.class_id || "",
            sectionId: record.section_id,
            academicYearId: "1", // Default academic year
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          console.error(`Invalid day of week: ${dayOfWeekString} from day number: ${record.day_of_week}`);
        }
      }
      
      return slots;
    } catch (error) {
      console.error("Error in getTimeSlots:", error);
      return [];
    }
  },
  
  getTimeSlotById: async (id: string): Promise<TimeSlot | undefined> => {
    try {
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          id,
          start_time,
          end_time,
          day_of_week,
          subject_id,
          teacher_id,
          section_id
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching time slot:", error);
        throw error;
      }
      
      if (!data) return undefined;
      
      // Get section info to get the class_id
      const { data: sectionData } = await supabase
        .from('sections')
        .select('class_id')
        .eq('id', data.section_id)
        .single();
      
      // Get subject info for title
      let title = '';
      let slotType: SlotType = 'event';
      
      if (data.subject_id) {
        slotType = 'subject';
        
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', data.subject_id)
          .single();
          
        if (subjectData) {
          title = subjectData.name;
        }
      }
      
      // Convert day_of_week number to day name
      const dayOfWeek = mapNumberToDay(data.day_of_week);
      
      return {
        id: data.id,
        startTime: data.start_time,
        endTime: data.end_time,
        dayOfWeek,
        slotType,
        title,
        subjectId: data.subject_id,
        teacherId: data.teacher_id,
        classId: sectionData?.class_id || "",
        sectionId: data.section_id,
        academicYearId: "1", // Default academic year
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error in getTimeSlotById:", error);
      return undefined;
    }
  },
  
  createTimeSlot: async (timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeSlot> => {
    try {
      // Convert day name to number (0-6 for Sunday-Saturday)
      const dayOfWeek = mapDayToNumber(timeSlotData.dayOfWeek);
      
      // Normalize time strings
      const startTime = normalizeTimeString(timeSlotData.startTime);
      const endTime = normalizeTimeString(timeSlotData.endTime);
      
      if (!startTime) {
        console.error("Invalid start time format:", timeSlotData.startTime);
        throw new Error("Invalid start time format");
      }
      
      if (!endTime) {
        console.error("Invalid end time format:", timeSlotData.endTime);
        throw new Error("Invalid end time format");
      }
      
      // Get teacher for this subject if this is a subject slot
      let teacherId = timeSlotData.teacherId;
      
      if (timeSlotData.slotType === 'subject' && timeSlotData.subjectId && !teacherId) {
        // Look up teacher for this subject
        const { data: teacherSubjectData } = await supabase
          .from('teacher_subjects')
          .select('teacher_id')
          .eq('subject_id', timeSlotData.subjectId)
          .single();
        
        if (teacherSubjectData) {
          teacherId = teacherSubjectData.teacher_id;
        }
      }
      
      console.log("Creating time slot:", {
        start_time: startTime,
        end_time: endTime,
        day_of_week: dayOfWeek,
        subject_id: timeSlotData.subjectId || null,
        teacher_id: teacherId || null,
        section_id: timeSlotData.sectionId,
      });
      
      const { data, error } = await supabase
        .from("timetable")
        .insert({
          start_time: startTime,
          end_time: endTime,
          day_of_week: dayOfWeek,
          subject_id: timeSlotData.subjectId || null,
          teacher_id: teacherId || null,
          section_id: timeSlotData.sectionId,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating time slot:", error);
        throw error;
      }
      
      console.log("Created time slot:", data);
      
      // Ensure we use the correct type for dayOfWeek
      const validWeekDay: WeekDay = timeSlotData.dayOfWeek;
      
      return {
        id: data.id,
        startTime: data.start_time,
        endTime: data.end_time,
        dayOfWeek: validWeekDay,
        slotType: timeSlotData.slotType,
        subjectId: data.subject_id || undefined,
        title: timeSlotData.title,
        teacherId: data.teacher_id || undefined,
        classId: timeSlotData.classId,
        sectionId: data.section_id,
        academicYearId: timeSlotData.academicYearId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in createTimeSlot:", error);
      // Fallback to local creation for demo purposes
      const newTimeSlot: TimeSlot = {
        id: uuidv4(),
        ...timeSlotData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newTimeSlot;
    }
  },
  
  updateTimeSlot: async (id: string, timeSlotData: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TimeSlot | undefined> => {
    try {
      const updateData: any = {};
      
      if (timeSlotData.startTime) {
        updateData.start_time = normalizeTimeString(timeSlotData.startTime);
      }
      
      if (timeSlotData.endTime) {
        updateData.end_time = normalizeTimeString(timeSlotData.endTime);
      }
      
      if (timeSlotData.dayOfWeek) {
        updateData.day_of_week = mapDayToNumber(timeSlotData.dayOfWeek);
      }
      
      if (timeSlotData.subjectId !== undefined) updateData.subject_id = timeSlotData.subjectId;
      if (timeSlotData.teacherId !== undefined) updateData.teacher_id = timeSlotData.teacherId;
      if (timeSlotData.sectionId) updateData.section_id = timeSlotData.sectionId;
      
      const { data, error } = await supabase
        .from('timetable')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating time slot:", error);
        throw error;
      }
      
      // Get the existing time slot to merge with updates
      const existingSlot = await timetableService.getTimeSlotById(id);
      if (!existingSlot) return undefined;
      
      return {
        ...existingSlot,
        ...timeSlotData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in updateTimeSlot:", error);
      return undefined;
    }
  },
  
  deleteTimeSlot: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting time slot:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteTimeSlot:", error);
      return false;
    }
  },
  
  getWeekDays: (): WeekDay[] => {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  },

  getTimeRange: (): string[] => {
    const timeRange: string[] = [];
    for (let hour = 7; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      timeRange.push(`${formattedHour}:00`);
      timeRange.push(`${formattedHour}:30`);
    }
    return timeRange;
  },
  
  getSlotTypes: (): SlotType[] => {
    return ['subject', 'break', 'event'];
  }
};

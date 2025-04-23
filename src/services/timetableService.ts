
import { TimeSlot, TimetableFilter, WeekDay, SlotType } from '@/types/timetable';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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
          const dayMap: Record<string, number> = {
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6,
            'Sunday': 0,
          };
          
          if (dayMap[filter.dayOfWeek] !== undefined) {
            query = query.eq('day_of_week', dayMap[filter.dayOfWeek]);
          }
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
        
        // Convert day_of_week number to day name
        const dayMap: Record<number, WeekDay> = {
          1: 'Monday',
          2: 'Tuesday',
          3: 'Wednesday',
          4: 'Thursday',
          5: 'Friday',
          6: 'Saturday',
          0: 'Sunday',
        };
        
        const dayOfWeek = dayMap[record.day_of_week] || 'Monday';
        
        // Determine slot type based on whether it has a subject_id
        const slotType: SlotType = record.subject_id ? 'subject' : 'event';
        
        slots.push({
          id: record.id,
          startTime: record.start_time,
          endTime: record.end_time,
          dayOfWeek,
          slotType,
          subjectId: record.subject_id,
          teacherId: record.teacher_id,
          classId: sectionData?.class_id || "",
          sectionId: record.section_id,
          academicYearId: "1", // Default academic year
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
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
      
      // Convert day_of_week number to day name
      const dayMap: Record<number, WeekDay> = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        0: 'Sunday',
      };
      
      const dayOfWeek = dayMap[data.day_of_week] || 'Monday';
      
      // Determine slot type based on whether it has a subject_id
      const slotType: SlotType = data.subject_id ? 'subject' : 'event';
      
      return {
        id: data.id,
        startTime: data.start_time,
        endTime: data.end_time,
        dayOfWeek,
        slotType,
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
      const dayMap: Record<string, number> = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0,
      };
      
      const dayOfWeek = dayMap[timeSlotData.dayOfWeek] || 1; // Default to Monday if not found
      
      const { data, error } = await supabase
        .from('timetable')
        .insert({
          start_time: timeSlotData.startTime,
          end_time: timeSlotData.endTime,
          day_of_week: dayOfWeek,
          subject_id: timeSlotData.subjectId,
          teacher_id: timeSlotData.teacherId,
          section_id: timeSlotData.sectionId,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating time slot:", error);
        throw error;
      }
      
      return {
        id: data.id,
        ...timeSlotData,
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
      
      if (timeSlotData.startTime) updateData.start_time = timeSlotData.startTime;
      if (timeSlotData.endTime) updateData.end_time = timeSlotData.endTime;
      
      if (timeSlotData.dayOfWeek) {
        // Convert day name to number (0-6 for Sunday-Saturday)
        const dayMap: Record<string, number> = {
          'Monday': 1,
          'Tuesday': 2,
          'Wednesday': 3,
          'Thursday': 4,
          'Friday': 5,
          'Saturday': 6,
          'Sunday': 0,
        };
        
        updateData.day_of_week = dayMap[timeSlotData.dayOfWeek] || 1;
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

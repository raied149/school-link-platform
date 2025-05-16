import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClassHeader } from "@/components/classes/ClassHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "@/components/classes/StudentList";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ActiveClassBreadcrumb } from "@/components/classes/ActiveClassBreadcrumb";
import { SubjectManagement } from "@/components/subjects/SubjectManagement";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";
import { TimeSlot, SlotType, WeekDay } from "@/types/timetable";
import { format, isValid, parse } from "date-fns";
import { WeeklyView } from "@/components/timetable/WeeklyView";
import { Button } from "@/components/ui/button";

interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
}

const ClassDetailsPage = () => {
  const { classId, sectionId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("students");
  const yearId = location.state?.yearId;
  const sectionName = location.state?.sectionName;
  const className = location.state?.className;

  useEffect(() => {
    console.log("ClassDetailsPage rendered with params:", { classId, sectionId });
    console.log("Location state:", location.state);
  }, [classId, sectionId, location.state]);

  // Fetch class information
  const { data: classDetails, isLoading: isClassLoading } = useQuery({
    queryKey: ['class-details', classId],
    queryFn: async () => {
      if (!classId) return null;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*, academic_years:year_id(*)')
          .eq('id', classId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching class details:", error);
          throw error;
        }
        
        // Check if data exists and has the expected structure
        if (data) {
          // Safely access the academic_years object
          const academicYearData = data.academic_years || {};
          // Use optional chaining to safely access the name property
          const academicYearName = typeof academicYearData === 'object' && academicYearData !== null 
            ? (academicYearData as any).name || 'Unknown Year' 
            : 'Unknown Year';
          
          return {
            id: data.id,
            name: data.name,
            academicYear: academicYearName,
            yearId: data.year_id
          };
        }
        
        return null;
      } catch (error) {
        console.error("Exception in class details query:", error);
        return null;
      }
    },
    enabled: !!classId && !sectionId
  });

  // Fetch section information if sectionId is provided
  const { data: sectionDetails, isLoading: isSectionLoading } = useQuery({
    queryKey: ['section-details', sectionId],
    queryFn: async () => {
      if (!sectionId) return null;
      
      const { data, error } = await supabase
        .from('sections')
        .select('*, classes:class_id(*)')
        .eq('id', sectionId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching section details:", error);
        throw error;
      }
      
      if (!data) return null;

      // Fetch the academic year info if needed
      let academicYear = 'Unknown Year';
      if (data.classes?.year_id) {
        const { data: yearData, error: yearError } = await supabase
          .from('academic_years')
          .select('name')
          .eq('id', data.classes.year_id)
          .maybeSingle();
          
        if (!yearError && yearData) {
          academicYear = yearData.name;
        }
      }
      
      return {
        id: data.id,
        name: data.name,
        teacherId: data.teacher_id,
        classId: data.class_id,
        className: data.classes?.name || 'Unknown Class',
        academicYear
      };
    },
    enabled: !!sectionId
  });

  // Determine which entity we're viewing
  const viewingSection = !!sectionId;
  const entityId = viewingSection ? sectionId : classId;
  const entityType = viewingSection ? 'section' : 'class';
  
  // Fetch students
  const { data: studentsList = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['students', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      let studentIds: string[] = [];
      
      if (viewingSection) {
        console.log("Fetching students for section:", entityId);
        
        // Fetch student IDs linked to this section
        const { data, error } = await supabase
          .from('student_sections')
          .select('student_id')
          .eq('section_id', entityId);
          
        if (error) {
          console.error("Error fetching students for section:", error);
          throw error;
        }
        
        studentIds = data.map(item => item.student_id);
        console.log("Found student IDs:", studentIds);
      } else {
        // For class, we need to get all students in all sections of this class
        // This is more complex and might require multiple queries
        const { data, error } = await supabase
          .from('sections')
          .select('id')
          .eq('class_id', entityId);
          
        if (error) {
          console.error("Error fetching sections for class:", error);
          throw error;
        }
        
        const sectionIds = data.map(section => section.id);
        
        if (sectionIds.length > 0) {
          const { data: sectionStudentsData, error: sectionStudentsError } = await supabase
            .from('student_sections')
            .select('student_id')
            .in('section_id', sectionIds);
            
          if (sectionStudentsError) {
            console.error("Error fetching students for class sections:", sectionStudentsError);
            throw sectionStudentsError;
          }
          
          studentIds = sectionStudentsData.map(item => item.student_id);
        }
      }
      
      // Now fetch detailed student information
      if (studentIds.length === 0) return [];
      
      console.log("Fetching student details for IDs:", studentIds);
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*, student_details(*)')
        .in('id', studentIds)
        .eq('role', 'student');
        
      if (studentsError) {
        console.error("Error fetching student details:", studentsError);
        throw studentsError;
      }
      
      console.log("Fetched students data:", studentsData);
      
      return studentsData.map(student => ({
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        gender: student.student_details?.gender,
        dateOfBirth: student.student_details?.dateofbirth,
      }));
    },
    enabled: !!entityId
  });

  // Fetch timetable slots for the section/class
  const { data: timeSlots = [], isLoading: isTimetableLoading } = useQuery({
    queryKey: ['timetable', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      let sectionIds: string[] = [];
      
      if (viewingSection) {
        sectionIds = [entityId as string];
      } else {
        // For class, fetch all sections
        const { data, error } = await supabase
          .from('sections')
          .select('id')
          .eq('class_id', entityId);
          
        if (error) {
          console.error("Error fetching sections for timetable:", error);
          throw error;
        }
        
        sectionIds = data.map(section => section.id);
      }
      
      if (sectionIds.length === 0) return [];
      
      // Fetch timetable slots for these sections
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable')
        .select(`
          *,
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .in('section_id', sectionIds);
        
      if (timetableError) {
        console.error("Error fetching timetable:", timetableError);
        throw timetableError;
      }
      
      // Map the data to match the TimeSlot interface
      const mappedData: TimeSlot[] = timetableData.map(slot => {
        // Convert the day_of_week number to a WeekDay string enum value
        const weekDay = mapNumberToWeekDay(slot.day_of_week);
        
        return {
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          dayOfWeek: weekDay,
          slotType: 'subject' as SlotType, // Most entries in timetable are subjects
          title: slot.subjects?.name || '',
          subjectId: slot.subject_id,
          teacherId: slot.teacher_id,
          classId: viewingSection ? sectionDetails?.classId || "" : classId || "",
          sectionId: slot.section_id,
          academicYearId: academicYearId || "",
          createdAt: slot.created_at || new Date().toISOString(),
          updatedAt: slot.created_at || new Date().toISOString(),
        };
      });
      
      return mappedData;
    },
    enabled: !!entityId
  });

  // Helper function to convert day number to WeekDay type
  const mapNumberToWeekDay = (dayNumber: number): WeekDay => {
    const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    // Adjust dayNumber if it's 0-6 (Sunday-Saturday) to match our WeekDay format (Monday-Sunday)
    const adjustedIndex = dayNumber >= 1 && dayNumber <= 7 
      ? dayNumber - 1  // If 1-7, subtract 1 to get 0-6 index
      : dayNumber % 7; // Otherwise use modulo to handle any number
      
    return weekDays[adjustedIndex] || 'Monday'; // Default to Monday if out of range
  };

  // Determine if current user can edit students
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
  console.log("User role:", user?.role);
  console.log("isAdminOrTeacher:", isAdminOrTeacher);

  const handleEditStudent = async (studentId: string, data: Partial<StudentDetail>) => {
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        })
        .eq('id', studentId);
        
      if (profileError) throw profileError;
      
      // Update student_details table if needed
      if (data.gender || data.dateOfBirth) {
        const updateData: any = {};
        if (data.gender) updateData.gender = data.gender;
        if (data.dateOfBirth) updateData.dateofbirth = data.dateOfBirth;
        
        const { error: detailsError } = await supabase
          .from('student_details')
          .update(updateData)
          .eq('id', studentId);
          
        if (detailsError) throw detailsError;
      }
      
      toast({
        title: "Success",
        description: "Student updated successfully"
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleDeleteStudent = async (studentId: string) => {
    try {
      // First, remove the student from this section
      if (viewingSection) {
        const { error: linkError } = await supabase
          .from('student_sections')
          .delete()
          .match({ student_id: studentId, section_id: sectionId });
          
        if (linkError) throw linkError;
        
        toast({
          title: "Success",
          description: "Student removed from section successfully"
        });
        
        return true;
      } else {
        // For removing from a class, we need to remove from all sections of this class
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id')
          .eq('class_id', classId);
          
        if (sectionsError) throw sectionsError;
        
        const sectionIds = sectionsData.map(section => section.id);
        
        if (sectionIds.length > 0) {
          const { error: linkError } = await supabase
            .from('student_sections')
            .delete()
            .in('section_id', sectionIds)
            .eq('student_id', studentId);
            
          if (linkError) throw linkError;
        }
        
        toast({
          title: "Success",
          description: "Student removed from class successfully"
        });
        
        return true;
      }
    } catch (error: any) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove student",
        variant: "destructive"
      });
      return false;
    }
  };

  // Timetable helper functions
  const formatTimeString = (timeString: string) => {
    try {
      if (!timeString || typeof timeString !== 'string' || !timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return 'Invalid Time';
      }
      
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      if (!isValid(date)) {
        return 'Invalid Time';
      }
      
      return format(date, 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return 'Invalid Time';
    }
  };

  const getSubjectName = (subjectId?: string) => {
    const slot = timeSlots.find(s => s.subjectId === subjectId);
    return slot?.title || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return className || classDetails?.name || "Unknown Class";
  };

  const getSectionName = (sectionId: string) => {
    return sectionName || sectionDetails?.name || "Unknown Section";
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'No Teacher';
    return `Teacher ${teacherId.substring(0, 6)}`;
  };

  // Handlers for timetable actions
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    // Would navigate to timetable page to edit
    window.location.href = `/timetable/${timeSlot.classId}/${timeSlot.sectionId}`;
  };

  const handleDeleteTimeSlot = (id: string) => {
    // Not implementing direct delete - redirect to timetable page
    window.location.href = `/timetable/${viewingSection ? sectionDetails?.classId : classId}/${sectionId || ""}`;
  };

  // Determine loading state and details
  const isLoading = isClassLoading || isSectionLoading;
  const details = viewingSection ? sectionDetails : classDetails;
  const title = viewingSection 
    ? sectionName || sectionDetails?.name || "Section Details"
    : className || classDetails?.name || "Class Details";
  const subtitle = viewingSection
    ? `${className || sectionDetails?.className || "Class"} | ${sectionDetails?.academicYear || ""}`
    : classDetails?.academicYear || "";

  // Get the academicYearId for subject management
  const academicYearId = viewingSection 
    ? classDetails?.yearId || sectionDetails?.classId 
    : classDetails?.yearId;

  console.log("onEdit function:", isAdminOrTeacher);
  console.log("onDelete function:", isAdminOrTeacher);

  return (
    <div className="space-y-6">
      <ActiveClassBreadcrumb />
      
      <ClassHeader 
        className={title}
        academicYear={subtitle}
        loading={isLoading}
      />

      <Card>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="p-4">
            <StudentList 
              studentsList={studentsList} 
              isLoading={isStudentsLoading}
              onEdit={isAdminOrTeacher ? handleEditStudent : undefined}
              onDelete={isAdminOrTeacher ? handleDeleteStudent : undefined}
            />
          </TabsContent>
          
          <TabsContent value="timetable" className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Class Timetable</h3>
              {isAdminOrTeacher && (
                <Button 
                  onClick={() => window.location.href = `/timetable/${viewingSection ? sectionDetails?.classId : classId}/${sectionId || ""}`}
                  variant="outline"
                >
                  Manage Timetable
                </Button>
              )}
            </div>
            <WeeklyView 
              timeSlots={timeSlots} 
              weekDays={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']} 
              isLoading={isTimetableLoading} 
              formatTime={formatTimeString}
              getSubjectName={getSubjectName}
              getClassName={getClassName}
              getSectionName={getSectionName}
              getTeacherName={getTeacherName}
              user={user}
              showTeacher={true}
              onEdit={isAdminOrTeacher ? handleEditTimeSlot : undefined}
              onDelete={isAdminOrTeacher ? handleDeleteTimeSlot : undefined}
            />
          </TabsContent>
          
          <TabsContent value="subjects" className="p-4">
            <SubjectManagement 
              classId={viewingSection ? sectionDetails?.classId : classId} 
              sectionId={sectionId}
              academicYearId={academicYearId}
            />
          </TabsContent>
          
          <TabsContent value="attendance" className="p-4">
            <StudentAttendanceView 
              classId={viewingSection ? sectionDetails?.classId : classId}
              sectionId={sectionId}
              studentId={undefined} // We're viewing all students in the section/class
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ClassDetailsPage;


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { Users, BookOpen, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";
import { SubjectManagement } from "@/components/subjects/SubjectManagement";

const ClassDetailsPage = () => {
  const { yearId, classId, sectionId } = useParams<{ 
    yearId: string, 
    classId: string,
    sectionId: string
  }>();
  
  const { data: academicYear } = useQuery({
    queryKey: ['academicYear', yearId],
    queryFn: async () => {
      if (!yearId) return null;
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('id', yearId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      } : null;
    },
    enabled: !!yearId
  });
  
  const { data: classDetails } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        academicYearId: data.year_id,
        createdAt: data.created_at
      } : null;
    },
    enabled: !!classId
  });
  
  const { data: sectionDetails } = useQuery({
    queryKey: ['section', sectionId],
    queryFn: async () => {
      if (!sectionId) return null;
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', sectionId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        academicYearId: yearId || "",
        teacherId: data.teacher_id,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    },
    enabled: !!sectionId
  });

  // Fetch students assigned to this section
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['section-students', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      console.log("Fetching students for section:", sectionId);
      
      // First get student IDs from student_sections table
      const { data: studentSections, error: sectionsError } = await supabase
        .from('student_sections')
        .select('student_id')
        .eq('section_id', sectionId);
        
      if (sectionsError) {
        console.error("Error fetching student sections:", sectionsError);
        throw sectionsError;
      }
      
      if (!studentSections || studentSections.length === 0) {
        console.log("No students assigned to this section");
        return [];
      }
      
      const studentIds = studentSections.map(row => row.student_id);
      console.log("Found student IDs:", studentIds);
      
      // Then get actual student details from profiles table
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          student_details (*)
        `)
        .in('id', studentIds)
        .eq('role', 'student');
        
      if (studentsError) {
        console.error("Error fetching student profiles:", studentsError);
        throw studentsError;
      }
      
      console.log("Fetched students data:", studentsData);
      return studentsData || [];
    },
    enabled: !!sectionId
  });

  // Modified StudentAcademicDetails component
  const StudentAcademicDetails = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = students?.filter(student => 
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Students in this Section</h2>
          <div className="relative w-full max-w-sm mt-2">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {isLoadingStudents ? (
          <div className="text-center py-4">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Gender</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{student.first_name} {student.last_name}</td>
                    <td className="py-3 px-4">{student.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {student.student_details?.gender || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No students assigned to this section.
          </div>
        )}
      </Card>
    );
  };

  // Simplified TimetableManagement component
  const TimetableManagement = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const [selectedDay, setSelectedDay] = useState('Monday');

    return (
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Class Timetable</h2>
          <p className="text-muted-foreground">Schedule for this class section</p>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {weekdays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded ${
                  selectedDay === day ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-center py-8 text-muted-foreground">
            No timetable entries for {selectedDay} yet.
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {classDetails?.name || 'Loading...'} - {sectionDetails?.name || 'Loading...'}
        </h1>
        <p className="text-muted-foreground">
          Academic Year: {academicYear?.name || 'Loading...'}
        </p>
      </div>

      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="timetable">
            <Clock className="h-4 w-4 mr-2" />
            Timetable
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="py-4">
          <StudentAcademicDetails />
        </TabsContent>
        
        <TabsContent value="subjects" className="py-4">
          <SubjectManagement 
            classId={classId} 
            sectionId={sectionId}
            academicYearId={yearId}
          />
        </TabsContent>
        
        <TabsContent value="timetable" className="py-4">
          <TimetableManagement />
        </TabsContent>
        
        <TabsContent value="attendance" className="py-4">
          <StudentAttendanceView 
            classId={classId}
            sectionId={sectionId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetailsPage;

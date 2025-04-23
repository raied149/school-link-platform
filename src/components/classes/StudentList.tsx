
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StudentListProps {
  sectionId?: string;
}

export function StudentList({ sectionId }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
}

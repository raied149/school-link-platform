
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentDetail } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { StudentDetails } from "./StudentDetails";
import { mockStudents } from "@/mocks/data";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StudentTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
}

export function StudentTable({ searchFilters }: StudentTableProps) {
  // Fetch all profiles with role 'student'
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      console.log("Fetching students from profiles table");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
        
      if (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
      
      console.log("Retrieved students:", data);
      return data || [];
    }
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (searchFilters.idSearch && !student.id.toLowerCase().includes(searchFilters.idSearch.toLowerCase())) {
        return false;
      }
      
      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
      if (searchFilters.nameSearch && !fullName.toLowerCase().includes(searchFilters.nameSearch.toLowerCase())) {
        return false;
      }
      
      if (searchFilters.globalSearch) {
        const searchTerm = searchFilters.globalSearch.toLowerCase();
        const searchableString = JSON.stringify(student).toLowerCase();
        return searchableString.includes(searchTerm);
      }
      
      return true;
    });
  }, [students, searchFilters]);

  if (isLoading) {
    return <div className="text-center py-8">Loading students...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading students: {(error as Error).message}</div>;
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {students.length > 0 
          ? "No students match your search criteria." 
          : "No students found in the database. Please add students first."}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id.substring(0, 8)}...</TableCell>
              <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
              <TableCell>{student.email || 'No email'}</TableCell>
              <TableCell className="w-1/2">
                <Accordion type="single" collapsible>
                  <StudentDetails student={{
                    ...student,
                    name: `${student.first_name} ${student.last_name}`,
                    dateOfBirth: student.date_of_birth || '2000-01-01',
                    gender: student.gender || 'other',
                    language: student.language || 'English',
                    nationality: student.nationality || 'Unknown',
                    guardian: {
                      name: student.guardian_name || 'Unknown',
                      email: student.guardian_email || 'unknown@example.com',
                      phone: student.guardian_phone || 'Unknown',
                      relationship: student.guardian_relationship || 'Unknown'
                    },
                    medical: {
                      bloodGroup: student.blood_group,
                      allergies: student.allergies ? [student.allergies] : [],
                      medications: [],
                      medicalHistory: student.medical_history,
                      emergencyContact: {
                        name: student.emergency_contact_name || 'Unknown',
                        phone: student.emergency_contact_phone || 'Unknown',
                        relationship: student.emergency_contact_relationship || 'Unknown'
                      }
                    }
                  }} />
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

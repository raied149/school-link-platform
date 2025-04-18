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

  // Helper function to convert profile data to StudentDetail type
  const mapProfileToStudentDetail = (profile: any): StudentDetail => {
    return {
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email || '',
      admissionNumber: profile.id.substring(0, 8),
      createdAt: profile.created_at,
      updatedAt: profile.created_at,
      dateOfBirth: '2000-01-01',
      gender: 'other',
      language: 'English',
      nationality: 'Not specified',
      contactNumber: '',
      address: '',
      currentClassId: '',
      currentSectionId: '',
      academicYearId: '',
      parentId: '',
      guardian: {
        name: 'Not specified',
        email: 'not.specified@example.com',
        phone: 'Not specified',
        relationship: 'Not specified'
      },
      medical: {
        bloodGroup: '',
        allergies: [],
        medications: [],
        medicalHistory: '',
        emergencyContact: {
          name: 'Not specified',
          phone: 'Not specified',
          relationship: 'Not specified'
        }
      }
    };
  };

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
                  <StudentDetails student={mapProfileToStudentDetail(student)} />
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

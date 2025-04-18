
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Accordion } from "@/components/ui/accordion";
import { TeacherDetails } from "./TeacherDetails";
import { Teacher } from "@/types";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function TeacherTable() {
  // Fetch all profiles with role 'teacher'
  const { data: teacherProfiles = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      console.log("Fetching teachers from profiles table");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
        
      if (error) {
        console.error("Error fetching teachers:", error);
        throw error;
      }
      
      console.log("Retrieved teachers:", data);
      return data || [];
    }
  });

  // Map profile data to Teacher type
  const teachers = useMemo(() => {
    return teacherProfiles.map(profile => {
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: '',
        gender: 'not specified',
        dateOfBirth: '1980-01-01',
        nationality: 'Not specified',
        role: 'teacher',
        contactInformation: {
          currentAddress: 'Not specified',
          permanentAddress: 'Not specified',
          personalPhone: 'Not specified',
          schoolPhone: 'Not specified',
          personalEmail: profile.email || 'Not specified',
          schoolEmail: profile.email || 'Not specified',
        },
        professionalDetails: {
          employeeId: profile.id.substring(0, 8),
          designation: 'Teacher',
          department: 'General',
          subjects: ['Subject 1', 'Subject 2'],
          classesAssigned: ['Class A', 'Class B'],
          joiningDate: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '',
          qualifications: ['Not specified'],
          employmentType: 'Full-time',
        },
        attendance: {
          present: 20,
          absent: 2,
          leave: 1,
        },
        leaveBalance: {
          sick: 10,
          casual: 5,
          vacation: 15,
        },
        performance: {},
        emergency: {
          contactName: 'Emergency Contact',
          relationship: 'Not specified',
          phone: 'Not specified',
        },
        createdAt: profile.created_at || '',
        updatedAt: profile.created_at || '',
      } as Teacher;
    });
  }, [teacherProfiles]);

  if (isLoading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading teachers: {(error as Error).message}</div>;
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No teachers found in the database. Please add teachers first.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.professionalDetails.employeeId}</TableCell>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.professionalDetails.designation}</TableCell>
              <TableCell className="w-1/2">
                <Accordion type="single" collapsible>
                  <TeacherDetails teacher={teacher} />
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

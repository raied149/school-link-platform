
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

interface TeacherTableProps {
  searchFilters?: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
}

export function TeacherTable({ searchFilters }: TeacherTableProps) {
  // Fetch all profiles with role 'teacher'
  const { data: teacherProfiles = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      console.log("Fetching teachers from profiles table");
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*, teacher_details(*)')
        .eq('role', 'teacher');
        
      if (profileError) {
        console.error("Error fetching teachers:", profileError);
        throw profileError;
      }
      
      console.log("Retrieved teachers:", profiles);
      return profiles || [];
    },
    staleTime: 1000, // Lower stale time to ensure frequent refreshes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Map profile data to Teacher type
  const filteredTeachers = useMemo(() => {
    let filtered = teacherProfiles;

    if (searchFilters) {
      const { idSearch, nameSearch, globalSearch } = searchFilters;

      if (globalSearch) {
        const searchTerm = globalSearch.toLowerCase();
        filtered = filtered.filter(teacher => {
          const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
          const searchableFields = [
            fullName,
            teacher.id.toLowerCase(),
            teacher.email?.toLowerCase() || '',
          ];
          return searchableFields.some(field => field.includes(searchTerm));
        });
      } else {
        if (idSearch) {
          filtered = filtered.filter(teacher =>
            teacher.id.toLowerCase().includes(idSearch.toLowerCase())
          );
        }
        if (nameSearch) {
          filtered = filtered.filter(teacher => {
            const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
            return fullName.includes(nameSearch.toLowerCase());
          });
        }
      }
    }

    return filtered.map(profile => {
      // If the teacher doesn't have teacher_details yet, show basic info only
      if (!profile.teacher_details) {
        console.warn(`Teacher profile ${profile.id} has no teacher_details`);
        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email || '',
          firstName: profile.first_name,
          lastName: profile.last_name,
          middleName: '',
          gender: 'other' as "male" | "female" | "other",
          dateOfBirth: '',
          nationality: '',
          role: 'teacher' as const,
          contactInformation: {
            currentAddress: '',
            permanentAddress: '',
            personalPhone: '',
            schoolPhone: '',
            personalEmail: profile.email || '',
            schoolEmail: '',
          },
          professionalDetails: {
            employeeId: 'Not set',
            designation: 'Not set',
            department: '',
            joiningDate: '',
            qualifications: [],
            employmentType: 'Full-time',
            subjects: [],
          },
          attendance: {
            present: 0,
            absent: 0,
            leave: 0,
          },
          leaveBalance: {
            sick: 10,
            casual: 5,
            vacation: 15,
          },
          performance: {
            lastReviewDate: '',
            rating: 0,
            feedback: '',
            awards: [],
          },
          emergency: {
            name: '',
            relationship: '',
            phone: '',
          },
          medicalInformation: {
            conditions: [],
            allergies: [],
          },
          createdAt: profile.created_at || '',
          updatedAt: profile.created_at || '',
        };
      }

      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: '',
        gender: profile.teacher_details.gender as "male" | "female" | "other",
        dateOfBirth: profile.teacher_details.date_of_birth,
        nationality: profile.teacher_details.nationality,
        role: 'teacher' as const,
        contactInformation: profile.teacher_details.contact_info as Teacher['contactInformation'],
        professionalDetails: profile.teacher_details.professional_info as Teacher['professionalDetails'],
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
        performance: {
          lastReviewDate: '',
          rating: 0,
          feedback: '',
          awards: [],
        },
        emergency: profile.teacher_details.emergency_contact as Teacher['emergency'],
        medicalInformation: profile.teacher_details.medical_info as Teacher['medicalInformation'],
        createdAt: profile.created_at || '',
        updatedAt: profile.created_at || '',
      };
    });
  }, [teacherProfiles, searchFilters]);

  if (isLoading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-destructive">Error loading teachers: {(error as Error).message}</div>;
  }

  if (filteredTeachers.length === 0) {
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
          {filteredTeachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.professionalDetails?.employeeId || 'Not set'}</TableCell>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.professionalDetails?.designation || 'Not set'}</TableCell>
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

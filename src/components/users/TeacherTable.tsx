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
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditTeacherDialog } from "./EditTeacherDialog";
import { LimitedTeacherDetails } from "./teacher/LimitedTeacherDetails";

interface TeacherTableProps {
  searchFilters?: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
  isTeacherView?: boolean;
  isStudentView?: boolean;
}

// Define the structure for the professional info from the database
interface ProfessionalInfo {
  employeeId?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  subjects?: string[];
  classesAssigned?: string[];
  qualifications?: string[];
  employmentType?: 'Full-time' | 'Part-time' | 'Contractual';
  specializations?: string[];
  previousExperience?: Array<{
    schoolName: string;
    position: string;
    duration: string;
  }>;
}

// Define the structure for the emergency contact from the database
interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export function TeacherTable({
  searchFilters,
  isTeacherView = false,
  isStudentView = false
}: {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
  isTeacherView?: boolean;
  isStudentView?: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });

  const filteredTeachers = useMemo(() => {
    console.log("Processing teacher profiles:", teacherProfiles);
    let filtered = teacherProfiles;

    if (searchFilters) {
      const { idSearch, nameSearch, globalSearch } = searchFilters;

      if (globalSearch) {
        const searchTerm = globalSearch.toLowerCase();
        filtered = filtered.filter(teacher => {
          const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
          const teacherIdDisplay = typeof teacher.teacher_details?.professional_info === 'object' 
            ? (teacher.teacher_details.professional_info as any)?.employeeId || ''
            : '';
          
          const searchableFields = [
            fullName,
            teacher.id.toLowerCase(),
            teacher.email?.toLowerCase() || '',
            teacherIdDisplay.toLowerCase()
          ];
          return searchableFields.some(field => field.includes(searchTerm));
        });
      } else {
        if (idSearch) {
          filtered = filtered.filter(teacher => {
            const teacherId = typeof teacher.teacher_details?.professional_info === 'object'
              ? (teacher.teacher_details.professional_info as any)?.employeeId || ''
              : '';
            return teacherId.toLowerCase().includes(idSearch.toLowerCase());
          });
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
      if (!profile.teacher_details) {
        console.warn(`Teacher profile ${profile.id} has no teacher_details`);
        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email || '',
          firstName: profile.first_name,
          lastName: profile.last_name,
          middleName: '',
          gender: 'other' as const,
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
            employmentType: 'Full-time' as const,
            subjects: [],
            classesAssigned: [], 
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
            contactName: '', 
            relationship: '',
            phone: '',
          },
          medicalInformation: {
            conditions: [],
            allergies: [],
          },
          createdAt: profile.created_at || '',
          updatedAt: profile.created_at || '',
        } as Teacher;
      }

      console.log(`Processing teacher ${profile.id} details:`, profile.teacher_details);

      // Parse professional_info as the correct type
      const professionalInfo: ProfessionalInfo = 
        typeof profile.teacher_details.professional_info === 'object' && profile.teacher_details.professional_info !== null
          ? profile.teacher_details.professional_info as ProfessionalInfo
          : {};
      
      // Parse emergency_contact as the correct type
      const emergencyContact: EmergencyContact = 
        typeof profile.teacher_details.emergency_contact === 'object' && profile.teacher_details.emergency_contact !== null
          ? profile.teacher_details.emergency_contact as EmergencyContact
          : {};
      
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
        contactInformation: profile.teacher_details.contact_info || {
          currentAddress: '',
          permanentAddress: '',
          personalPhone: '',
          schoolPhone: '',
          personalEmail: profile.email || '',
          schoolEmail: '',
        },
        professionalDetails: {
          employeeId: professionalInfo.employeeId || 'Not set',
          designation: professionalInfo.designation || 'Not set',
          department: professionalInfo.department || '',
          joiningDate: professionalInfo.joiningDate || '',
          subjects: Array.isArray(professionalInfo.subjects) ? professionalInfo.subjects : [],
          classesAssigned: Array.isArray(professionalInfo.classesAssigned) ? professionalInfo.classesAssigned : [],
          qualifications: Array.isArray(professionalInfo.qualifications) ? professionalInfo.qualifications : [],
          employmentType: professionalInfo.employmentType || 'Full-time' as const,
          specializations: Array.isArray(professionalInfo.specializations) ? professionalInfo.specializations : [],
          previousExperience: Array.isArray(professionalInfo.previousExperience) ? professionalInfo.previousExperience : [],
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
        performance: {
          lastReviewDate: '',
          rating: 0,
          feedback: '',
          awards: [],
        },
        emergency: {
          contactName: emergencyContact.name || '',
          relationship: emergencyContact.relationship || '',
          phone: emergencyContact.phone || '',
        },
        medicalInformation: profile.teacher_details.medical_info || {
          conditions: [],
          allergies: [],
        },
        createdAt: profile.created_at || '',
        updatedAt: profile.created_at || '',
      } as Teacher;
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

  const handleDelete = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteDialog(true);
  };

  const handleEdit = (teacher: Teacher) => {
    console.log("Selected teacher for editing:", teacher);
    setSelectedTeacher(teacher);
    setShowEditDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedTeacher.id);

      if (error) throw error;

      toast({
        title: "Teacher deleted",
        description: "Teacher has been successfully removed from the database."
      });
      
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Details</TableHead>
              {!isTeacherView && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => {
              const isCurrentUser = teacher.id === currentUserId;
              return (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.professionalDetails?.employeeId || 'Not set'}</TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.professionalDetails?.designation || 'Not set'}</TableCell>
                  <TableCell className="w-1/2">
                    <Accordion type="single" collapsible>
                      {isTeacherView && !isCurrentUser ? (
                        <LimitedTeacherDetails teacher={teacher} />
                      ) : (
                        <TeacherDetails teacher={teacher} />
                      )}
                    </Accordion>
                  </TableCell>
                  {!isTeacherView && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(teacher)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isTeacherView && (
        <>
          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Teacher"
            description="Are you sure you want to delete this teacher? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            isProcessing={isProcessing}
          />

          {selectedTeacher && (
            <EditTeacherDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              teacher={selectedTeacher}
            />
          )}
        </>
      )}
    </>
  );
}

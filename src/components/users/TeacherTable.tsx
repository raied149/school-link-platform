import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Eye } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Teacher } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { EditTeacherDialog } from "./EditTeacherDialog";

interface TeacherTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
  isTeacherView?: boolean;
  isStudentView?: boolean;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  searchFilters,
  isTeacherView = false,
  isStudentView = false
}) => {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // Fetch profiles with teacher role
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
      
      if (profilesError) {
        console.error("Error fetching teacher profiles:", profilesError);
        throw profilesError;
      }

      // Fetch teacher details for these profiles
      const teachersWithDetails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: teacherDetails, error: detailsError } = await supabase
            .from('teacher_details')
            .select('*')
            .eq('id', profile.id)
            .single();
          
          if (detailsError && detailsError.code !== 'PGRST116') {
            console.error(`Error fetching details for teacher ${profile.id}:`, detailsError);
            return null;
          }

          // Parse JSON fields properly
          const contactInfo = typeof teacherDetails?.contact_info === 'string' 
            ? JSON.parse(teacherDetails.contact_info) 
            : teacherDetails?.contact_info || {};
            
          const professionalInfo = typeof teacherDetails?.professional_info === 'string'
            ? JSON.parse(teacherDetails.professional_info)
            : teacherDetails?.professional_info || {};
            
          const emergencyContact = typeof teacherDetails?.emergency_contact === 'string'
            ? JSON.parse(teacherDetails.emergency_contact)
            : teacherDetails?.emergency_contact || {};
            
          const medicalInfo = typeof teacherDetails?.medical_info === 'string'
            ? JSON.parse(teacherDetails.medical_info)
            : teacherDetails?.medical_info || {};

          // Ensure gender is one of the allowed values
          const gender = (teacherDetails?.gender === 'male' || teacherDetails?.gender === 'female')
            ? teacherDetails.gender as 'male' | 'female'
            : 'other';

          // Map to our Teacher type
          return {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: profile.email || '',
            role: profile.role,
            gender: gender,
            dateOfBirth: teacherDetails?.date_of_birth || '',
            nationality: teacherDetails?.nationality || '',
            contactInformation: {
              currentAddress: contactInfo.currentAddress || '',
              permanentAddress: contactInfo.permanentAddress || '',
              personalPhone: contactInfo.personalPhone || '',
              schoolPhone: contactInfo.schoolPhone || '',
              personalEmail: contactInfo.personalEmail || '',
              schoolEmail: contactInfo.schoolEmail || '',
            },
            professionalDetails: {
              employeeId: professionalInfo.employeeId || '',
              designation: professionalInfo.designation || '',
              department: professionalInfo.department || '',
              subjects: professionalInfo.subjects || [],
              classesAssigned: professionalInfo.classesAssigned || [],
              joiningDate: professionalInfo.joiningDate || '',
              qualifications: professionalInfo.qualifications || [],
              employmentType: professionalInfo.employmentType || 'Full-time',
            },
            attendance: { present: 0, absent: 0, leave: 0 }, // Default values
            leaveBalance: { sick: 0, casual: 0, vacation: 0 }, // Default values
            performance: {},
            emergency: {
              contactName: emergencyContact.name || '',
              relationship: emergencyContact.relationship || '',
              phone: emergencyContact.phone || '',
            },
            medicalInformation: {
              conditions: medicalInfo.conditions || [],
              allergies: medicalInfo.allergies || [],
            },
            createdAt: profile.created_at,
            updatedAt: profile.created_at,
            status: 'active' // Default status
          } as Teacher;
        })
      );

      // Filter out any null entries (errors)
      return teachersWithDetails.filter(Boolean) as Teacher[];
    }
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      // First delete teacher details
      const { error: detailsError } = await supabase
        .from('teacher_details')
        .delete()
        .eq('id', teacherId);
      
      if (detailsError) throw detailsError;

      // Then delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', teacherId);
      
      if (profileError) throw profileError;
      
      return teacherId;
    },
    onSuccess: () => {
      toast({
        title: "Teacher deleted",
        description: "The teacher has been successfully removed."
      });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error) => {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredTeachers = teachers.filter((teacher) => {
    const idMatches = teacher.id.toLowerCase().includes(searchFilters.idSearch.toLowerCase());
    const nameMatches = teacher.name.toLowerCase().includes(searchFilters.nameSearch.toLowerCase());
    const globalMatches =
      teacher.name.toLowerCase().includes(searchFilters.globalSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchFilters.globalSearch.toLowerCase());

    return idMatches && nameMatches && globalMatches;
  });

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTeacher) {
      deleteTeacherMutation.mutate(selectedTeacher.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleViewTeacher = (teacherId: string) => {
    navigate(`/teachers/${teacherId}`);
  };

  const isCurrentUser = (teacherId: string) => {
    return user?.id === teacherId;
  };

  if (isLoading) {
    return <div>Loading teacher data...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            {!isTeacherView && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isTeacherView ? 4 : 5} className="text-center py-4">
                No teachers found
              </TableCell>
            </TableRow>
          ) : (
            filteredTeachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.id.slice(0, 8)}...</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  <Badge variant='default'>
                    active
                  </Badge>
                </TableCell>
                {!isTeacherView && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewTeacher(teacher.id)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      
                      {!isTeacherView && !isCurrentUser(teacher.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTeacher(teacher)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(teacher)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
      />

      {selectedTeacher && (
        <EditTeacherDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          teacher={selectedTeacher}
        />
      )}
    </>
  );
};

export default TeacherTable;


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
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditStudentDialog } from "./EditStudentDialog";
import { useAuth } from "@/contexts/AuthContext";

interface StudentTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
  isTeacherView?: boolean;
}

export function StudentTable({ searchFilters, isTeacherView = false }: StudentTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Fetch all profiles with role 'student' and their details
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students', user?.id],
    queryFn: async () => {
      console.log("Fetching students from profiles table");
      
      if (isTeacherView && user?.role === 'teacher') {
        console.log("Teacher view: fetching only assigned students");
        
        // First get teacher's assigned sections
        const { data: teacherAssignments, error: assignmentError } = await supabase
          .from('timetable')
          .select('section_id')
          .eq('teacher_id', user.id)
          .distinct();
        
        if (assignmentError) {
          console.error("Error fetching teacher assignments:", assignmentError);
          throw assignmentError;
        }
        
        if (!teacherAssignments?.length) {
          console.log("No sections assigned to this teacher");
          return [];
        }
        
        const sectionIds = teacherAssignments.map(item => item.section_id);
        console.log("Teacher is assigned to sections:", sectionIds);
        
        // Get students from those sections
        const { data: studentSections, error: sectionError } = await supabase
          .from('student_sections')
          .select('student_id')
          .in('section_id', sectionIds);
        
        if (sectionError) {
          console.error("Error fetching student sections:", sectionError);
          throw sectionError;
        }
        
        if (!studentSections?.length) {
          console.log("No students in teacher's sections");
          return [];
        }
        
        const studentIds = studentSections.map(item => item.student_id);
        
        // Get profiles for these students
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', studentIds)
          .eq('role', 'student');
          
        if (profilesError) {
          console.error("Error fetching student profiles:", profilesError);
          throw profilesError;
        }
        
        // Fetch student details
        const { data: detailsData, error: detailsError } = await supabase
          .from('student_details')
          .select('*')
          .in('id', studentIds);
        
        if (detailsError) {
          console.error("Error fetching student details:", detailsError);
          // Don't throw here, we may have profiles without details
        }
        
        // Combine profiles and details
        const studentsWithDetails = profilesData.map(profile => {
          // Find corresponding details, if any
          const details = detailsData?.find(d => d.id === profile.id);
          return { ...profile, details };
        });
        
        console.log("Retrieved students for teacher:", studentsWithDetails);
        return studentsWithDetails || [];
      } else {
        // Admin view - fetch all students
        // Fetch student profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');
          
        if (profilesError) {
          console.error("Error fetching student profiles:", profilesError);
          throw profilesError;
        }
        
        // Fetch student details
        const { data: detailsData, error: detailsError } = await supabase
          .from('student_details')
          .select('*');
        
        if (detailsError) {
          console.error("Error fetching student details:", detailsError);
          // Don't throw here, we may have profiles without details
        }
        
        // Combine profiles and details
        const studentsWithDetails = profilesData.map(profile => {
          // Find corresponding details, if any
          const details = detailsData?.find(d => d.id === profile.id);
          return { ...profile, details };
        });
        
        console.log("Retrieved all students:", studentsWithDetails);
        return studentsWithDetails || [];
      }
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

  const handleDelete = async (student: StudentDetail) => {
    setSelectedStudent(student);
    setShowDeleteDialog(true);
  };

  const handleEdit = (student: StudentDetail) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedStudent.id);

      if (error) throw error;

      toast({
        title: "Student deleted",
        description: "Student has been successfully removed from the database."
      });
      
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

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
          : isTeacherView 
            ? "No students found in your assigned sections."
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
      admissionNumber: profile.details?.admission_number || profile.id.substring(0, 8),
      createdAt: profile.created_at,
      updatedAt: profile.created_at,
      dateOfBirth: profile.details?.dateofbirth || '2000-01-01',
      gender: profile.details?.gender || 'other',
      language: profile.details?.language || 'English',
      nationality: profile.details?.nationality || 'Not specified',
      contactNumber: '',
      address: '',
      currentClassId: '',
      currentSectionId: '',
      academicYearId: '',
      parentId: '',
      guardian: profile.details?.guardian || {
        name: 'Not specified',
        email: 'not.specified@example.com',
        phone: 'Not specified',
        relationship: 'Not specified'
      },
      medical: profile.details?.medical || {
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Details</TableHead>
              {!isTeacherView && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const studentDetail = mapProfileToStudentDetail(student);
              return (
                <TableRow key={student.id}>
                  <TableCell>{studentDetail.admissionNumber}</TableCell>
                  <TableCell>{studentDetail.name}</TableCell>
                  <TableCell>{student.email || 'No email'}</TableCell>
                  <TableCell className="w-1/2">
                    <Accordion type="single" collapsible>
                      <StudentDetails student={studentDetail} />
                    </Accordion>
                  </TableCell>
                  {!isTeacherView && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(studentDetail)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(studentDetail)}
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
            title="Delete Student"
            description="Are you sure you want to delete this student? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            isProcessing={isProcessing}
          />

          {selectedStudent && (
            <EditStudentDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              student={selectedStudent}
            />
          )}
        </>
      )}
    </>
  );
}

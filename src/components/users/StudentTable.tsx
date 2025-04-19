
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

interface StudentTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
}

export function StudentTable({ searchFilters }: StudentTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
  );
}

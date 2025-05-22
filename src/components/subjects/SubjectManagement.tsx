import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash, Users, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { SubjectTeacherAssignment } from "./SubjectTeacherAssignment";
import { SectionTeacherAssignment } from "./SectionTeacherAssignment";
import { supabase } from "@/integrations/supabase/client";

interface SubjectManagementProps {
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
}

export function SubjectManagement({ 
  classId, 
  sectionId, 
  academicYearId 
}: SubjectManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [isAssignSectionTeacherOpen, setIsAssignSectionTeacherOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  // Fetch subjects for this class from Supabase using the subject_classes join table
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', classId, sectionId],
    queryFn: async () => {
      if (!classId) return [];
      
      // First get subject IDs from subject_classes join table
      const { data: subjectClasses, error: subjectClassesError } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', classId);
        
      if (subjectClassesError) {
        console.error("Error fetching subject classes:", subjectClassesError);
        throw subjectClassesError;
      }
      
      if (!subjectClasses || subjectClasses.length === 0) {
        console.log("No subjects assigned to this class");
        return [];
      }
      
      const subjectIds = subjectClasses.map(row => row.subject_id);
      
      // Then get actual subject details and teacher assignments
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          teacher_subjects (
            teacher_id,
            profiles:teacher_id (
              first_name,
              last_name
            )
          )
        `)
        .in('id', subjectIds);
        
      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        throw subjectsError;
      }

      // Get section-specific teacher assignments if a section is selected
      let sectionTeacherAssignments = {};
      if (sectionId) {
        try {
          // Use direct query instead of RPC function
          const { data: sectionTeachers, error: sectionTeachersError } = await supabase
            .from('subject_section_teachers')
            .select(`
              subject_id,
              teacher_id,
              profiles:teacher_id (
                first_name,
                last_name
              )
            `)
            .eq('section_id', sectionId)
            .in('subject_id', subjectIds);
            
          if (sectionTeachersError) {
            console.error("Error fetching section teacher assignments:", sectionTeachersError);
          } else if (sectionTeachers) {
            // Create a map of subject_id to section teacher
            sectionTeachers.forEach(item => {
              sectionTeacherAssignments[item.subject_id] = {
                id: item.teacher_id,
                name: item.profiles ? `${item.profiles.first_name} ${item.profiles.last_name}` : 'Unknown'
              };
            });
          }
        } catch (error) {
          console.error("Error in section teacher query:", error);
        }
      }
      
      // Transform the data for easier use in the UI
      return (subjectsData || []).map(subject => ({
        ...subject,
        assignedTeachers: subject.teacher_subjects?.map((ts: any) => ({
          id: ts.teacher_id,
          name: ts.profiles ? `${ts.profiles.first_name} ${ts.profiles.last_name}` : 'Unknown'
        })) || [],
        sectionTeacher: sectionTeacherAssignments[subject.id] || null
      }));
    },
    enabled: !!classId
  });

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Create the subject
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          name: data.name,
          code: data.code
        })
        .select()
        .single();
        
      if (subjectError) {
        console.error("Error creating subject:", subjectError);
        throw subjectError;
      }
      
      // 2. Assign the subject to the class
      const { error: assignError } = await supabase
        .from('subject_classes')
        .insert({
          subject_id: newSubject.id,
          class_id: classId
        });
        
      if (assignError) {
        console.error("Error assigning subject to class:", assignError);
        throw assignError;
      }
      
      return newSubject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', classId] });
      toast({
        title: "Subject created",
        description: "The subject has been created and assigned to this class."
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create subject: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First remove the subject-class assignment
      const { error: unassignError } = await supabase
        .from('subject_classes')
        .delete()
        .eq('subject_id', id)
        .eq('class_id', classId!);
        
      if (unassignError) {
        console.error("Error removing subject assignment:", unassignError);
        throw unassignError;
      }
      
      // We're just removing the assignment, not deleting the subject itself
      // If you want to delete the subject, uncomment the code below
      /*
      const { error: deleteError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error("Error deleting subject:", deleteError);
        throw deleteError;
      }
      */
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', classId] });
      toast({
        title: "Subject removed",
        description: "The subject has been removed from this class."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove subject: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this subject from this class?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignTeacher = (subject: any) => {
    setSelectedSubject(subject);
    setIsAssignTeacherOpen(true);
  };

  const handleAssignSectionTeacher = (subject: any) => {
    setSelectedSubject(subject);
    setIsAssignSectionTeacherOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Subject Management</h2>
            <p className="text-muted-foreground">
              Manage subjects for this class and assign teachers
            </p>
          </div>
          <Button onClick={() => {
            setSelectedSubject(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Loading subjects...</div>
        ) : subjects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Subject Teachers</TableHead>
                {sectionId && <TableHead>Section Teacher</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject: any) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>
                    {subject.assignedTeachers && subject.assignedTeachers.length > 0 
                      ? subject.assignedTeachers.map((teacher: any) => teacher.name).join(', ')
                      : "Not assigned"}
                  </TableCell>
                  {sectionId && (
                    <TableCell>
                      {subject.sectionTeacher 
                        ? subject.sectionTeacher.name 
                        : "Not assigned"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignTeacher(subject)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign Teachers
                      </Button>
                      {sectionId && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAssignSectionTeacher(subject)}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Assign to Section
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subject.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No subjects added yet to this class</p>
          </div>
        )}
      </Card>

      <SubjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
        subject={selectedSubject}
        mode={selectedSubject ? "edit" : "create"}
      />

      <SubjectTeacherAssignment
        open={isAssignTeacherOpen}
        onOpenChange={setIsAssignTeacherOpen}
        subject={selectedSubject}
        sectionId={sectionId}
        academicYearId={academicYearId}
      />

      {sectionId && (
        <SectionTeacherAssignment
          open={isAssignSectionTeacherOpen}
          onOpenChange={setIsAssignSectionTeacherOpen}
          subjectId={selectedSubject?.id}
          classId={classId}
          sectionId={sectionId}
          academicYearId={academicYearId}
        />
      )}
    </div>
  );
}

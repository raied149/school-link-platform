
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
import { Plus, Pencil, Trash, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { SubjectTeacherAssignment } from "./SubjectTeacherAssignment";
import { subjectService } from "@/services/subjectService";
import { Subject } from "@/types";

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
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Fetch subjects for this class
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => subjectService.getSubjectsByClass(classId!),
    enabled: !!classId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Subject, 'id'>) => {
      return subjectService.createSubject({
        ...data,
        classIds: [classId!]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', classId] });
      toast({
        title: "Subject created",
        description: "The subject has been created successfully.",
      });
      setIsFormOpen(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return subjectService.deleteSubject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', classId] });
      toast({
        title: "Subject deleted",
        description: "The subject has been removed successfully.",
      });
    },
  });

  const handleCreate = (data: Omit<Subject, 'id'>) => {
    createMutation.mutate(data);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignTeacher = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsAssignTeacherOpen(true);
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
          <Button onClick={() => setIsFormOpen(true)}>
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
                <TableHead>Assigned Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>
                    {/* In a real app, you would fetch and display the assigned teacher */}
                    Not assigned
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignTeacher(subject)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign Teacher
                      </Button>
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
            <p className="text-muted-foreground">No subjects added yet</p>
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
    </div>
  );
}

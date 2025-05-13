
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";
import { useAuth } from "@/contexts/AuthContext";

import { format, isPast, isFuture, parseISO } from "date-fns";
import { BookOpen, Plus, Pencil, Trash2, FileText } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const ExamsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isStudentView = user?.role === 'student';
  
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch exams based on user role
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', user?.id, user?.role],
    queryFn: async () => {
      if (isStudentView) {
        // For students, fetch only exams assigned to their sections
        const studentId = user?.id;
        
        // First get student's section
        const { data: sectionData, error: sectionError } = await supabase
          .from('student_sections')
          .select('section_id')
          .eq('student_id', studentId);
          
        if (sectionError) throw sectionError;
        if (!sectionData?.length) return [];
        
        // Get all section IDs the student belongs to
        const sectionIds = sectionData.map(item => item.section_id);
        
        // Get exams assigned to these sections
        const { data, error } = await supabase
          .from('exam_assignments')
          .select(`
            exams (
              id,
              name,
              date,
              max_score,
              subject_id,
              subjects (
                name,
                code
              )
            )
          `)
          .in('section_id', sectionIds);
          
        if (error) throw error;
        
        // Extract the exams and remove duplicates
        const examData = data
          .map(item => item.exams)
          .filter((exam, index, self) => 
            index === self.findIndex(e => e.id === exam.id)
          );
        
        return examData;
      } else {
        // For teachers and admins, fetch all exams
        const { data, error } = await supabase
          .from('exams')
          .select(`
            *,
            subjects (
              name,
              code
            )
          `)
          .order('date', { ascending: false });
          
        if (error) throw error;
        return data;
      }
    }
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
        
      if (error) throw error;
      return examId;
    },
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete exam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const handleEditExam = (exam: any) => {
    setSelectedExam(exam);
    setIsExamFormOpen(true);
  };

  const handleDeleteExam = (exam: any) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedExam) {
      deleteExamMutation.mutate(selectedExam.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExamFormClose = (success?: boolean) => {
    setIsExamFormOpen(false);
    setSelectedExam(null);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    }
  };

  const handleViewExam = (examId: string) => {
    navigate(`/exams/${examId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tests & Exams</h1>
        {!isStudentView && (
          <Button onClick={() => setIsExamFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            {isStudentView ? "My Exams" : "All Exams"}
          </h2>
        </div>

        {exams.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {isStudentView 
                ? "No exams have been assigned to you yet."
                : "No exams have been created yet."}
            </p>
            {!isStudentView && (
              <Button onClick={() => setIsExamFormOpen(true)}>
                Create Your First Exam
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam: any) => {
                  const examDate = parseISO(exam.date);
                  const isPastExam = isPast(examDate);
                  const isFutureExam = isFuture(examDate);
                  const subjectName = exam.subjects?.name || "No Subject";

                  return (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{subjectName}</TableCell>
                      <TableCell>{format(examDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{exam.max_score}</TableCell>
                      <TableCell>
                        {isPastExam ? (
                          <Badge variant="outline" className="bg-muted">Completed</Badge>
                        ) : isFutureExam ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary">Upcoming</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">Today</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewExam(exam.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          
                          {!isStudentView && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditExam(exam)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteExam(exam)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {!isStudentView && (
        <>
          <TestExamFormDialog
            open={isExamFormOpen}
            onOpenChange={handleExamFormClose}
            exam={selectedExam}
          />
          
          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Exam"
            description="Are you sure you want to delete this exam? All associated data including student results will be permanently removed. This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default ExamsPage;

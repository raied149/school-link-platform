
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  getExamById, 
  getExamAssignments,
  getStudentExamResults,
  deleteExam
} from "@/services/examService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function useExamDetail(examId: string | undefined) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [activeTab, setActiveTab] = useState("students");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: exam, isLoading: isLoadingExam, refetch: refetchExam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examId ? getExamById(examId) : null,
    enabled: !!examId
  });
  
  const { 
    data: assignments = [], 
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
    error: assignmentsError
  } = useQuery({
    queryKey: ['examAssignments', examId],
    queryFn: () => examId ? getExamAssignments(examId) : [],
    enabled: !!examId
  });
  
  // Fetch class data
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch student results when a section is selected
  const { 
    data: studentResults, 
    isLoading: isLoadingResults,
    refetch: refetchResults
  } = useQuery({
    queryKey: ['examResults', examId, selectedSection],
    queryFn: () => examId && selectedSection ? 
      getStudentExamResults(examId, selectedSection) : [],
    enabled: !!examId && !!selectedSection
  });

  useEffect(() => {
    // Auto-select the first section when assignments load
    if (assignments && assignments.length > 0 && !selectedSection) {
      setSelectedSection(assignments[0].section_id);
    }
  }, [assignments, selectedSection]);

  // Get all available sections for this exam
  const availableSections = assignments && assignments.length > 0 ? 
    assignments
      .filter(a => a.sections)
      .map(a => ({
        id: a.sections.id,
        name: a.sections.name
      })) : [];

  // Handle successful mark entry
  const handleMarksUpdated = () => {
    refetchResults();
    toast({
      title: "Marks Updated",
      description: "Student marks have been saved successfully."
    });
  };

  // Handle successful exam edit
  const handleExamUpdated = () => {
    refetchExam();
    refetchAssignments();
    toast({
      title: "Exam Updated",
      description: "Exam details have been updated successfully."
    });
    setEditDialogOpen(false);
  };

  // Handle exam deletion
  const handleDeleteExam = async () => {
    if (!examId) return;
    
    setIsDeleting(true);
    try {
      await deleteExam(examId);
      toast({
        title: "Exam Deleted",
        description: "The exam has been successfully deleted."
      });
      navigate("/exams");
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Error",
        description: "Failed to delete the exam. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Export results as CSV
  const exportResultsAsCSV = () => {
    if (!studentResults || !exam) return;
    
    const csvHeader = "Student ID,Student Name,Marks,Max Marks,Percentage,Feedback\n";
    const csvRows = studentResults.map(item => {
      const student = item.student;
      const result = item.result;
      const studentId = student.student_details?.admission_number || student.id.substring(0, 8);
      const studentName = `${student.first_name} ${student.last_name}`;
      const marks = result ? result.marks_obtained : 0;
      const percentage = exam.max_score > 0 ? 
        Math.round((marks / exam.max_score) * 100) : 0;
      const feedback = result?.feedback || '';
      
      return `"${studentId}","${studentName}","${marks}","${exam.max_score}","${percentage}%","${feedback}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exam.name}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get the class name
  const getClassName = () => {
    if (!assignments || !assignments.length || !classes) return null;
    
    const firstAssignment = assignments[0];
    if (!firstAssignment.sections || !firstAssignment.sections.class_id) return null;
    
    const classId = firstAssignment.sections.class_id;
    const classObj = classes.find((c: any) => c.id === classId);
    return classObj?.name || null;
  };

  return {
    exam,
    assignments,
    studentResults,
    selectedSection,
    setSelectedSection,
    activeTab,
    setActiveTab,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isLoadingExam,
    isLoadingAssignments,
    isLoadingResults,
    assignmentsError,
    handleMarksUpdated,
    handleExamUpdated,
    handleDeleteExam,
    exportResultsAsCSV,
    availableSections,
    className: getClassName(),
    navigate
  };
}


import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getStudentsInSection, saveStudentExamResult, bulkSaveStudentExamResults } from "@/services/examService";
import { useToast } from "@/hooks/use-toast";

// Stats interface
export interface Stats {
  min: number;
  max: number;
  avg: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
}

export function useMarkEntry(examId: string) {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [originalMarks, setOriginalMarks] = useState<Record<string, number>>({});
  const [originalFeedback, setOriginalFeedback] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  
  const {
    data: students = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['students', examId, selectedSection],
    queryFn: () => selectedSection ? getStudentsInSection(examId, selectedSection) : Promise.resolve([]),
    enabled: !!selectedSection
  });
  
  // Initialize marks and feedback when students data changes
  useEffect(() => {
    if (students && students.length > 0) {
      const newMarks: Record<string, number> = {};
      const newFeedback: Record<string, string> = {};
      
      students.forEach((student: any) => {
        const result = student.result || {};
        newMarks[student.student.id] = result.marks_obtained || 0;
        newFeedback[student.student.id] = result.feedback || '';
      });
      
      setMarks(newMarks);
      setFeedback(newFeedback);
      setOriginalMarks({...newMarks});
      setOriginalFeedback({...newFeedback});
      setSaveSuccess(false);
    }
  }, [students]);

  // Check if changes have been made
  const hasChanges = JSON.stringify(marks) !== JSON.stringify(originalMarks) || 
                    JSON.stringify(feedback) !== JSON.stringify(originalFeedback);

  // Calculate stats
  const calculateStats = (): Stats => {
    if (!students || students.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        passCount: 0,
        failCount: 0,
        passPercentage: 0
      };
    }
    
    const allMarks = Object.values(marks);
    if (allMarks.length === 0) return { min: 0, max: 0, avg: 0, passCount: 0, failCount: 0, passPercentage: 0 };
    
    // Get the maximum possible score from the first student's exam
    const maxScore = students[0].exam?.max_score || 100;
    const passMark = maxScore * 0.4; // Assume 40% is passing mark
    
    const min = Math.min(...allMarks);
    const max = Math.max(...allMarks);
    const sum = allMarks.reduce((a, b) => a + b, 0);
    const avg = allMarks.length > 0 ? sum / allMarks.length : 0;
    
    const passCount = allMarks.filter(mark => mark >= passMark).length;
    const failCount = allMarks.filter(mark => mark < passMark).length;
    const passPercentage = allMarks.length > 0 ? (passCount / allMarks.length) * 100 : 0;
    
    return {
      min,
      max,
      avg,
      passCount,
      failCount,
      passPercentage
    };
  };
  
  const stats = calculateStats();
  
  // Handle mark changes
  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);
    const newMarks = { ...marks };
    
    if (!isNaN(numValue)) {
      newMarks[studentId] = numValue;
    } else {
      newMarks[studentId] = 0;
    }
    
    setMarks(newMarks);
    setSaveSuccess(false);
  };

  // Handle feedback changes
  const handleFeedbackChange = (studentId: string, value: string) => {
    const newFeedback = { ...feedback };
    newFeedback[studentId] = value;
    setFeedback(newFeedback);
    setSaveSuccess(false);
  };
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { studentId: string; mark: number; feedback: string }) => {
      return saveStudentExamResult({
        examId,
        studentId: data.studentId,
        marks: data.mark,
        feedback: data.feedback
      });
    }
  });

  // Bulk save mutation
  const bulkSaveMutation = useMutation({
    mutationFn: async (data: { 
      results: { studentId: string; mark: number; feedback: string }[] 
    }) => {
      return bulkSaveStudentExamResults({
        examId,
        results: data.results
      });
    }
  });

  // Handle saving marks and feedback
  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      // Prepare data for bulk save
      const results = Object.keys(marks).map(studentId => ({
        studentId,
        mark: marks[studentId],
        feedback: feedback[studentId] || ''
      }));
      
      await bulkSaveMutation.mutateAsync({ results });
      
      // Update original values to match current values
      setOriginalMarks({...marks});
      setOriginalFeedback({...feedback});
      setSaveSuccess(true);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Marks saved successfully",
      });
      
      // Call callback
      onMarksUpdated();
      
    } catch (error) {
      console.error("Error saving marks:", error);
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to update a single student's mark
  const updateSingleMark = async (studentId: string, mark: number, studentFeedback: string) => {
    try {
      await saveMutation.mutateAsync({ 
        studentId, 
        mark, 
        feedback: studentFeedback 
      });
      
      // Update original values
      setOriginalMarks((prev) => ({...prev, [studentId]: mark}));
      setOriginalFeedback((prev) => ({...prev, [studentId]: studentFeedback}));
      
      toast({
        title: "Success",
        description: "Mark updated successfully",
      });
      
      // Call callback
      onMarksUpdated();
      
      return true;
    } catch (error) {
      console.error("Error updating mark:", error);
      toast({
        title: "Error",
        description: "Failed to update mark. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const onMarksUpdated = () => {
    refetch();
  };

  return {
    isLoading,
    isSaving: saveMutation.isPending || bulkSaveMutation.isPending,
    students,
    marks,
    feedback,
    hasChanges,
    saveSuccess,
    stats,
    handleMarkChange,
    handleFeedbackChange,
    handleSave,
    updateSingleMark,
    selectedSection,
    setSelectedSection,
    onMarksUpdated
  };
}

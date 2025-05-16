
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

// Function to get students in section with their exam results
const getStudentsInSection = async (examId: string, sectionId: string) => {
  console.log("Fetching students for examId:", examId, "sectionId:", sectionId);
  
  if (!sectionId) {
    console.log("No section ID provided, returning empty array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('student_sections')
      .select(`
        student_id,
        student:profiles!student_id (
          id,
          first_name,
          last_name,
          student_details (
            admission_number
          )
        )
      `)
      .eq('section_id', sectionId);
      
    if (error) throw error;
    
    console.log("Found student sections:", data);
    
    if (!data || data.length === 0) {
      console.log("No students found in section:", sectionId);
      return [];
    }
    
    // Get exam data once
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();
    
    if (examError) throw examError;
    
    // Get results for students in this section
    const studentIds = data.map(item => item.student_id);
    console.log("Student IDs:", studentIds);
    
    const { data: resultsData, error: resultsError } = await supabase
      .from('student_exam_results')
      .select('*')
      .eq('exam_id', examId)
      .in('student_id', studentIds);
      
    if (resultsError) throw resultsError;
    
    console.log("Exam results:", resultsData);
    
    // Map results to students
    const studentsWithResults = data.map(item => ({
      student: item.student,
      exam: examData,
      result: resultsData.find(r => r.student_id === item.student_id)
    }));
    
    console.log("Students with results:", studentsWithResults);
    return studentsWithResults;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Function to save a single student exam result
const saveStudentExamResult = async (params: {
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  feedback?: string;
}) => {
  const { data, error } = await supabase
    .from('student_exam_results')
    .upsert({
      exam_id: params.exam_id,
      student_id: params.student_id,
      marks_obtained: params.marks_obtained,
      feedback: params.feedback || '',
      updated_at: new Date().toISOString()
    })
    .select();
    
  if (error) throw error;
  return data;
};

// Function to bulk save student exam results
const bulkSaveStudentExamResults = async (params: {
  exam_id: string;
  results: {
    student_id: string;
    mark: number;
    feedback: string;
  }[];
}) => {
  const dataToInsert = params.results.map(result => ({
    exam_id: params.exam_id,
    student_id: result.student_id,
    marks_obtained: result.mark,
    feedback: result.feedback || '',
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('student_exam_results')
    .upsert(dataToInsert)
    .select();
    
  if (error) throw error;
  return data;
};

export function useMarkEntry(examId: string, initialSectionId: string = "") {
  const [selectedSection, setSelectedSection] = useState<string>(initialSectionId);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [originalMarks, setOriginalMarks] = useState<Record<string, number>>({});
  const [originalFeedback, setOriginalFeedback] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Update selected section when initialSectionId changes
  useEffect(() => {
    if (initialSectionId) {
      setSelectedSection(initialSectionId);
    }
  }, [initialSectionId]);
  
  const {
    data: students = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['students', examId, selectedSection],
    queryFn: () => selectedSection ? getStudentsInSection(examId, selectedSection) : Promise.resolve([]),
    enabled: !!selectedSection && !!examId
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
    mutationFn: async (data: { student_id: string; mark: number; feedback: string }) => {
      return saveStudentExamResult({
        exam_id: examId,
        student_id: data.student_id,
        marks_obtained: data.mark,
        feedback: data.feedback
      });
    }
  });

  // Bulk save mutation
  const bulkSaveMutation = useMutation({
    mutationFn: async (data: { 
      results: { student_id: string; mark: number; feedback: string }[] 
    }) => {
      return bulkSaveStudentExamResults({
        exam_id: examId,
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
        student_id: studentId,
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
        student_id: studentId, 
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

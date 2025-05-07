
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getStudentExamResults, bulkSaveStudentExamResults } from "@/services/examService";

interface Stats {
  avg: number;
  highest: number;
  lowest: number;
  pass: number;
}

export function useMarkEntry(
  examId: string, 
  sectionId: string, 
  maxMarks: number,
  onMarksUpdated?: () => void
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchStudentResults = async () => {
      setIsLoading(true);
      try {
        // Don't fetch if sectionId is "all-sections"
        if (sectionId === "all-sections") {
          setStudents([]);
          setIsLoading(false);
          return;
        }
        
        const data = await getStudentExamResults(examId, sectionId);
        setStudents(data);
        
        // Initialize marks and feedback from existing data
        const initialMarks: Record<string, number> = {};
        const initialFeedback: Record<string, string> = {};
        
        data.forEach((item) => {
          if (item.result) {
            initialMarks[item.student.id] = item.result.marks_obtained;
            initialFeedback[item.student.id] = item.result.feedback || '';
          } else {
            initialMarks[item.student.id] = 0;
            initialFeedback[item.student.id] = '';
          }
        });
        
        setMarks(initialMarks);
        setFeedback(initialFeedback);
      } catch (error) {
        console.error("Error fetching student results:", error);
        toast({
          title: "Error",
          description: "Failed to load student list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (examId && sectionId) {
      fetchStudentResults();
    }
  }, [examId, sectionId, toast]);

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = Number(value);
    // Validate the input
    if (numValue < 0) {
      setMarks({...marks, [studentId]: 0});
    } else if (numValue > maxMarks) {
      setMarks({...marks, [studentId]: maxMarks});
    } else {
      setMarks({...marks, [studentId]: numValue});
    }
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleFeedbackChange = (studentId: string, value: string) => {
    setFeedback({...feedback, [studentId]: value});
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    
    try {
      // Prepare data for bulk save
      const resultsToSave = students.map((student) => ({
        exam_id: examId,
        student_id: student.student.id,
        marks_obtained: marks[student.student.id] || 0,
        feedback: feedback[student.student.id] || undefined
      }));

      await bulkSaveStudentExamResults(resultsToSave);
      
      toast({
        title: "Success",
        description: "Student marks have been saved successfully.",
      });
      
      setHasChanges(false);
      setSaveSuccess(true);
      
      if (onMarksUpdated) {
        onMarksUpdated();
      }
    } catch (error) {
      console.error("Error saving student marks:", error);
      toast({
        title: "Error",
        description: "Failed to save student marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats
  const calculateStats = (): Stats => {
    if (!students.length) return { avg: 0, highest: 0, lowest: 0, pass: 0 };
    
    const markValues = Object.values(marks).filter(mark => mark > 0);
    if (!markValues.length) return { avg: 0, highest: 0, lowest: 0, pass: 0 };
    
    const avg = markValues.reduce((sum, mark) => sum + mark, 0) / markValues.length;
    const highest = Math.max(...markValues);
    const lowest = Math.min(...markValues);
    const passPercentage = 40; // Pass threshold percentage
    const passThreshold = (maxMarks * passPercentage) / 100;
    const passCount = markValues.filter(mark => mark >= passThreshold).length;
    const pass = markValues.length ? (passCount / markValues.length) * 100 : 0;
    
    return { avg, highest, lowest, pass };
  };

  return {
    isLoading,
    isSaving,
    students,
    marks,
    feedback,
    hasChanges,
    saveSuccess,
    stats: calculateStats(),
    handleMarkChange,
    handleFeedbackChange,
    handleSave
  };
}

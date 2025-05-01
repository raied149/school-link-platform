
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getStudentExamResults, bulkSaveStudentExamResults } from "@/services/examService";
import { Loader2, Save } from "lucide-react";

interface MarkEntryTableProps {
  examId: string;
  sectionId: string;
  maxMarks: number;
}

export function MarkEntryTable({ examId, sectionId, maxMarks }: MarkEntryTableProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchStudentResults = async () => {
      setIsLoading(true);
      try {
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
  };

  const handleFeedbackChange = (studentId: string, value: string) => {
    setFeedback({...feedback, [studentId]: value});
    setHasChanges(true);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No students found in this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Mark Entry</h3>
          <p className="text-sm text-muted-foreground">
            Enter marks for each student (max: {maxMarks})
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Marks
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Marks (/{maxMarks})</TableHead>
              <TableHead>Feedback (Optional)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((item) => (
              <TableRow key={item.student.id}>
                <TableCell>
                  {item.student.student_details?.admission_number || item.student.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {item.student.first_name} {item.student.last_name}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={maxMarks}
                    value={marks[item.student.id] || 0}
                    onChange={(e) => handleMarkChange(item.student.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    value={feedback[item.student.id] || ''}
                    onChange={(e) => handleFeedbackChange(item.student.id, e.target.value)}
                    placeholder="Add feedback (optional)"
                    className="h-10 min-h-0 resize-none"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

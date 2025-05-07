
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
import { Loader2, Save, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarkEntryTableProps {
  examId: string;
  sectionId: string;
  maxMarks: number;
  onMarksUpdated?: () => void;
}

export function MarkEntryTable({ examId, sectionId, maxMarks, onMarksUpdated }: MarkEntryTableProps) {
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
  const calculateStats = () => {
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
  
  const stats = calculateStats();

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
          ) : saveSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveSuccess ? "Saved" : "Save Marks"}
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-muted rounded p-3">
          <div className="text-sm text-muted-foreground">Average Score</div>
          <div className="text-xl font-bold">{stats.avg.toFixed(1)} / {maxMarks}</div>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="text-sm text-muted-foreground">Highest Score</div>
          <div className="text-xl font-bold">{stats.highest} / {maxMarks}</div>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="text-sm text-muted-foreground">Lowest Score</div>
          <div className="text-xl font-bold">{stats.lowest} / {maxMarks}</div>
        </div>
        <div className="bg-muted rounded p-3">
          <div className="text-sm text-muted-foreground">Pass Percentage</div>
          <div className="text-xl font-bold">{stats.pass.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Marks (/{maxMarks})</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Feedback (Optional)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((item) => {
              const student = item.student;
              const currentMark = marks[student.id] || 0;
              const percentage = maxMarks > 0 ? Math.round((currentMark / maxMarks) * 100) : 0;
              
              let statusColor = "bg-gray-500";
              if (percentage >= 80) statusColor = "bg-green-500";
              else if (percentage >= 60) statusColor = "bg-blue-500";
              else if (percentage >= 40) statusColor = "bg-amber-500";
              else statusColor = "bg-red-500";
              
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.student_details?.admission_number || student.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={maxMarks}
                      value={currentMark}
                      onChange={(e) => handleMarkChange(student.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{percentage}%</TableCell>
                  <TableCell>
                    <Badge className={statusColor}>
                      {percentage >= 80 ? "Excellent" : 
                       percentage >= 60 ? "Good" : 
                       percentage >= 40 ? "Pass" : "Needs Improvement"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={feedback[student.id] || ''}
                      onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                      placeholder="Add feedback (optional)"
                      className="h-10 min-h-0 resize-none"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

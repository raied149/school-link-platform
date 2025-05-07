import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Edit, 
  FileText, 
  Users, 
  ArrowLeft,
  Download,
  Trash,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  getExamById, 
  getExamAssignments,
  getStudentExamResults,
  deleteExam
} from "@/services/examService";
import { MarkEntryTable } from "@/components/exams/MarkEntryTable";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
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
  
  // Fetch class data so we can display proper class names
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

  console.log("Available sections:", availableSections);
  console.log("Assignments:", assignments);
  console.log("Selected section:", selectedSection);

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
      
      return `"${studentId}","${studentName}",${marks},${exam.max_score},${percentage}%,"${feedback}"`;
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

  if (isLoadingExam || isLoadingAssignments) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The exam you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/exams")}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to determine exam status based on date
  const getExamStatus = () => {
    const today = new Date();
    const examDate = new Date(exam.date);
    
    if (examDate > today) return 'upcoming';
    if (examDate < today) return 'completed';
    return 'ongoing';
  };

  // Get the class name if available (from first section assignment)
  const getClassName = () => {
    if (!assignments || !assignments.length || !classes) return null;
    
    const firstAssignment = assignments[0];
    if (!firstAssignment.sections || !firstAssignment.sections.class_id) return null;
    
    const classId = firstAssignment.sections.class_id;
    const classObj = classes.find(c => c.id === classId);
    return classObj?.name || null;
  };

  const className = getClassName();

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/exams")} 
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exams
      </Button>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Test/Exam Form Dialog for editing */}
      <TestExamFormDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        examToEdit={exam}
        onExamUpdated={handleExamUpdated}
      />

      {/* Confirmation Dialog for deletion */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone and will remove all related data including student results."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteExam}
        isProcessing={isDeleting}
      />

      {assignmentsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error fetching exam assignments. The exam may not be assigned to any sections.
          </AlertDescription>
        </Alert>
      )}

      {!assignmentsError && assignments.length === 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Sections Assigned</AlertTitle>
          <AlertDescription>
            This exam is not assigned to any sections. Please edit the exam to assign it to sections.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Badge className="mr-3">
                {exam.subjects?.name || 'No Subject'}
              </Badge>
              <Badge className={`
                ${getExamStatus() === 'upcoming' ? 'bg-blue-500' : 
                  getExamStatus() === 'ongoing' ? 'bg-amber-500' : 
                  'bg-green-500'}
              `}>
                {getExamStatus().charAt(0).toUpperCase() + getExamStatus().slice(1)}
              </Badge>
              {className && (
                <Badge className="ml-2 bg-purple-500">
                  Class: {className}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Date: {format(new Date(exam.date), "PPP")}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Max Marks: {exam.max_score}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {assignments && assignments.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>
                  Assigned to {assignments.length} section(s)
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                Created: {format(new Date(exam.created_at), "PPP")}
              </span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">Students & Results</TabsTrigger>
            <TabsTrigger value="mark-entry">Mark Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-4">
            <h3 className="text-xl font-semibold mb-4">Student Results</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="sm:w-1/2">
                <label className="text-sm font-medium mb-1 block">Filter by Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder={availableSections.length > 0 ? "Select Section" : "No sections available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.length === 0 ? (
                      <SelectItem value="no-sections" disabled>No sections available</SelectItem>
                    ) : (
                      availableSections.map(section => (
                        <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSection && studentResults && studentResults.length > 0 && (
                <div className="sm:w-1/2 flex items-end">
                  <Button variant="outline" onClick={exportResultsAsCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                </div>
              )}
            </div>
            
            {selectedSection ? (
              isLoadingResults ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : studentResults && studentResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentResults.map((item) => {
                      const student = item.student;
                      const result = item.result;
                      
                      const marks = result ? result.marks_obtained : 0;
                      const percentage = exam.max_score > 0 ? 
                        Math.round((marks / exam.max_score) * 100) : 0;
                        
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
                          <TableCell>{student.first_name} {student.last_name}</TableCell>
                          <TableCell>
                            {result ? (
                              <span>{result.marks_obtained} / {exam.max_score}</span>
                            ) : (
                              <span className="text-muted-foreground">No marks</span>
                            )}
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
                            {result && result.feedback ? (
                              <span>{result.feedback}</span>
                            ) : (
                              <span className="text-muted-foreground">No feedback</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">
                    No results found for this section.
                  </p>
                  <Button onClick={() => setActiveTab("mark-entry")}>
                    Enter Marks
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">
                  {availableSections.length === 0 
                    ? "No sections are assigned to this exam. Please edit the exam to assign sections."
                    : "Please select a section to view student results."
                  }
                </p>
                {availableSections.length === 0 && (
                  <Button onClick={() => setEditDialogOpen(true)}>
                    Edit Exam
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mark-entry" className="mt-4">
            {availableSections.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">
                  No sections are assigned to this exam. Please edit the exam to assign sections first.
                </p>
                <Button onClick={() => setEditDialogOpen(true)}>
                  Edit Exam
                </Button>
              </div>
            ) : !selectedSection ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">
                  Please select a section to enter marks for students.
                </p>
                <div className="flex justify-center mt-4">
                  <div className="w-full max-w-xs">
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map(section => (
                          <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <MarkEntryTable 
                examId={exam.id} 
                sectionId={selectedSection} 
                maxMarks={exam.max_score}
                onMarksUpdated={handleMarksUpdated}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

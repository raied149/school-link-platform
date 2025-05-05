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
  Download
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
  getStudentExamResults
} from "@/services/examService";
import { MarkEntryTable } from "@/components/exams/MarkEntryTable";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [activeTab, setActiveTab] = useState("students");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: exam, isLoading: isLoadingExam, refetch: refetchExam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examId ? getExamById(examId) : null,
    enabled: !!examId
  });
  
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['examAssignments', examId],
    queryFn: () => examId ? getExamAssignments(examId) : [],
    enabled: !!examId
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
  
  // Extract unique classes from sections
  const availableClasses = assignments ? 
    Array.from(new Set(assignments.map(a => a.sections.class_id)))
      .map(classId => ({
        id: classId,
        name: `Class ${classId}`
      })) : [];

  // Get sections for selected class
  const availableSections = assignments ? 
    assignments.filter(a => 
      a.sections.class_id === selectedClass || selectedClass === ""
    ).map(a => ({
      id: a.sections.id,
      name: a.sections.name,
      classId: a.sections.class_id
    })) : [];

  // Handle class selection
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    // Reset section selection
    setSelectedSection("");
  };
  
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
    toast({
      title: "Exam Updated",
      description: "Exam details have been updated successfully."
    });
    setEditDialogOpen(false);
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
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
      </div>

      {/* Test/Exam Form Dialog for editing */}
      <TestExamFormDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        examToEdit={exam}
        onExamUpdated={handleExamUpdated}
      />

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
              <div className="sm:w-1/3">
                <label className="text-sm font-medium mb-1 block">Filter by Class</label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-classes">All Classes</SelectItem>
                    {availableClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="sm:w-1/3">
                <label className="text-sm font-medium mb-1 block">Filter by Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sections">All Sections</SelectItem>
                    {availableSections.map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSection && studentResults && studentResults.length > 0 && (
                <div className="sm:w-1/3 flex items-end">
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
                  Please select a section to view student results.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mark-entry" className="mt-4">
            {!selectedSection ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">
                  Please select a section to enter marks for students.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4 max-w-md mx-auto">
                  <div className="w-full">
                    <Select value={selectedClass} onValueChange={handleClassChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-classes">All Classes</SelectItem>
                        {availableClasses.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full">
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-sections">All Sections</SelectItem>
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

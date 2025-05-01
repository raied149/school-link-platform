
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, FileText, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TestResultFormDialog } from "@/components/exams/TestResultFormDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  getExamById, 
  getExamAssignments,
  getStudentsInSection 
} from "@/services/examService";
import { MarkEntryTable } from "@/components/exams/MarkEntryTable";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("students");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examId ? getExamById(examId) : null,
    enabled: !!examId
  });
  
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['examAssignments', examId],
    queryFn: () => examId ? getExamAssignments(examId) : [],
    enabled: !!examId
  });
  
  // Extract unique classes from sections
  const availableClasses = assignments ? 
    Array.from(new Set(assignments.map(a => a.sections.class_id)))
      .map(classId => ({
        id: classId,
        // Find a section assignment with this class to get class details
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
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
      </div>

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
            </div>
            
            {selectedSection ? (
              <p className="text-center text-muted-foreground py-6">
                Select a section and switch to the "Mark Entry" tab to manage student marks.
              </p>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-2">
                  Please select a section to view or enter marks.
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
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

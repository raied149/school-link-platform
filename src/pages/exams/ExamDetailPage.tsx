
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, FileText, Users } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TestResultFormDialog } from "@/components/exams/TestResultFormDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockExam = {
  id: "e1",
  name: "Mid-term Examination",
  type: "exam",
  classes: ["class1", "class2"],
  sections: ["sec1", "sec2"],
  subjects: ["sub1", "sub2"],
  maxMarks: 100,
  date: new Date("2025-06-15").toISOString(),
  status: "upcoming",
  createdAt: new Date("2025-04-01").toISOString(),
  updatedAt: new Date("2025-04-01").toISOString(),
};

const mockStudents = [
  {
    id: "s1",
    name: "John Doe",
    email: "john@example.com",
    admissionNumber: "A001",
    dateOfBirth: "2010-05-15",
    gender: "male",
    contactNumber: "123-456-7890",
    currentClassId: "class1",
    currentSectionId: "sec1",
    academicYearId: "year1",
    nationality: "US",
    language: "English",
    guardian: {
      name: "Parent Doe",
      email: "parent@example.com",
      phone: "123-456-7890",
      relationship: "Father"
    },
    medical: {},
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z"
  },
  {
    id: "s2",
    name: "Jane Smith",
    email: "jane@example.com",
    admissionNumber: "A002",
    dateOfBirth: "2010-06-20",
    gender: "female",
    contactNumber: "123-456-7891",
    currentClassId: "class1",
    currentSectionId: "sec2",
    academicYearId: "year1",
    nationality: "UK",
    language: "English",
    guardian: {
      name: "Parent Smith",
      email: "parent2@example.com",
      phone: "123-456-7891",
      relationship: "Mother"
    },
    medical: {},
    createdAt: "2023-01-02T00:00:00.000Z",
    updatedAt: "2023-01-02T00:00:00.000Z"
  },
  {
    id: "s3",
    name: "Bob Johnson",
    email: "bob@example.com",
    admissionNumber: "A003",
    dateOfBirth: "2010-07-25",
    gender: "male",
    contactNumber: "123-456-7892",
    currentClassId: "class2",
    currentSectionId: "sec1",
    academicYearId: "year1",
    nationality: "CA",
    language: "English",
    guardian: {
      name: "Parent Johnson",
      email: "parent3@example.com",
      phone: "123-456-7892",
      relationship: "Father"
    },
    medical: {},
    createdAt: "2023-01-03T00:00:00.000Z",
    updatedAt: "2023-01-03T00:00:00.000Z"
  }
];

const mockResults = [
  { id: "r1", testExamId: "e1", studentId: "s1", marks: 85, feedback: "Good work!", updatedAt: new Date().toISOString() },
  { id: "r2", testExamId: "e1", studentId: "s3", marks: 92, feedback: "Excellent!", updatedAt: new Date().toISOString() },
];

const ExamDetailPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { toast } = useToast();
  
  // For demonstration purposes
  const exam = mockExam;
  
  // Classes and sections for filtering
  const classes = [
    { id: "class1", name: "Class 1" },
    { id: "class2", name: "Class 2" },
    { id: "class3", name: "Class 3" },
  ];

  const sections = [
    { id: "sec1", name: "Section A" },
    { id: "sec2", name: "Section B" },
    { id: "sec3", name: "Section C" },
  ];

  // Filter students based on selected class and section
  const filteredStudents = mockStudents.filter(student => {
    const classMatch = selectedClass === "all" || student.currentClassId === selectedClass;
    const sectionMatch = selectedSection === "all" || student.currentSectionId === selectedSection;
    return classMatch && sectionMatch;
  });

  // Get result for a student
  const getStudentResult = (studentId: string) => {
    return mockResults.find(result => result.studentId === studentId && result.testExamId === examId);
  };

  const handleOpenResultDialog = (student: any) => {
    setSelectedStudent(student);
    setIsResultDialogOpen(true);
  };

  const handleSaveResult = (marks: number, feedback: string) => {
    console.log(`Saving marks for student ${selectedStudent?.admissionNumber}: ${marks}, feedback: ${feedback}`);
    toast({
      title: "Marks updated",
      description: `Marks for ${selectedStudent?.name} have been updated successfully.`,
    });
    setIsResultDialogOpen(false);
  };

  return (
    <div className="space-y-6">
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
              <Badge className="mr-3 capitalize">{exam.type}</Badge>
              {exam.status === 'upcoming' && <Badge className="bg-blue-500">Upcoming</Badge>}
              {exam.status === 'ongoing' && <Badge className="bg-amber-500">Ongoing</Badge>}
              {exam.status === 'completed' && <Badge className="bg-green-500">Completed</Badge>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Date: {format(new Date(exam.date), "PPP")}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Max Marks: {exam.maxMarks}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                Classes: {classes.filter(c => exam.classes.includes(c.id)).map(c => c.name).join(", ")}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                Sections: {sections.filter(s => exam.sections.includes(s.id)).map(s => s.name).join(", ")}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>
                Created: {format(new Date(exam.createdAt), "PPP")}
              </span>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <h3 className="text-xl font-semibold mb-4">Student Results</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="sm:w-1/3">
            <label className="text-sm font-medium mb-1 block">Filter by Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
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
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const result = getStudentResult(student.id);
                const resultStatus = result ? "Evaluated" : "Pending";
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.admissionNumber}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {classes.find(c => c.id === student.currentClassId)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {sections.find(s => s.id === student.currentSectionId)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {result ? `${result.marks}/${exam.maxMarks}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={resultStatus === "Evaluated" ? "bg-green-500" : "bg-amber-500"}>
                        {resultStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResultDialog(student)}
                      >
                        {result ? "Update Marks" : "Add Marks"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No students found for the selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      {selectedStudent && (
        <TestResultFormDialog
          open={isResultDialogOpen}
          onOpenChange={setIsResultDialogOpen}
          student={selectedStudent}
          maxMarks={exam.maxMarks}
          testName={exam.name}
          onSave={handleSaveResult}
          initialMarks={getStudentResult(selectedStudent.id)?.marks}
          initialFeedback={getStudentResult(selectedStudent.id)?.feedback}
        />
      )}
    </div>
  );
};

export default ExamDetailPage;

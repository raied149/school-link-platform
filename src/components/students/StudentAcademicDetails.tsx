
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
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
import { StudentDetail } from "@/types";
import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentAcademicDetailsProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

export function StudentAcademicDetails({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAcademicDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', classId, sectionId, studentId],
    queryFn: async () => {
      // Mock data for now
      const allStudents = [
        {
          id: "1",
          name: "John Doe",
          academicResults: [
            { examName: "First Term", subject: "Mathematics", marks: 85, maxMarks: 100 },
            { examName: "First Term", subject: "Science", marks: 92, maxMarks: 100 },
            { examName: "Mid Term", subject: "Mathematics", marks: 78, maxMarks: 100 },
            { examName: "Mid Term", subject: "Science", marks: 88, maxMarks: 100 },
          ]
        },
        {
          id: "2",
          name: "Jane Smith",
          academicResults: [
            { examName: "First Term", subject: "Mathematics", marks: 90, maxMarks: 100 },
            { examName: "First Term", subject: "Science", marks: 85, maxMarks: 100 },
            { examName: "Mid Term", subject: "Mathematics", marks: 92, maxMarks: 100 },
            { examName: "Mid Term", subject: "Science", marks: 89, maxMarks: 100 },
          ]
        },
        {
          id: "3",
          name: "Alex Johnson",
          academicResults: [
            { examName: "First Term", subject: "Mathematics", marks: 75, maxMarks: 100 },
            { examName: "First Term", subject: "Science", marks: 80, maxMarks: 100 },
            { examName: "Mid Term", subject: "Mathematics", marks: 82, maxMarks: 100 },
            { examName: "Mid Term", subject: "Science", marks: 78, maxMarks: 100 },
          ]
        }
      ];
      
      // Filter by studentId if provided
      if (studentId) {
        return allStudents.filter(student => student.id === studentId);
      }
      
      return allStudents;
    }
  });

  const filteredStudents = students?.filter(student => 
    student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Students Academic Records</h2>
        <div className="relative w-full max-w-sm mb-6">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents?.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Records
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Academic Records - {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedStudent?.academicResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.examName}</TableCell>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>{result.marks}/{result.maxMarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

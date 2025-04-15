
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
import { StudentDetail } from "@/types";

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
  // This would be replaced with actual API call
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Academic Records</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Marks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.flatMap((student) => 
            student.academicResults.map((result, index) => (
              <TableRow key={`${student.id}-${index}`}>
                <TableCell>{result.examName}</TableCell>
                <TableCell>{result.subject}</TableCell>
                <TableCell>{result.marks}/{result.maxMarks}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

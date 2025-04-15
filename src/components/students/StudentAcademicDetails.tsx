
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
  classId: string;
  sectionId: string;
}

export function StudentAcademicDetails({ classId, sectionId }: StudentAcademicDetailsProps) {
  // This would be replaced with actual API call
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', classId, sectionId],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: "1",
          name: "John Doe",
          admissionNumber: "2024001",
          academicResults: [
            { examName: "First Term", subject: "Mathematics", marks: 85, maxMarks: 100 },
            { examName: "First Term", subject: "Science", marks: 92, maxMarks: 100 },
          ]
        },
        // Add more mock students as needed
      ];
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Student Academic Records</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Admission Number</TableHead>
            <TableHead>Academic Performance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.admissionNumber}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {student.academicResults.map((result, index) => (
                    <div key={index} className="text-sm">
                      {result.examName} - {result.subject}: {result.marks}/{result.maxMarks}
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

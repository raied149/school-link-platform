
import { useQuery } from "@tanstack/react-query";
import { getStudentExams } from "@/services/examService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface StudentExamResultsProps {
  studentId: string;
}

export function StudentExamResults({ studentId }: StudentExamResultsProps) {
  const { data: examResults, isLoading } = useQuery({
    queryKey: ['studentExams', studentId],
    queryFn: () => getStudentExams(studentId),
  });

  if (isLoading) {
    return <div>Loading exam results...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Exam Results</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Max Score</TableHead>
            <TableHead>Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {examResults?.map((result: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{result.exams.subjects.name}</TableCell>
              <TableCell>{result.exams.name}</TableCell>
              <TableCell>{format(new Date(result.exams.date), 'PPP')}</TableCell>
              <TableCell>{result.score}</TableCell>
              <TableCell>{result.exams.max_score}</TableCell>
              <TableCell>
                {Math.round((result.score / result.exams.max_score) * 100)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

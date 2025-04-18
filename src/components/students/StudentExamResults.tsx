
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
import { AlertCircle } from "lucide-react";

interface StudentExamResultsProps {
  studentId: string;
}

export function StudentExamResults({ studentId }: StudentExamResultsProps) {
  const { data: examResults, isLoading, error } = useQuery({
    queryKey: ['studentExams', studentId],
    queryFn: () => getStudentExams(studentId),
  });

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Loading exam results...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-center text-destructive flex items-center justify-center gap-2">
        <AlertCircle size={16} />
        <span>Error loading exam results</span>
      </div>
    );
  }

  if (!examResults || examResults.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No exam results found for this student
      </div>
    );
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
          {examResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.exams?.subjects?.name || "Unknown"}</TableCell>
              <TableCell>{result.exams?.name || "Unknown"}</TableCell>
              <TableCell>{result.exams?.date ? format(new Date(result.exams.date), 'PPP') : "Unknown"}</TableCell>
              <TableCell>{result.score || "0"}</TableCell>
              <TableCell>{result.exams?.max_score || "0"}</TableCell>
              <TableCell>
                {result.exams?.max_score ? 
                  `${Math.round((result.score / result.exams.max_score) * 100)}%` : 
                  "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

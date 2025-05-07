
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface StudentMarkRowProps {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_details?: {
      admission_number?: string;
    };
  };
  mark: number;
  feedback: string;
  maxMarks: number;
  onMarkChange: (studentId: string, value: string) => void;
  onFeedbackChange: (studentId: string, value: string) => void;
}

export function StudentMarkRow({
  student,
  mark,
  feedback,
  maxMarks,
  onMarkChange,
  onFeedbackChange
}: StudentMarkRowProps) {
  const percentage = maxMarks > 0 ? Math.round((mark / maxMarks) * 100) : 0;
  
  let statusColor = "bg-gray-500";
  if (percentage >= 80) statusColor = "bg-green-500";
  else if (percentage >= 60) statusColor = "bg-blue-500";
  else if (percentage >= 40) statusColor = "bg-amber-500";
  else statusColor = "bg-red-500";
  
  return (
    <TableRow>
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
          value={mark}
          onChange={(e) => onMarkChange(student.id, e.target.value)}
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
          value={feedback}
          onChange={(e) => onFeedbackChange(student.id, e.target.value)}
          placeholder="Add feedback (optional)"
          className="h-10 min-h-0 resize-none"
        />
      </TableCell>
    </TableRow>
  );
}

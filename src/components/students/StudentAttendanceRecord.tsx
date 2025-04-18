
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  attendance: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
}

interface StudentAttendanceRecordProps {
  record: AttendanceRecord;
}

export function StudentAttendanceRecord({ record }: StudentAttendanceRecordProps) {
  // Color the attendance percentage based on its value
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <TableRow key={record.studentId}>
      <TableCell>{record.admissionNumber}</TableCell>
      <TableCell>{record.studentName}</TableCell>
      <TableCell>{record.attendance.present}</TableCell>
      <TableCell>{record.attendance.absent}</TableCell>
      <TableCell className={getAttendanceColor(record.attendance.percentage)}>
        {record.attendance.percentage}%
      </TableCell>
    </TableRow>
  );
}

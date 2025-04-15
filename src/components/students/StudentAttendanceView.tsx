
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

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string; // Added student ID for filtering
}

export function StudentAttendanceView({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAttendanceViewProps) {
  // This would be replaced with actual API call
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', classId, sectionId, studentId],
    queryFn: async () => {
      // Mock data for now
      const allAttendance = [
        {
          studentId: "1",
          studentName: "John Doe",
          admissionNumber: "2024001",
          attendance: {
            present: 45,
            absent: 3,
            total: 48,
            percentage: 93.75
          }
        },
        {
          studentId: "2",
          studentName: "Jane Smith",
          admissionNumber: "2024002",
          attendance: {
            present: 47,
            absent: 1,
            total: 48,
            percentage: 97.92
          }
        },
        {
          studentId: "3",
          studentName: "Alex Johnson",
          admissionNumber: "2024003",
          attendance: {
            present: 42,
            absent: 6,
            total: 48,
            percentage: 87.50
          }
        }
      ];
      
      // Filter by studentId if provided
      if (studentId) {
        return allAttendance.filter(record => record.studentId === studentId);
      }
      
      return allAttendance;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Student Attendance Records</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Admission Number</TableHead>
            <TableHead>Present Days</TableHead>
            <TableHead>Absent Days</TableHead>
            <TableHead>Attendance %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance?.map((record) => (
            <TableRow key={record.studentId}>
              <TableCell>{record.studentId}</TableCell>
              <TableCell>{record.studentName}</TableCell>
              <TableCell>{record.admissionNumber}</TableCell>
              <TableCell>{record.attendance.present}</TableCell>
              <TableCell>{record.attendance.absent}</TableCell>
              <TableCell>{record.attendance.percentage}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

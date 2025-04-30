
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  student_id: string;
  subject_id: string;
  status: string;
}

interface AttendanceTableProps {
  students: Student[];
  sectionSubjects: Subject[];
  filteredAttendanceRecords: AttendanceRecord[];
  loading: Record<string, boolean>;
  handleMarkAttendance: (studentId: string, status: string, subjectId: string) => void;
  selectedSubject: string;
}

export function AttendanceTable({
  students,
  sectionSubjects,
  filteredAttendanceRecords,
  loading,
  handleMarkAttendance,
  selectedSubject
}: AttendanceTableProps) {
  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            sectionSubjects.map((subject) => {
              const attendanceRecord = filteredAttendanceRecords.find(
                record => record.student_id === student.id && record.subject_id === subject.id
              );

              return (
                <TableRow key={`${student.id}-${subject.id}`}>
                  <TableCell>{student.id.substring(0, 8)}</TableCell>
                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{subject.name} ({subject.code})</TableCell>
                  <TableCell>
                    {attendanceRecord ? (
                      <Badge className={
                        attendanceRecord.status === 'present' ? 'bg-green-100 text-green-800' : 
                        attendanceRecord.status === 'absent' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {attendanceRecord.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not marked</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleMarkAttendance(student.id, 'present', subject.id)}
                        disabled={loading[`${student.id}-${subject.id}`]}
                      >
                        Present
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleMarkAttendance(student.id, 'absent', subject.id)}
                        disabled={loading[`${student.id}-${subject.id}`]}
                      >
                        Absent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

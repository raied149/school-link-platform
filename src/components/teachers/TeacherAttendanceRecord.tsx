
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogIn } from "lucide-react";

interface TeacherAttendanceStatus {
  status: 'present' | 'absent' | 'not-marked';
  checkIn: string | null;
  checkOut: string | null;
}

interface TeacherAttendanceRecordProps {
  teacherId: string;
  teacherName: string;
  attendance: TeacherAttendanceStatus;
  onCheckIn: (teacherId: string) => void;
  onCheckOut: (teacherId: string) => void;
  onMarkAbsent: (teacherId: string) => void;
}

export function TeacherAttendanceRecord({ 
  teacherId, 
  teacherName, 
  attendance, 
  onCheckIn, 
  onCheckOut, 
  onMarkAbsent 
}: TeacherAttendanceRecordProps) {
  return (
    <tr className="border-b">
      <td className="p-4">{teacherName}</td>
      <td className="p-4">
        {attendance.status === 'present' ? (
          <Badge variant="outline" className="bg-green-50 text-green-600">Present</Badge>
        ) : attendance.status === 'absent' ? (
          <Badge variant="outline" className="bg-red-50 text-red-600">Absent</Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600">Not marked</Badge>
        )}
      </td>
      <td className="p-4">{attendance.checkIn || "-"}</td>
      <td className="p-4">{attendance.checkOut || "-"}</td>
      <td className="p-4">
        <div className="flex gap-2">
          {attendance.status !== 'present' ? (
            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => onCheckIn(teacherId)}>
              <LogIn className="mr-2 h-4 w-4" />
              Check In
            </Button>
          ) : !attendance.checkOut ? (
            <Button size="sm" variant="outline" className="text-purple-600 hover:text-purple-700" onClick={() => onCheckOut(teacherId)}>
              <LogIn className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          ) : null}
          {attendance.status !== 'absent' && (
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onMarkAbsent(teacherId)}>
              Absent
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

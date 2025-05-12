
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";
import { format } from "date-fns";

interface TeacherAttendanceProps {
  teacherId: string;
  teacherName: string;
  attendance: {
    status: "present" | "absent" | "not-marked";
    checkIn: string | null;
    checkOut: string | null;
  };
  onCheckIn: (teacherId: string) => void;
  onCheckOut: (teacherId: string) => void;
  onMarkAbsent: (teacherId: string) => void;
  isReadOnly?: boolean;
}

export function TeacherAttendanceRecord({
  teacherId,
  teacherName,
  attendance,
  onCheckIn,
  onCheckOut,
  onMarkAbsent,
  isReadOnly = false
}: TeacherAttendanceProps) {
  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    try {
      // Assuming time is in format HH:MM:SS
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}`;
    } catch (error) {
      return time;
    }
  };

  const getStatusColor = () => {
    switch (attendance.status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (attendance.status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      default:
        return "Not Marked";
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{teacherName}</TableCell>
      <TableCell>
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusText()}
        </span>
      </TableCell>
      <TableCell>
        {attendance.checkIn
          ? format(new Date(`2000-01-01T${attendance.checkIn}`), "h:mm a")
          : "--"}
      </TableCell>
      <TableCell>
        {attendance.checkOut
          ? format(new Date(`2000-01-01T${attendance.checkOut}`), "h:mm a")
          : "--"}
      </TableCell>
      <TableCell>
        {isReadOnly ? (
          <span className="text-xs text-muted-foreground">No actions available</span>
        ) : (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={attendance.status === "present" ? "default" : "outline"}
              onClick={() => onCheckIn(teacherId)}
              className="flex items-center"
              disabled={attendance.checkIn !== null}
            >
              <Clock className="h-4 w-4 mr-1" />
              In
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCheckOut(teacherId)}
              className="flex items-center"
              disabled={
                attendance.status !== "present" || attendance.checkIn === null
              }
            >
              <Clock className="h-4 w-4 mr-1" />
              Out
            </Button>
            <Button
              size="sm"
              variant={attendance.status === "absent" ? "destructive" : "outline"}
              onClick={() => onMarkAbsent(teacherId)}
              className="flex items-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

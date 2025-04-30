
import { Badge } from "@/components/ui/badge";

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'not-marked';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus | string;
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  switch(status) {
    case 'present':
      return <Badge variant="outline" className="bg-green-50 text-green-600">Present</Badge>;
    case 'absent':
      return <Badge variant="outline" className="bg-red-50 text-red-600">Absent</Badge>;
    case 'late':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Late</Badge>;
    case 'leave':
      return <Badge variant="outline" className="bg-blue-50 text-blue-600">Leave</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-50 text-gray-600">Not marked</Badge>;
  }
}

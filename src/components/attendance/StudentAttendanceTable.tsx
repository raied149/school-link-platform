
import { Button } from "@/components/ui/button";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

interface StudentAttendanceTableProps {
  students: any[];
  isLoading: boolean;
  onMarkAttendance: (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => void;
  selectedSubject: string | null;
}

export function StudentAttendanceTable({ 
  students, 
  isLoading, 
  onMarkAttendance,
  selectedSubject
}: StudentAttendanceTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div className="mt-6 rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left align-middle font-medium">Student ID</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Grade</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Section</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? students.map((student) => (
            <tr key={student.id} className="border-b">
              <td className="p-4">{student.id.substring(0, 8)}</td>
              <td className="p-4">{`${student.first_name} ${student.last_name}`}</td>
              <td className="p-4">{student.grade}</td>
              <td className="p-4">{student.section}</td>
              <td className="p-4">
                <AttendanceStatusBadge status={student.attendance} />
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => onMarkAttendance(student.id, 'present')}
                    disabled={!selectedSubject}
                  >
                    Present
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => onMarkAttendance(student.id, 'absent')}
                    disabled={!selectedSubject}
                  >
                    Absent
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                    onClick={() => onMarkAttendance(student.id, 'late')}
                    disabled={!selectedSubject}
                  >
                    Late
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                    onClick={() => onMarkAttendance(student.id, 'leave')}
                    disabled={!selectedSubject}
                  >
                    Leave
                  </Button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="p-4 text-center">
                No students found matching your search criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

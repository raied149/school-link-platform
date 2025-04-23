
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TeacherAttendanceTableProps {
  selectedDate: Date;
  teachers: any[];
}

export function TeacherAttendanceTable({ selectedDate, teachers }: TeacherAttendanceTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['teacher-attendance', formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('date', formattedDate);

      if (error) throw error;
      return data || [];
    }
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ teacherId, status, checkIn = null, checkOut = null }: { 
      teacherId: string; 
      status: string; 
      checkIn?: string | null; 
      checkOut?: string | null;
    }) => {
      const { data: existingRecord } = await supabase
        .from('teacher_attendance')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('date', formattedDate)
        .maybeSingle();

      if (existingRecord) {
        const { error } = await supabase
          .from('teacher_attendance')
          .update({ status, check_in: checkIn, check_out: checkOut })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teacher_attendance')
          .insert({
            teacher_id: teacherId,
            date: formattedDate,
            status,
            check_in: checkIn,
            check_out: checkOut
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance', formattedDate] });
    }
  });

  const handleCheckIn = async (teacherId: string) => {
    const now = new Date();
    const checkInTime = format(now, 'HH:mm:ss');
    
    await markAttendanceMutation.mutateAsync({
      teacherId,
      status: 'present',
      checkIn: checkInTime
    });

    toast({
      title: "Check-in recorded",
      description: `Teacher checked in at ${format(now, 'h:mm a')}`,
    });
  };

  const handleCheckOut = async (teacherId: string) => {
    const now = new Date();
    const checkOutTime = format(now, 'HH:mm:ss');
    
    await markAttendanceMutation.mutateAsync({
      teacherId,
      status: 'present',
      checkOut: checkOutTime
    });

    toast({
      title: "Check-out recorded",
      description: `Teacher checked out at ${format(now, 'h:mm a')}`,
    });
  };

  const handleMarkAbsent = async (teacherId: string) => {
    await markAttendanceMutation.mutateAsync({
      teacherId,
      status: 'absent'
    });

    toast({
      title: "Attendance updated",
      description: "Teacher marked as absent",
    });
  };

  if (isLoadingAttendance) {
    return <div className="text-center py-4">Loading attendance records...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => {
            const attendance = attendanceRecords.find(record => record.teacher_id === teacher.id);
            
            return (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>
                  {attendance ? (
                    <Badge className={
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' : 
                      attendance.status === 'absent' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {attendance.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not marked</Badge>
                  )}
                </TableCell>
                <TableCell>{attendance?.check_in ? format(new Date(`2000-01-01T${attendance.check_in}`), 'h:mm a') : '-'}</TableCell>
                <TableCell>{attendance?.check_out ? format(new Date(`2000-01-01T${attendance.check_out}`), 'h:mm a') : '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!attendance || !attendance.check_in ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleCheckIn(teacher.id)}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                    ) : !attendance.check_out ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                        onClick={() => handleCheckOut(teacher.id)}
                      >
                        Check Out
                      </Button>
                    ) : null}
                    {(!attendance || attendance.status !== 'absent') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleMarkAbsent(teacher.id)}
                      >
                        Mark Absent
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

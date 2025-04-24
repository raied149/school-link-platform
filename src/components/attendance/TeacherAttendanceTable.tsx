
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
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TeacherAttendanceRecord } from "@/components/teachers/TeacherAttendanceRecord";

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

      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      return data || [];
    }
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ teacherId, status, checkIn = null, checkOut = null }: { 
      teacherId: string; 
      status: 'present' | 'absent' | 'not-marked'; 
      checkIn?: string | null; 
      checkOut?: string | null;
    }) => {
      // Check if record exists for the teacher on the selected date
      const { data: existingRecord } = await supabase
        .from('teacher_attendance')
        .select('id, check_in, check_out')
        .eq('teacher_id', teacherId)
        .eq('date', formattedDate)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const updateData: any = { status };
        if (checkIn !== null) updateData.check_in = checkIn;
        if (checkOut !== null) updateData.check_out = checkOut;
        
        const { error } = await supabase
          .from('teacher_attendance')
          .update(updateData)
          .eq('id', existingRecord.id);

        if (error) {
          console.error("Error updating attendance:", error);
          throw error;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('teacher_attendance')
          .insert({
            teacher_id: teacherId,
            date: formattedDate,
            status,
            check_in: checkIn,
            check_out: checkOut
          });

        if (error) {
          console.error("Error inserting attendance:", error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance', formattedDate] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to update attendance record. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCheckIn = async (teacherId: string) => {
    const now = new Date();
    const checkInTime = format(now, 'HH:mm:ss');
    
    try {
      await markAttendanceMutation.mutateAsync({
        teacherId,
        status: 'present',
        checkIn: checkInTime
      });

      toast({
        title: "Check-in recorded",
        description: `Teacher checked in at ${format(now, 'h:mm a')}`,
      });
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const handleCheckOut = async (teacherId: string) => {
    const now = new Date();
    const checkOutTime = format(now, 'HH:mm:ss');
    
    try {
      await markAttendanceMutation.mutateAsync({
        teacherId,
        status: 'present',
        checkOut: checkOutTime
      });

      toast({
        title: "Check-out recorded",
        description: `Teacher checked out at ${format(now, 'h:mm a')}`,
      });
    } catch (error) {
      console.error("Check-out failed:", error);
    }
  };

  const handleMarkAbsent = async (teacherId: string) => {
    try {
      await markAttendanceMutation.mutateAsync({
        teacherId,
        status: 'absent'
      });

      toast({
        title: "Attendance updated",
        description: "Teacher marked as absent",
      });
    } catch (error) {
      console.error("Mark absent failed:", error);
    }
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
            
            // Fix the type issue by ensuring status is always one of the allowed values
            const attendanceStatus = attendance 
              ? (attendance.status as 'present' | 'absent' | 'not-marked') 
              : 'not-marked';
            
            return (
              <TeacherAttendanceRecord
                key={teacher.id}
                teacherId={teacher.id}
                teacherName={teacher.name}
                attendance={{
                  status: attendanceStatus,
                  checkIn: attendance?.check_in ? attendance.check_in : null,
                  checkOut: attendance?.check_out ? attendance.check_out : null
                }}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onMarkAbsent={handleMarkAbsent}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}


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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

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

export function StudentAttendanceView({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAttendanceViewProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Fetch student profiles from Supabase
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      console.log("Fetching students for attendance view");
      const query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
        
      // Filter by studentId if provided
      if (studentId) {
        query.eq('id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch attendance records (currently mock data, you can replace with real attendance data from Supabase later)
  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance', students, dateRange],
    queryFn: async () => {
      // Generate attendance records for the fetched students
      // In a real application, you would query the attendance table 
      return students.map(student => {
        // Generate random attendance data for demonstration
        const totalDays = 48;
        const presentDays = Math.floor(Math.random() * 20) + 25; // Between 25 and 45 days
        const absentDays = totalDays - presentDays;
        const percentage = (presentDays / totalDays) * 100;
        
        return {
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          admissionNumber: student.id.substring(0, 8),
          attendance: {
            present: presentDays,
            absent: absentDays,
            total: totalDays,
            percentage: parseFloat(percentage.toFixed(2))
          }
        };
      });
    },
    enabled: students.length > 0
  });

  const isLoading = isLoadingStudents || isLoadingAttendance;

  if (isLoading) {
    return <div className="text-center py-8">Loading student attendance data...</div>;
  }

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {students.length > 0 
          ? "No attendance records found for the selected students." 
          : "No students found in the database."}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Student Attendance Records</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Filter by date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <h3 className="font-medium text-sm">Select date range</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose start and end dates to filter attendance
                </p>
              </div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="p-3"
              />
              <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                >
                  Reset
                </Button>
                <Button size="sm">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Present Days</TableHead>
              <TableHead>Absent Days</TableHead>
              <TableHead>Attendance %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.studentId}>
                <TableCell>{record.admissionNumber}</TableCell>
                <TableCell>{record.studentName}</TableCell>
                <TableCell>{record.attendance.present}</TableCell>
                <TableCell>{record.attendance.absent}</TableCell>
                <TableCell>{record.attendance.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

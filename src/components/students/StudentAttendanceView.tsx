
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

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

export function StudentAttendanceView({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAttendanceViewProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', classId, sectionId, studentId, dateRange],
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Student Attendance Records</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
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
            {attendance?.map((record) => (
              <TableRow key={record.studentId}>
                <TableCell>{record.studentId}</TableCell>
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

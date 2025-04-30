
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface AttendanceRecord {
  student_id: string;
  subject_id: string;
  status: string;
}

interface SectionAttendanceTableProps {
  students: Student[];
  selectedSubject: string | null;
  filteredAttendanceRecords: AttendanceRecord[];
  loading: Record<string, boolean>;
  handleMarkAttendance: (studentId: string, status: string, subjectId: string) => void;
}

export function SectionAttendanceTable({
  students,
  selectedSubject,
  filteredAttendanceRecords,
  loading,
  handleMarkAttendance
}: SectionAttendanceTableProps) {
  if (!selectedSubject) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Please select a subject to view and mark attendance
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            // Find attendance record for this student and subject
            const attendanceRecord = filteredAttendanceRecords.find(
              record => record.student_id === student.id && 
                      record.subject_id === selectedSubject
            );

            const isMarking = loading[`${student.id}-${selectedSubject}`];
            
            return (
              <TableRow key={student.id}>
                <TableCell>{student.id.substring(0, 8)}</TableCell>
                <TableCell>{student.first_name} {student.last_name}</TableCell>
                <TableCell>
                  {attendanceRecord ? (
                    <AttendanceStatusBadge status={attendanceRecord.status} />
                  ) : (
                    <AttendanceStatusBadge status="not-marked" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                      onClick={() => handleMarkAttendance(student.id, 'present', selectedSubject)}
                      disabled={isMarking}
                    >
                      Present
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => handleMarkAttendance(student.id, 'absent', selectedSubject)}
                      disabled={isMarking}
                    >
                      Absent
                    </Button>
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

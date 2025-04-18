
import { Clock } from 'lucide-react';
import { TimeSlot } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen } from 'lucide-react';

interface DailyViewProps {
  timeSlots: TimeSlot[];
  selectedDay: string;
  isLoading: boolean;
  formatTime: (time: string) => string;
  getSubjectName: (subjectId: string) => string;
  user?: { role?: string };
}

export function DailyView({
  timeSlots,
  selectedDay,
  isLoading,
  formatTime,
  getSubjectName,
  user
}: DailyViewProps) {
  const filteredSlots = timeSlots.filter(slot => slot.dayOfWeek === selectedDay);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (filteredSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No time slots scheduled for {selectedDay}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Subject</TableHead>
          {user?.role === 'student' ? <TableHead>Teacher</TableHead> : <TableHead>Class/Section</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
          <TableRow key={slot.id}>
            <TableCell>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</TableCell>
            <TableCell className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              {getSubjectName(slot.subjectId)}
            </TableCell>
            {user?.role === 'student' ? (
              <TableCell>Teacher {slot.teacherId}</TableCell>
            ) : (
              <TableCell>Class {slot.classId} - Section {slot.sectionId}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

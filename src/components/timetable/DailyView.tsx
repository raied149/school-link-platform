
import { Clock, BookOpen, Coffee, Calendar } from 'lucide-react';
import { TimeSlot, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isValid } from 'date-fns';

interface DailyViewProps {
  timeSlots: TimeSlot[];
  selectedDay: string;
  isLoading: boolean;
  formatTime: (time: string) => string;
  getSubjectName: (subjectId?: string) => string;
  user?: { role?: string };
  getTeacherName?: (teacherId?: string) => string;
  getClassName?: (classId: string) => string;
  getSectionName?: (sectionId: string) => string;
}

export function DailyView({
  timeSlots,
  selectedDay,
  isLoading,
  formatTime,
  getSubjectName,
  getTeacherName = () => 'N/A',
  getClassName = () => 'N/A',
  getSectionName = () => 'N/A',
  user
}: DailyViewProps) {
  const filteredSlots = timeSlots.filter(slot => slot.dayOfWeek === selectedDay);

  const getSlotIcon = (slotType: SlotType) => {
    switch (slotType) {
      case 'subject': return <BookOpen className="mr-2 h-4 w-4" />;
      case 'break': return <Coffee className="mr-2 h-4 w-4" />;
      case 'event': return <Calendar className="mr-2 h-4 w-4" />;
      default: return null;
    }
  };

  const getSlotDetails = (slot: TimeSlot) => {
    if (slot.slotType === 'subject' && slot.subjectId) {
      return getSubjectName(slot.subjectId);
    } else {
      return slot.title || 'Untitled';
    }
  };

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
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Class/Section</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
          <TableRow key={slot.id}>
            <TableCell>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </TableCell>
            <TableCell className="capitalize">{slot.slotType}</TableCell>
            <TableCell className="flex items-center">
              {getSlotIcon(slot.slotType)}
              {getSlotDetails(slot)}
            </TableCell>
            <TableCell>
              {slot.slotType === 'subject' ? getTeacherName(slot.teacherId) : '-'}
            </TableCell>
            <TableCell>
              {getClassName(slot.classId)} - {getSectionName(slot.sectionId)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

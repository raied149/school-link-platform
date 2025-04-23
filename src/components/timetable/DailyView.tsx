
import { Clock, BookOpen, Coffee, Calendar, Edit, Trash2 } from 'lucide-react';
import { TimeSlot, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DailyViewProps {
  timeSlots: TimeSlot[];
  selectedDay: string;
  isLoading: boolean;
  getSubjectName: (subjectId?: string) => string;
  onEdit?: (timeSlot: TimeSlot) => void;
  onDelete?: (id: string) => void;
  user?: { role?: string };
}

export function DailyView({
  timeSlots,
  selectedDay,
  isLoading,
  getSubjectName,
  onEdit,
  onDelete,
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
          {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
          <TableRow key={slot.id}>
            <TableCell>
              {slot.startTime} - {slot.endTime}
            </TableCell>
            <TableCell className="capitalize">{slot.slotType}</TableCell>
            <TableCell className="flex items-center">
              {getSlotIcon(slot.slotType)}
              {getSlotDetails(slot)}
            </TableCell>
            {user?.role === 'admin' && (
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(slot)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(slot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

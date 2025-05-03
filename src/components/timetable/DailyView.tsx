
import { Clock, BookOpen, Coffee, Calendar } from 'lucide-react';
import { TimeSlot, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { isValidTimeFormat } from '@/utils/timeUtils';

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
  // Filter slots for the selected day and ensure they have valid time formats
  const filteredSlots = timeSlots.filter(slot => 
    slot.dayOfWeek === selectedDay && 
    isValidTimeFormat(slot.startTime) &&
    isValidTimeFormat(slot.endTime)
  );

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
    }
    return slot.title || 'Untitled';
  };

  const formatTimeDisplay = (timeString: string): string => {
    try {
      if (!isValidTimeFormat(timeString)) {
        return 'Invalid Time';
      }
      
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      return new Intl.DateTimeFormat('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
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
              {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
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
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(slot.id)}
                >
                  Delete
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

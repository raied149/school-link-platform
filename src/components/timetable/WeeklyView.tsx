
import { Clock, BookOpen, Coffee, Calendar } from 'lucide-react';
import { TimeSlot, WeekDay, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WeeklyViewProps {
  timeSlots: TimeSlot[];
  weekDays: WeekDay[];
  isLoading: boolean;
  formatTime: (time: string) => string;
  getSubjectName: (subjectId?: string) => string;
  getClassName: (classId: string) => string;
  getSectionName: (sectionId: string) => string;
  user?: { role?: string };
}

export function WeeklyView({
  timeSlots,
  weekDays,
  isLoading,
  formatTime,
  getSubjectName,
  getClassName,
  getSectionName,
  user
}: WeeklyViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No time slots scheduled for this week</p>
      </div>
    );
  }

  // Get unique time slots
  const timeSet = new Set<string>();
  timeSlots.forEach(slot => {
    timeSet.add(slot.startTime);
  });
  
  const timeArray = Array.from(timeSet).sort();

  const getSlotIcon = (slotType: SlotType) => {
    switch (slotType) {
      case 'subject': return <BookOpen className="h-4 w-4 mb-1" />;
      case 'break': return <Coffee className="h-4 w-4 mb-1" />;
      case 'event': return <Calendar className="h-4 w-4 mb-1" />;
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

  const getSlotColor = (slotType: SlotType) => {
    switch (slotType) {
      case 'subject': return 'bg-primary/10';
      case 'break': return 'bg-amber-100';
      case 'event': return 'bg-green-100';
      default: return 'bg-primary/10';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            {weekDays.map(day => (
              <TableHead key={day}>{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeArray.map(time => (
            <TableRow key={time}>
              <TableCell className="font-medium">{formatTime(time)}</TableCell>
              {weekDays.map(day => {
                const slot = timeSlots.find(
                  s => s.startTime === time && s.dayOfWeek === day
                );
                
                return (
                  <TableCell key={day} className="min-w-[150px]">
                    {slot ? (
                      <div className={`p-2 ${getSlotColor(slot.slotType)} rounded-md`}>
                        {getSlotIcon(slot.slotType)}
                        <p className="font-medium">{getSlotDetails(slot)}</p>
                        {slot.slotType === 'subject' && (
                          <p className="text-xs text-muted-foreground">
                            {user?.role === 'student' 
                              ? `Teacher ${slot.teacherId || 'N/A'}` 
                              : `${getClassName(slot.classId)} - ${getSectionName(slot.sectionId)}`}
                          </p>
                        )}
                        <p className="text-xs">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                      </div>
                    ) : null}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

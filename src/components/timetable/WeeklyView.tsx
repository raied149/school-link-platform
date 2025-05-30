
import { Clock, BookOpen, Coffee, Calendar, Edit, Trash2 } from 'lucide-react';
import { TimeSlot, WeekDay, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { isValidTimeFormat } from '@/utils/timeUtils';

interface WeeklyViewProps {
  timeSlots: TimeSlot[];
  weekDays: WeekDay[];
  isLoading: boolean;
  formatTime: (time: string) => string;
  getSubjectName: (subjectId?: string) => string;
  getClassName: (classId: string) => string;
  getSectionName: (sectionId: string) => string;
  getTeacherName?: (teacherId?: string) => string;
  user?: { role?: string };
  showTeacher?: boolean;
  onEdit?: (timeSlot: TimeSlot) => void;
  onDelete?: (id: string) => void;
}

export function WeeklyView({
  timeSlots,
  weekDays,
  isLoading,
  formatTime,
  getSubjectName,
  getClassName,
  getSectionName,
  getTeacherName = () => 'N/A',
  user,
  showTeacher = true,
  onEdit,
  onDelete
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

  // Get unique time slots and ensure they're valid
  const timeSet = new Set<string>();
  
  timeSlots.forEach(slot => {
    try {
      // Only add if it's a valid time format
      if (isValidTimeFormat(slot.startTime)) {
        timeSet.add(slot.startTime);
      } else {
        console.warn(`Invalid time format skipped: ${slot.startTime}`);
      }
    } catch (error) {
      console.error(`Error processing time: ${slot.startTime}`, error);
    }
  });
  
  // Convert to array and sort
  const timeArray = Array.from(timeSet).sort();

  // If no valid times found, show a message
  if (timeArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Clock className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No valid time slots found. Check time formats.</p>
      </div>
    );
  }

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

  // Debug console logs
  console.log('onEdit function:', !!onEdit);
  console.log('onDelete function:', !!onDelete);

  // Always show action buttons for now during testing
  const showActionButtons = true;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Time</TableHead>
            {weekDays.map(day => (
              <TableHead key={day} className="min-w-[150px]">{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeArray.map(time => (
            <TableRow key={time}>
              <TableCell className="font-medium">
                {formatTime(time)}
              </TableCell>
              {weekDays.map(day => {
                const slot = timeSlots.find(
                  s => s.startTime === time && s.dayOfWeek === day
                );
                
                return (
                  <TableCell key={day} className="min-w-[150px] p-1">
                    {slot ? (
                      <div className={`p-2 ${getSlotColor(slot.slotType)} rounded-md relative`}>
                        <div className="flex items-center justify-center">
                          {getSlotIcon(slot.slotType)}
                        </div>
                        <p className="font-medium text-center">{getSlotDetails(slot)}</p>
                        {showTeacher && slot.teacherId && (
                          <p className="text-xs text-center text-muted-foreground">
                            {getTeacherName(slot.teacherId)}
                          </p>
                        )}
                        
                        {showActionButtons && (onEdit || onDelete) && (
                          <div className="absolute top-1 right-1 flex space-x-1">
                            {onEdit && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 p-1 bg-white/80 hover:bg-white" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(slot);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                            {onDelete && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 p-1 bg-white/80 hover:bg-white" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if(confirm('Are you sure you want to delete this time slot?')) {
                                    onDelete(slot.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        )}
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

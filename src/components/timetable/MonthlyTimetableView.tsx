
import { useState } from 'react';
import { TimeSlot } from '@/types/timetable';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mapNumberToDay } from '@/utils/timeUtils';
import { 
  format, 
  addMonths, 
  subMonths,
  getDaysInMonth,
  setDate,
  getDay,
  getDate
} from 'date-fns';

interface MonthlyTimetableViewProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  user?: { role?: string };
}

export function MonthlyTimetableView({
  timeSlots,
  isLoading,
  onEdit,
  onDelete,
  onDateSelect,
  selectedDate,
  user
}: MonthlyTimetableViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Get days with scheduled time slots
  const getDaysWithEvents = () => {
    const days: Date[] = [];
    
    timeSlots.forEach(slot => {
      const dayName = slot.dayOfWeek;
      const dayNumber = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName);
      
      // For each day in the current month
      const daysInMonth = getDaysInMonth(currentMonth);
      for (let i = 1; i <= daysInMonth; i++) {
        const date = setDate(currentMonth, i);
        if (getDay(date) === dayNumber) {
          days.push(date);
        }
      }
    });
    
    return days;
  };

  const eventDates = getDaysWithEvents();
  
  const formatTimeDisplay = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous Month
        </Button>
        
        <h3 className="text-lg font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          Next Month <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md border shadow-sm pointer-events-auto"
          modifiers={{
            booked: eventDates,
          }}
          modifiersStyles={{
            booked: { fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
          }}
          disabled={isLoading}
        />
      </Card>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Time slots for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</h4>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {timeSlots
              .filter(slot => slot.dayOfWeek === mapNumberToDay(getDay(selectedDate)))
              .map((slot) => (
                <div 
                  key={slot.id}
                  className="p-3 bg-white border rounded-md mb-2 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{slot.title || 'Untitled'}</p>
                      <p className="text-sm text-gray-500">
                        {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                      </p>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(slot)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(slot.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            {timeSlots.filter(slot => slot.dayOfWeek === mapNumberToDay(getDay(selectedDate))).length === 0 && (
              <p className="text-gray-500">No time slots scheduled for this day.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

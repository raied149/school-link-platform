
import { useState } from 'react';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { WeeklyView } from '@/components/timetable/WeeklyView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyTimetableViewProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
  user?: { role?: string };
}

export function WeeklyTimetableView({
  timeSlots,
  isLoading,
  onEdit,
  onDelete,
  user
}: WeeklyTimetableViewProps) {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  
  const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const handlePreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
  };

  const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const formatWeekRange = () => {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const getSubjectName = (subjectId?: string) => {
    const slot = timeSlots.find(s => s.subjectId === subjectId);
    return slot?.title || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return classId || 'Unknown Class';
  };

  const getSectionName = (sectionId: string) => {
    return sectionId || 'Unknown Section';
  };

  const getTeacherName = (teacherId?: string) => {
    return teacherId || 'Unknown Teacher';
  };

  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous Week
        </Button>
        
        <h3 className="text-lg font-medium">{formatWeekRange()}</h3>
        
        <Button variant="outline" size="sm" onClick={handleNextWeek}>
          Next Week <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <WeeklyView
        timeSlots={timeSlots}
        weekDays={weekDays}
        isLoading={isLoading}
        formatTime={formatTime}
        getSubjectName={getSubjectName}
        getClassName={getClassName}
        getSectionName={getSectionName}
        getTeacherName={getTeacherName}
        user={user}
      />
    </div>
  );
}


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { classService } from '@/services/classService';
import { sectionService } from '@/services/sectionService';
import { TimetableFilter, WeekDay } from '@/types/timetable';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { DailyView } from '@/components/timetable/DailyView';
import { WeeklyView } from '@/components/timetable/WeeklyView';

const TimetablePage = () => {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly'>('daily');
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  
  const weekDays = timetableService.getWeekDays();
  
  // For demo purposes, using fixed IDs. In a real app, get these from user profile
  const filter: TimetableFilter = {};
  
  // If user is a student, filter by their class/section
  if (user?.role === 'student') {
    filter.classId = '1'; // Example class ID
    filter.sectionId = '1'; // Example section ID
  }
  
  // If user is a teacher, filter by their ID
  if (user?.role === 'teacher') {
    filter.teacherId = '1'; // Example teacher ID
  }
  
  // Add day filter if in daily view
  if (selectedView === 'daily') {
    filter.dayOfWeek = selectedDay;
  }

  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ['timetable', selectedView, selectedDay, filter],
    queryFn: () => timetableService.getTimeSlots(filter)
  });
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects()
  });
  
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses()
  });
  
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionService.getSections()
  });

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };
  
  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'Unknown Class';
  };
  
  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown Section';
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">
          {user?.role === 'student' 
            ? 'Your class schedule' 
            : user?.role === 'teacher' 
              ? 'Your teaching schedule' 
              : 'All timetables'}
        </p>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="daily" onValueChange={(value) => setSelectedView(value as 'daily' | 'weekly')}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            </TabsList>
            
            {selectedView === 'daily' && (
              <div>
                <TabsList>
                  {weekDays.map(day => (
                    <TabsTrigger 
                      key={day} 
                      value={day} 
                      onClick={() => setSelectedDay(day)}
                      className={selectedDay === day ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {day.substring(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            )}
          </div>
          
          <TabsContent value="daily">
            <DailyView
              timeSlots={timeSlots}
              selectedDay={selectedDay}
              isLoading={isLoading}
              formatTime={formatTime}
              getSubjectName={getSubjectName}
              user={user}
            />
          </TabsContent>
          
          <TabsContent value="weekly">
            <WeeklyView
              timeSlots={timeSlots}
              weekDays={weekDays}
              isLoading={isLoading}
              formatTime={formatTime}
              getSubjectName={getSubjectName}
              getClassName={getClassName}
              getSectionName={getSectionName}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default TimetablePage;

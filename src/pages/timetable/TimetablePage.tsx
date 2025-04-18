
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { classService } from '@/services/classService';
import { sectionService } from '@/services/sectionService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimetableFilter, WeekDay } from '@/types/timetable';
import { Clock, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

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
    // Convert HH:MM to a date object for formatting
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a'); // e.g., "2:30 PM"
  };
  
  const renderDailyView = () => {
    const filteredSlots = timeSlots.filter(slot => slot.dayOfWeek === selectedDay);
    
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
                <TableCell>{getClassName(slot.classId)} - {getSectionName(slot.sectionId)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const renderWeeklyView = () => {
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
                        <div className="p-2 bg-primary/10 rounded-md">
                          <p className="font-medium">{getSubjectName(slot.subjectId)}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.role === 'student' 
                              ? `Teacher ${slot.teacherId}` 
                              : `${getClassName(slot.classId)} - ${getSectionName(slot.sectionId)}`}
                          </p>
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
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : renderDailyView()}
          </TabsContent>
          
          <TabsContent value="weekly">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : renderWeeklyView()}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default TimetablePage;

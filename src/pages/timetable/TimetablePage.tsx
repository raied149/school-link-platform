
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
import { format, isValid } from 'date-fns';
import { DailyView } from '@/components/timetable/DailyView';
import { WeeklyView } from '@/components/timetable/WeeklyView';
import { TimetableManagement } from '@/components/timetable/TimetableManagement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';

const TimetablePage = () => {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'management'>('daily');
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  
  // Fetch classes from the database
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
        
      if (error) {
        console.error("Error fetching classes:", error);
        throw error;
      }
      
      return (data || []).map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        academicYearId: cls.year_id,
        createdAt: cls.created_at
      }));
    }
  });
  
  // Fetch sections based on selected class
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', selectedClassId);
        
      if (error) {
        console.error("Error fetching sections:", error);
        throw error;
      }
      
      return (data || []).map((section: any) => ({
        id: section.id,
        name: section.name,
        classId: section.class_id,
        academicYearId: '1', // Default academic year ID
        teacherId: section.teacher_id,
        createdAt: section.created_at,
        updatedAt: section.created_at
      }));
    },
    enabled: !!selectedClassId
  });
  
  const weekDays = timetableService.getWeekDays();
  
  // Default filters based on user role
  const filter: TimetableFilter = {};
  
  // Add selections to filter
  if (selectedClassId) {
    filter.classId = selectedClassId;
  }
  
  if (selectedSectionId) {
    filter.sectionId = selectedSectionId;
  }
  
  // If student, filter by their class/section
  if (user?.role === 'student') {
    filter.classId = filter.classId || '1'; // Example class ID
    filter.sectionId = filter.sectionId || '1'; // Example section ID
  }
  
  // If teacher, filter by their ID
  if (user?.role === 'teacher') {
    filter.teacherId = '1'; // Example teacher ID
  }
  
  // Add day filter if in daily view
  if (selectedView === 'daily') {
    filter.dayOfWeek = selectedDay;
  }

  const { data: timeSlots = [], isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ['timetable', selectedView, selectedDay, filter],
    queryFn: () => timetableService.getTimeSlots(filter),
    enabled: (!!selectedClassId && !!selectedSectionId) || user?.role === 'student' || user?.role === 'teacher'
  });
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects()
  });
  
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'N/A';
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
    try {
      if (!timeString || typeof timeString !== 'string' || !timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return 'Invalid Time';
      }
      
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      
      if (!isValid(date)) {
        return 'Invalid Time';
      }
      
      return format(date, 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return 'Invalid Time';
    }
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSectionId(''); // Reset section when class changes
  };

  const isReadyToDisplay = (!!selectedClassId && !!selectedSectionId) || user?.role === 'student' || user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
        <p className="text-muted-foreground">
          {user?.role === 'student' 
            ? 'Your class schedule' 
            : user?.role === 'teacher' 
              ? 'Your teaching schedule' 
              : 'Manage school timetables'}
        </p>
      </div>
      
      {user?.role === 'admin' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="class-select">Class</Label>
            <Select 
              value={selectedClassId} 
              onValueChange={handleClassChange}
              disabled={isLoadingClasses}
            >
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="section-select">Section</Label>
            <Select 
              value={selectedSectionId} 
              onValueChange={setSelectedSectionId}
              disabled={isLoadingSections || !selectedClassId}
            >
              <SelectTrigger id="section-select">
                <SelectValue placeholder={!selectedClassId ? "Select Class First" : "Select Section"} />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <Card className="p-6">
        <Tabs defaultValue="daily" onValueChange={(value) => setSelectedView(value as 'daily' | 'weekly' | 'management')}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              {user?.role === 'admin' && <TabsTrigger value="management">Management</TabsTrigger>}
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
            {isReadyToDisplay ? (
              <DailyView
                timeSlots={timeSlots}
                selectedDay={selectedDay}
                isLoading={isLoadingTimeSlots}
                formatTime={formatTime}
                getSubjectName={getSubjectName}
                user={user}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">Please select a class and section to view timetable</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weekly">
            {isReadyToDisplay ? (
              <WeeklyView
                timeSlots={timeSlots}
                weekDays={weekDays}
                isLoading={isLoadingTimeSlots}
                formatTime={formatTime}
                getSubjectName={getSubjectName}
                getClassName={getClassName}
                getSectionName={getSectionName}
                user={user}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">Please select a class and section to view timetable</p>
              </div>
            )}
          </TabsContent>
          
          {user?.role === 'admin' && (
            <TabsContent value="management">
              {selectedClassId && selectedSectionId ? (
                <TimetableManagement
                  classId={selectedClassId}
                  sectionId={selectedSectionId}
                  academicYearId="1" // Default academic year for demo
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground">Please select a class and section to manage timetable</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default TimetablePage;

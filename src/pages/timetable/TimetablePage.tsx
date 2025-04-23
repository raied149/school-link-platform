
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { useAuth } from '@/contexts/AuthContext';
import { DailyView } from '@/components/timetable/DailyView';
import { TimeSlotForm } from '@/components/timetable/TimeSlotForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PlusIcon } from 'lucide-react';

const TimetablePage = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
  
  // Fetch teachers data for display
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
        
      if (error) {
        console.error("Error fetching teachers:", error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  // Fetch all subjects
  const { data: allSubjects = [] } = useQuery({
    queryKey: ['all-subjects'],
    queryFn: () => subjectService.getSubjects()
  });
  
  const weekDays = timetableService.getWeekDays();
  
  // Default filters based on user role
  const filter: any = {};
  
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
    filter.teacherId = user.id; // Use actual teacher ID
  }
  
  // Add day filter
  filter.dayOfWeek = selectedDay;

  const { data: timeSlots = [], isLoading: isLoadingTimeSlots, refetch } = useQuery({
    queryKey: ['timetable', selectedDay, filter],
    queryFn: () => timetableService.getTimeSlots(filter),
    enabled: (!!selectedClassId && !!selectedSectionId) || user?.role === 'student' || user?.role === 'teacher'
  });
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects()
  });
  
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'N/A';
    
    const subject = subjects.find(s => s.id === subjectId) || 
                   allSubjects.find(s => s.id === subjectId);
                   
    return subject ? subject.name : 'Unknown Subject';
  };
  
  const getClassName = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : classId.substring(0, 8);
  };
  
  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : sectionId.substring(0, 8);
  };
  
  const getTeacherName = (teacherId?: string) => {
    if (teacherId) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        return `${teacher.first_name} ${teacher.last_name}`;
      }
    }
    
    return 'No Teacher Assigned';
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSectionId(''); // Reset section when class changes
  };

  const handleSaveTimeSlot = async (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await timetableService.createTimeSlot(data);
      toast({
        title: "Success",
        description: "Time slot has been saved successfully",
      });
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving time slot:", error);
      toast({
        title: "Error",
        description: "Failed to save time slot",
        variant: "destructive",
      });
    }
  };

  const isReadyToDisplay = (!!selectedClassId && !!selectedSectionId) || user?.role === 'student' || user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        
        {user?.role === 'admin' && selectedClassId && selectedSectionId && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Time Slot
          </Button>
        )}
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
          
          <div>
            <Label htmlFor="day-select">Day</Label>
            <Select 
              value={selectedDay} 
              onValueChange={(day) => setSelectedDay(day as WeekDay)}
            >
              <SelectTrigger id="day-select">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <Card className="p-6">
        {isReadyToDisplay ? (
          <DailyView
            timeSlots={timeSlots}
            selectedDay={selectedDay}
            isLoading={isLoadingTimeSlots}
            getSubjectName={getSubjectName}
            getTeacherName={getTeacherName}
            getClassName={getClassName}
            getSectionName={getSectionName}
            user={user}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">Please select a class and section to view timetable</p>
          </div>
        )}
      </Card>
      
      {isFormOpen && (
        <TimeSlotForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveTimeSlot}
          classId={selectedClassId}
          sectionId={selectedSectionId}
          academicYearId="1" // Default academic year for demo
          selectedDay={selectedDay}
        />
      )}
    </div>
  );
};

export default TimetablePage;

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyTimetableView } from '@/components/timetable/WeeklyTimetableView';
import { DailyView } from '@/components/timetable/DailyView';
import { TimeSlotForm } from '@/components/timetable/TimeSlotForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function TimetablePage() {
  // For testing/development, you can set a default role if needed
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();

  // Debug user role
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  // Get classId and sectionId from URL parameters if available
  useEffect(() => {
    const classIdParam = params.classId;
    const sectionIdParam = params.sectionId;
    
    if (classIdParam) setSelectedClassId(classIdParam);
    if (classIdParam && sectionIdParam) setSelectedSectionId(sectionIdParam);
  }, [params.classId, params.sectionId]);

  // Update URL parameters when selections change
  useEffect(() => {
    if (selectedClassId && !selectedSectionId) {
      navigate(`/timetable/${selectedClassId}`);
    } else if (selectedClassId && selectedSectionId) {
      navigate(`/timetable/${selectedClassId}/${selectedSectionId}`);
    }
  }, [selectedClassId, selectedSectionId, navigate]);

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', selectedClassId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClassId
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: () => subjectService.getSubjectsByClass(selectedClassId),
    enabled: !!selectedClassId
  });

  const { data: timeSlots = [], isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ['timetable', selectedClassId, selectedSectionId, viewMode],
    queryFn: () => {
      if (!selectedClassId || !selectedSectionId) {
        return [];
      }
      
      return timetableService.getTimeSlots({
        classId: selectedClassId,
        sectionId: selectedSectionId
      });
    },
    enabled: !!selectedClassId && !!selectedSectionId
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) =>
      timetableService.createTimeSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot created successfully' });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: `Failed to create time slot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: TimeSlot) =>
      timetableService.updateTimeSlot(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot updated successfully' });
      setIsFormOpen(false);
      setEditingTimeSlot(null);
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: `Failed to update time slot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timetableService.deleteTimeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: `Failed to delete time slot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive' 
      });
    }
  });

  const handleSaveTimeSlot = (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTimeSlot) {
      updateMutation.mutate({ ...editingTimeSlot, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setIsFormOpen(true);
  };

  const handleDeleteTimeSlot = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddTimeSlot = () => {
    setEditingTimeSlot(null);
    setIsFormOpen(true);
  };

  const getSubjectName = (subjectId?: string): string => {
    if (!subjectId) return 'Unknown Subject';
    
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const isReadyToDisplay = !!selectedClassId && !!selectedSectionId;
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
  
  // Debug access control
  console.log('isAdminOrTeacher:', isAdminOrTeacher);
  console.log('isReadyToDisplay:', isReadyToDisplay);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Manage class schedules</p>
        </div>
        
        {isReadyToDisplay && (
          <Button onClick={handleAddTimeSlot} className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Time Slot
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="class-select">Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={(value) => {
              setSelectedClassId(value);
              setSelectedSectionId(''); // Reset section when class changes
            }}
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
          <Select value={selectedDay} onValueChange={(day) => setSelectedDay(day as WeekDay)}>
            <SelectTrigger id="day-select">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              {timetableService.getWeekDays().map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'weekly' | 'daily')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
        </TabsList>
        
        <Card className="p-6">
          {isReadyToDisplay ? (
            <>
              <TabsContent value="weekly" className="mt-0">
                <WeeklyTimetableView
                  timeSlots={timeSlots}
                  isLoading={isLoadingTimeSlots}
                  onEdit={handleEditTimeSlot}
                  onDelete={handleDeleteTimeSlot}
                  onAdd={handleAddTimeSlot}
                  user={user}
                />
              </TabsContent>
              <TabsContent value="daily" className="mt-0">
                <DailyView
                  timeSlots={timeSlots}
                  selectedDay={selectedDay}
                  isLoading={isLoadingTimeSlots}
                  getSubjectName={getSubjectName}
                  onEdit={handleEditTimeSlot}
                  onDelete={handleDeleteTimeSlot}
                  user={user}
                />
              </TabsContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">Please select a class and section to view timetable</p>
            </div>
          )}
        </Card>
      </Tabs>

      {isFormOpen && (
        <TimeSlotForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTimeSlot(null);
          }}
          onSave={handleSaveTimeSlot}
          initialData={editingTimeSlot || undefined}
          classId={selectedClassId}
          sectionId={selectedSectionId}
          academicYearId="1"
          selectedDay={selectedDay}
          existingTimeSlots={timeSlots}
        />
      )}
    </div>
  );
}

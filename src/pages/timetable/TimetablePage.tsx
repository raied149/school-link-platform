
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { useAuth } from '@/contexts/AuthContext';
import { DailyView } from '@/components/timetable/DailyView';
import { TimeSlotForm } from '@/components/timetable/TimeSlotForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PlusIcon, Edit, Trash2 } from 'lucide-react';

export default function TimetablePage() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const queryClient = useQueryClient();

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

  const { data: timeSlots = [], isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ['timetable', selectedDay, selectedClassId, selectedSectionId],
    queryFn: () => timetableService.getTimeSlots({
      dayOfWeek: selectedDay,
      classId: selectedClassId,
      sectionId: selectedSectionId
    }),
    enabled: !!selectedClassId && !!selectedSectionId
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) =>
      timetableService.createTimeSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot created successfully' });
      setIsFormOpen(false);
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
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => timetableService.deleteTimeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot deleted successfully' });
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
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      deleteMutation.mutate(id);
    }
  };

  const isReadyToDisplay = !!selectedClassId && !!selectedSectionId;
  const weekDays = timetableService.getWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Manage class schedules</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="class-select">Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
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
              {weekDays.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-6">
        {isReadyToDisplay ? (
          <>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => {
                setEditingTimeSlot(null);
                setIsFormOpen(true);
              }}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
            <DailyView
              timeSlots={timeSlots}
              selectedDay={selectedDay}
              isLoading={isLoadingTimeSlots}
              getSubjectName={(id) => {
                const subject = timeSlots.find(s => s.subjectId === id);
                return subject?.title || 'Unknown Subject';
              }}
              onEdit={handleEditTimeSlot}
              onDelete={handleDeleteTimeSlot}
              user={user}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">Please select a class and section to view timetable</p>
          </div>
        )}
      </Card>

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


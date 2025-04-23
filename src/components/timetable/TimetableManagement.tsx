
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Clock, BookOpen, Coffee, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimeSlotForm } from './TimeSlotForm';
import { TimeSlot, WeekDay, SlotType } from '@/types/timetable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TimetableManagementProps {
  classId: string;
  sectionId: string;
  academicYearId: string;
}

export function TimetableManagement({ classId, sectionId, academicYearId }: TimetableManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  
  const weekDays = timetableService.getWeekDays();
  
  // Fetch time slots for the selected day and section
  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ['timetable', classId, sectionId, academicYearId, selectedDay],
    queryFn: () => timetableService.getTimeSlots({
      classId,
      sectionId,
      academicYearId,
      dayOfWeek: selectedDay
    })
  });
  
  // Fetch subjects for this class
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => subjectService.getSubjectsByClass(classId)
  });
  
  // Fetch teachers assigned to subjects
  const { data: teacherMap = {}, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['subject-teachers', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select('subject_id, teacher_id');
        
      if (error) throw error;
      
      const teacherMapping: Record<string, string> = {};
      (data || []).forEach((item: any) => {
        teacherMapping[item.subject_id] = item.teacher_id;
      });
      
      return teacherMapping;
    }
  });
  
  // CRUD mutations
  const createMutation = useMutation({
    mutationFn: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => 
      timetableService.createTimeSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot was added successfully' });
      setIsFormOpen(false);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>> }) => 
      timetableService.updateTimeSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot was updated successfully' });
      setIsFormOpen(false);
      setEditingTimeSlot(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => timetableService.deleteTimeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      toast({ title: 'Success', description: 'Time slot was removed successfully' });
    }
  });
  
  // Event handlers
  const handleAddTimeSlot = () => {
    setEditingTimeSlot(null);
    setIsFormOpen(true);
  };
  
  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setIsFormOpen(true);
  };
  
  const handleDeleteTimeSlot = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleSaveTimeSlot = (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTimeSlot) {
      updateMutation.mutate({ id: editingTimeSlot.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Helper functions
  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
  
  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return '';
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getTeacherNameForSubject = (subjectId?: string) => {
    if (!subjectId) return '';
    const teacherId = teacherMap[subjectId];
    if (!teacherId) return 'No Teacher Assigned';
    
    return `Teacher ${teacherId.substring(0, 6)}`;
  };
  
  const getSlotIcon = (slotType: SlotType) => {
    switch (slotType) {
      case 'subject': return <BookOpen className="h-4 w-4 mr-2" />;
      case 'break': return <Coffee className="h-4 w-4 mr-2" />;
      case 'event': return <Calendar className="h-4 w-4 mr-2" />;
      default: return null;
    }
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Timetable Management</h2>
            {isAdminOrTeacher && (
              <Button onClick={handleAddTimeSlot} disabled={isFormOpen}>
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
            )}
          </div>
          
          <Tabs value={selectedDay} onValueChange={(value) => setSelectedDay(value as WeekDay)} className="w-full">
            <TabsList className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <TabsTrigger key={day} value={day}>
                  {day.substring(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {weekDays.map(day => (
              <TabsContent key={day} value={day} className="p-0">
                <div className="rounded-md border">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No time slots scheduled for {day}</p>
                      {isAdminOrTeacher && (
                        <Button variant="outline" onClick={handleAddTimeSlot} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Time Slot
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>Teacher</TableHead>
                          {isAdminOrTeacher && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeSlots
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot) => (
                            <TableRow key={slot.id}>
                              <TableCell>{formatTime(slot.startTime)}</TableCell>
                              <TableCell>{formatTime(slot.endTime)}</TableCell>
                              <TableCell className="capitalize">{slot.slotType}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {getSlotIcon(slot.slotType)}
                                  {slot.slotType === 'subject' 
                                    ? getSubjectName(slot.subjectId) 
                                    : slot.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                {slot.slotType === 'subject' && getTeacherNameForSubject(slot.subjectId)}
                              </TableCell>
                              {isAdminOrTeacher && (
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditTimeSlot(slot)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeSlot(slot.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {isFormOpen && (
        <TimeSlotForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTimeSlot(null);
          }}
          onSave={handleSaveTimeSlot}
          initialData={editingTimeSlot || {
            dayOfWeek: selectedDay,
            classId,
            sectionId,
            academicYearId
          }}
          classId={classId}
          sectionId={sectionId}
          academicYearId={academicYearId}
        />
      )}
    </div>
  );
}

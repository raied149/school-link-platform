import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimeSlot, WeekDay, SlotType } from '@/types/timetable';
import { timetableService } from '@/services/timetableService';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { format, parse, addMinutes } from 'date-fns';
import { TimeFieldSection } from './TimeFieldSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<TimeSlot>;
  classId: string;
  sectionId: string;
  academicYearId: string;
}

const formSchema = z.object({
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as [WeekDay, ...WeekDay[]]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time (HH:MM)" }),
  duration: z.number().min(15, { message: "Duration must be at least 15 minutes" }).max(240, { message: "Duration cannot exceed 4 hours" }),
  slotType: z.enum(['subject', 'break', 'event'] as [SlotType, ...SlotType[]]),
  title: z.string().optional(),
  subjectId: z.string().optional(),
  classId: z.string(),
  sectionId: z.string(),
  academicYearId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function TimeSlotForm({ isOpen, onClose, onSave, initialData, classId, sectionId, academicYearId }: TimeSlotFormProps) {
  const [calculatedEndTime, setCalculatedEndTime] = useState<string>(
    initialData?.endTime || ''
  );
  
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => {
      const { data: subjectClasses, error: subjectClassesError } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', classId);

      if (subjectClassesError) throw subjectClassesError;

      if (!subjectClasses?.length) return [];

      const subjectIds = subjectClasses.map(sc => sc.subject_id);

      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds);

      if (subjectsError) throw subjectsError;

      return subjects || [];
    },
    enabled: !!classId
  });
  
  const [selectedSlotType, setSelectedSlotType] = useState<SlotType>(initialData?.slotType || 'subject');
  
  const slotTypes = timetableService.getSlotTypes();
  const weekDays = timetableService.getWeekDays();
  const timeOptions = timetableService.getTimeRange();
  
  const defaultValues: FormValues = {
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    startTime: initialData?.startTime || '08:00',
    duration: initialData?.duration || 60,
    slotType: initialData?.slotType || 'subject',
    title: initialData?.title || '',
    subjectId: initialData?.subjectId || '',
    classId: initialData?.classId || classId,
    sectionId: initialData?.sectionId || sectionId,
    academicYearId: initialData?.academicYearId || academicYearId,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    try {
      const startDate = parse(startTime, 'HH:mm', new Date());
      const endDate = addMinutes(startDate, durationMinutes);
      return format(endDate, 'HH:mm');
    } catch (error) {
      return '';
    }
  };
  
  const handleStartTimeChange = (value: string) => {
    form.setValue('startTime', value);
    const endTime = calculateEndTime(value, form.getValues('duration'));
    setCalculatedEndTime(endTime);
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = Number(e.target.value);
    form.setValue('duration', duration);
    const endTime = calculateEndTime(form.getValues('startTime'), duration);
    setCalculatedEndTime(endTime);
  };
  
  const handleSlotTypeChange = (value: string) => {
    const slotType = value as SlotType;
    setSelectedSlotType(slotType);
    form.setValue('slotType', slotType);
    
    if (slotType !== 'subject') {
      form.setValue('subjectId', undefined);
    }
    
    if (slotType === 'subject') {
      form.setValue('title', '');
    }
  };
  
  const onSubmit = (values: FormValues) => {
    const timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'> = {
      startTime: values.startTime,
      endTime: calculatedEndTime,
      slotType: values.slotType,
      dayOfWeek: values.dayOfWeek,
      classId: values.classId,
      sectionId: values.sectionId,
      academicYearId: values.academicYearId
    };
    
    if (values.slotType === 'subject' && values.subjectId) {
      timeSlotData.subjectId = values.subjectId;
    } else if (values.slotType === 'break' || values.slotType === 'event') {
      timeSlotData.title = values.title;
    }
    
    onSave(timeSlotData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Time Slot' : 'Add Time Slot'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TimeFieldSection
              control={form.control}
              weekDays={weekDays}
              timeOptions={timeOptions}
              calculatedEndTime={calculatedEndTime}
              onStartTimeChange={handleStartTimeChange}
              onDurationChange={handleDurationChange}
            />
            
            <FormField
              control={form.control}
              name="slotType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleSlotTypeChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="subject">Subject</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedSlotType === 'subject' ? (
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingSubjects}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select subject"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedSlotType === 'break' ? 'Break Name' : 'Event Name'}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedSlotType === 'break' ? 'Enter break name' : 'Enter event name'} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData?.id ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

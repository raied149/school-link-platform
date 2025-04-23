
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
import { formatTimeFromParts, hasTimeConflict } from '@/utils/timeUtils';

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
  startHour: z.string().min(1, { message: "Hour is required" }),
  startMinute: z.string().min(1, { message: "Minute is required" }),
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
  const [calculatedEndTime, setCalculatedEndTime] = useState<string>('');
  const [hasConflict, setHasConflict] = useState(false);
  
  const { data: timeSlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['timetable-all-slots'],
    queryFn: () => timetableService.getTimeSlots({
      classId,
      sectionId,
      academicYearId
    })
  });
  
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
  
  const parseInitialTime = () => {
    if (initialData?.startTime && /^([0-9]{1,2}):([0-9]{2})$/.test(initialData.startTime)) {
      const [hour, minute] = initialData.startTime.split(':');
      return { hour, minute };
    }
    return { hour: '08', minute: '00' };
  };
  
  const { hour, minute } = parseInitialTime();
  
  const defaultValues: FormValues = {
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    startHour: hour,
    startMinute: minute,
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
  
  const calculateEndTime = (hour: string, minute: string, durationMinutes: number): string => {
    try {
      const timeString = formatTimeFromParts(hour, minute);
      if (!timeString) return '';
      
      const startDate = parse(timeString, 'HH:mm', new Date());
      if (!startDate || isNaN(startDate.getTime())) return '';
      
      const endDate = addMinutes(startDate, durationMinutes);
      return format(endDate, 'HH:mm');
    } catch (error) {
      console.error("Error calculating end time:", error);
      return '';
    }
  };
  
  const checkTimeConflict = (hour: string, minute: string, durationMinutes: number, dayOfWeek: WeekDay) => {
    if (isLoadingSlots) return;
    
    const startTime = formatTimeFromParts(hour, minute);
    const endTime = calculateEndTime(hour, minute, durationMinutes);
    
    if (!startTime || !endTime) {
      setHasConflict(false);
      return;
    }
    
    const conflict = hasTimeConflict(
      startTime, 
      endTime, 
      dayOfWeek, 
      timeSlots, 
      initialData?.id
    );
    
    setHasConflict(conflict);
  };
  
  const handleStartTimeChange = (hour: string, minute: string) => {
    const endTime = calculateEndTime(hour, minute, form.getValues('duration'));
    setCalculatedEndTime(endTime);
    
    checkTimeConflict(
      hour, 
      minute, 
      form.getValues('duration'),
      form.getValues('dayOfWeek')
    );
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = Number(e.target.value);
    form.setValue('duration', duration);
    const hour = form.getValues('startHour');
    const minute = form.getValues('startMinute');
    const endTime = calculateEndTime(hour, minute, duration);
    setCalculatedEndTime(endTime);
    
    checkTimeConflict(hour, minute, duration, form.getValues('dayOfWeek'));
  };
  
  const handleDayChange = (value: string) => {
    const dayOfWeek = value as WeekDay;
    form.setValue('dayOfWeek', dayOfWeek);
    
    checkTimeConflict(
      form.getValues('startHour'),
      form.getValues('startMinute'),
      form.getValues('duration'),
      dayOfWeek
    );
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
  
  useEffect(() => {
    const hour = form.getValues('startHour');
    const minute = form.getValues('startMinute');
    const duration = form.getValues('duration');
    const endTime = calculateEndTime(hour, minute, duration);
    setCalculatedEndTime(endTime);
    
    if (!isLoadingSlots) {
      checkTimeConflict(
        hour, 
        minute, 
        duration, 
        form.getValues('dayOfWeek')
      );
    }
  }, [timeSlots, isLoadingSlots]);
  
  const onSubmit = (values: FormValues) => {
    const startTime = formatTimeFromParts(values.startHour, values.startMinute);
    
    if (!startTime || !calculatedEndTime) {
      console.error("Invalid time format");
      return;
    }
    
    const conflict = hasTimeConflict(
      startTime,
      calculatedEndTime,
      values.dayOfWeek,
      timeSlots,
      initialData?.id
    );
    
    if (conflict) {
      setHasConflict(true);
      return;
    }
    
    const timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'> = {
      startTime: startTime,
      endTime: calculatedEndTime,
      duration: values.duration,
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleDayChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekDays.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <TimeFieldSection
                control={form.control}
                calculatedEndTime={calculatedEndTime}
                onStartTimeChange={handleStartTimeChange}
                onDurationChange={handleDurationChange}
              />
            </div>
            
            {hasConflict && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
                This time slot conflicts with an existing slot on the same day. Please choose a different time.
              </div>
            )}
            
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
              <Button type="submit" disabled={hasConflict}>
                {initialData?.id ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

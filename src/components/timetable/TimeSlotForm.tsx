
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parse, addMinutes } from 'date-fns';

interface TimeSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<TimeSlot>;
  classId: string;
}

const formSchema = z.object({
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as [WeekDay, ...WeekDay[]]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time (HH:MM)" }),
  duration: z.number().min(15, { message: "Duration must be at least 15 minutes" }).max(240, { message: "Duration cannot exceed 4 hours" }),
  subjectId: z.string(),
  teacherId: z.string(),
  classId: z.string(),
  sectionId: z.string(),
  academicYearId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function TimeSlotForm({ isOpen, onClose, onSave, initialData, classId }: TimeSlotFormProps) {
  const [calculatedEndTime, setCalculatedEndTime] = useState<string>(
    initialData?.endTime || ''
  );
  
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => subjectService.getSubjectsByClass(classId)
  });
  
  // Mock teacher data - In a real app, fetch this from an API
  const teachers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Michael Johnson' }
  ];
  
  const weekDays = timetableService.getWeekDays();
  const timeOptions = timetableService.getTimeRange();
  
  let defaultValues: FormValues = {
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    startTime: initialData?.startTime || '08:00',
    duration: 60, // Default duration in minutes
    subjectId: initialData?.subjectId || '',
    teacherId: initialData?.teacherId || '',
    classId: initialData?.classId || classId,
    sectionId: initialData?.sectionId || '',
    academicYearId: initialData?.academicYearId || '',
  };
  
  if (initialData?.startTime && initialData?.endTime) {
    // Calculate duration from start and end time
    const startDate = parse(initialData.startTime, 'HH:mm', new Date());
    const endDate = parse(initialData.endTime, 'HH:mm', new Date());
    const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000));
    defaultValues.duration = durationInMinutes;
  }
  
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
  
  // Update end time when start time or duration changes
  const watchStartTime = form.watch('startTime');
  const watchDuration = form.watch('duration');
  
  useState(() => {
    if (watchStartTime) {
      const endTime = calculateEndTime(watchStartTime, watchDuration || 60);
      setCalculatedEndTime(endTime);
    }
  });
  
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
  
  const onSubmit = (values: FormValues) => {
    const timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'> = {
      ...values,
      endTime: calculatedEndTime
    };
    onSave(timeSlotData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData && initialData.id ? 'Edit Time Slot' : 'Add Time Slot'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
              
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select
                      onValueChange={handleStartTimeChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        {...field}
                        onChange={handleDurationChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input value={calculatedEndTime} readOnly disabled />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
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
            
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData && initialData.id ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

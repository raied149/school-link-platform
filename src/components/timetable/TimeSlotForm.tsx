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
import { Form } from '@/components/ui/form';
import { format, parse, addMinutes } from 'date-fns';
import { TimeFieldSection } from './TimeFieldSection';
import { SubjectTeacherSection } from './SubjectTeacherSection';

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
  
  const teachers = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Michael Johnson' }
  ];
  
  const weekDays = timetableService.getWeekDays();
  const timeOptions = timetableService.getTimeRange();
  
  const defaultValues = {
    dayOfWeek: initialData?.dayOfWeek || 'Monday',
    startTime: initialData?.startTime || '08:00',
    duration: initialData?.duration || 60,
    subjectId: initialData?.subjectId || '',
    teacherId: initialData?.teacherId || '',
    classId: initialData?.classId || classId,
    sectionId: initialData?.sectionId || '',
    academicYearId: initialData?.academicYearId || '',
  };
  
  const form = useForm({
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
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'> = {
      startTime: values.startTime,
      endTime: calculatedEndTime,
      subjectId: values.subjectId,
      teacherId: values.teacherId,
      dayOfWeek: values.dayOfWeek,
      classId: values.classId,
      sectionId: values.sectionId,
      academicYearId: values.academicYearId
    };
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
            
            <SubjectTeacherSection
              control={form.control}
              subjects={subjects}
              teachers={teachers}
            />
            
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

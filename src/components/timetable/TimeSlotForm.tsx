
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimeSlot, SlotType, WeekDay } from '@/types/timetable';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { TimeFieldSection } from './TimeFieldSection';
import { TimeSlotFields } from './TimeSlotFields';
import { validateTimeSlotConflict } from '@/utils/timeSlotValidation';
import { calculateEndTime, formatTimeFromParts } from '@/utils/timeUtils';

const formSchema = z.object({
  startHour: z.string().min(1, { message: "Hour is required" }),
  startMinute: z.string().min(1, { message: "Minute is required" }),
  duration: z.number().min(15, { message: "Duration must be at least 15 minutes" }).max(240, { message: "Duration cannot exceed 4 hours" }),
  slotType: z.enum(['subject', 'break', 'event'] as const),
  title: z.string().optional(),
  subjectId: z.string().optional(),
  classId: z.string(),
  sectionId: z.string(),
  academicYearId: z.string(),
  dayOfWeek: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface TimeSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<TimeSlot>;
  classId: string;
  sectionId: string;
  academicYearId: string;
  selectedDay: WeekDay;
  existingTimeSlots: TimeSlot[];
}

export function TimeSlotForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  classId,
  sectionId,
  academicYearId,
  selectedDay,
  existingTimeSlots
}: TimeSlotFormProps) {
  const [calculatedEndTime, setCalculatedEndTime] = useState<string>('');
  const [hasConflict, setHasConflict] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState<SlotType>(initialData?.slotType || 'subject');

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: async () => {
      const { data: subjectClasses } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', classId);

      if (!subjectClasses?.length) return [];

      const subjectIds = subjectClasses.map(sc => sc.subject_id);

      const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds);

      return subjects || [];
    },
    enabled: !!classId
  });

  const parseInitialTime = () => {
    if (initialData?.startTime && /^([0-9]{1,2}):([0-9]{2})$/.test(initialData.startTime)) {
      const [hour, minute] = initialData.startTime.split(':');
      return { hour, minute };
    }
    return { hour: '08', minute: '00' };
  };

  const { hour, minute } = parseInitialTime();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startHour: hour,
      startMinute: minute,
      duration: initialData?.duration || 60,
      slotType: initialData?.slotType || 'subject',
      title: initialData?.title || '',
      subjectId: initialData?.subjectId || '',
      classId,
      sectionId,
      academicYearId,
      dayOfWeek: selectedDay,
    }
  });

  const handleStartTimeChange = (hour: string, minute: string) => {
    const startTime = formatTimeFromParts(hour, minute);
    const endTime = calculateEndTime(hour, minute, form.getValues('duration'));
    setCalculatedEndTime(endTime);

    if (startTime && endTime) {
      const conflict = validateTimeSlotConflict(
        startTime,
        endTime,
        selectedDay,
        sectionId,
        existingTimeSlots,
        initialData?.id
      );
      setHasConflict(conflict);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = Number(e.target.value);
    form.setValue('duration', duration);
    
    const startTime = formatTimeFromParts(
      form.getValues('startHour'),
      form.getValues('startMinute')
    );
    
    const endTime = calculateEndTime(
      form.getValues('startHour'),
      form.getValues('startMinute'),
      duration
    );
    
    setCalculatedEndTime(endTime);

    if (startTime && endTime) {
      const conflict = validateTimeSlotConflict(
        startTime,
        endTime,
        selectedDay,
        sectionId,
        existingTimeSlots,
        initialData?.id
      );
      setHasConflict(conflict);
    }
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
    const startTime = formatTimeFromParts(values.startHour, values.startMinute);

    if (!startTime || !calculatedEndTime) {
      console.error("Invalid time format");
      return;
    }

    const conflict = validateTimeSlotConflict(
      startTime,
      calculatedEndTime,
      selectedDay,
      sectionId,
      existingTimeSlots,
      initialData?.id
    );

    if (conflict) {
      setHasConflict(true);
      return;
    }

    const timeSlotData: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt'> = {
      startTime,
      endTime: calculatedEndTime,
      duration: values.duration,
      slotType: values.slotType,
      dayOfWeek: values.dayOfWeek as WeekDay, // Type cast to WeekDay
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
              calculatedEndTime={calculatedEndTime}
              onStartTimeChange={handleStartTimeChange}
              onDurationChange={handleDurationChange}
            />

            {hasConflict && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
                This time slot conflicts with an existing slot. Please choose a different time.
              </div>
            )}

            <TimeSlotFields
              form={form}
              selectedSlotType={selectedSlotType}
              onSlotTypeChange={handleSlotTypeChange}
              subjects={subjects}
              isLoadingSubjects={isLoadingSubjects}
            />

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


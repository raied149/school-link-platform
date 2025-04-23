
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SlotType } from '@/types/timetable';

interface TimeSlotFieldsProps {
  form: UseFormReturn<any>;
  selectedSlotType: SlotType;
  onSlotTypeChange: (value: string) => void;
  subjects: any[];
  isLoadingSubjects: boolean;
}

export function TimeSlotFields({
  form,
  selectedSlotType,
  onSlotTypeChange,
  subjects,
  isLoadingSubjects
}: TimeSlotFieldsProps) {
  const slotTypes: SlotType[] = ['subject', 'break', 'event'];

  return (
    <>
      <FormField
        control={form.control}
        name="slotType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slot Type</FormLabel>
            <Select onValueChange={onSlotTypeChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {slotTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingSubjects}>
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
    </>
  );
}


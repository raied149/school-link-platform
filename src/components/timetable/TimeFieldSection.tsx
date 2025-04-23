
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WeekDay } from '@/types/timetable';
import { validateHour, validateMinute } from '@/utils/timeUtils';

interface TimeFieldSectionProps {
  control: Control<any>;
  weekDays: WeekDay[];
  calculatedEndTime: string;
  onStartTimeChange: (hour: string, minute: string) => void;
  onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TimeFieldSection({
  control,
  weekDays,
  calculatedEndTime,
  onStartTimeChange,
  onDurationChange,
}: TimeFieldSectionProps) {
  return (
    <>
      <FormField
        control={control}
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
      
      <div className="space-y-2">
        <FormLabel>Start Time</FormLabel>
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name="startHour"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="HH"
                    maxLength={2}
                    className="text-center"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || validateHour(value)) {
                        field.onChange(value);
                        onStartTimeChange(value, control._formValues.startMinute || '00');
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-lg">:</span>
          <FormField
            control={control}
            name="startMinute"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    className="text-center"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || validateMinute(value)) {
                        field.onChange(value);
                        onStartTimeChange(control._formValues.startHour || '00', value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    onDurationChange(e);
                  }}
                  value={field.value}
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
    </>
  );
}

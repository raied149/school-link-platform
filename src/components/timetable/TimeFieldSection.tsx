
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

interface TimeFieldSectionProps {
  control: Control<any>;
  weekDays: WeekDay[];
  timeOptions: string[];
  calculatedEndTime: string;
  onStartTimeChange: (value: string) => void;
  onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TimeFieldSection({
  control,
  weekDays,
  timeOptions,
  calculatedEndTime,
  onStartTimeChange,
  onDurationChange,
}: TimeFieldSectionProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
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
        
        <FormField
          control={control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  onStartTimeChange(value);
                }}
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

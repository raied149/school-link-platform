
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface TimeFieldSectionProps {
  control: Control<any>;
  calculatedEndTime: string;
  onStartTimeChange: (hour: string, minute: string) => void;
  onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TimeFieldSection({ 
  control,
  calculatedEndTime,
  onStartTimeChange,
  onDurationChange
}: TimeFieldSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Hour</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Hour (0-23)" 
                  min={0} 
                  max={23}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onStartTimeChange(e.target.value, control._getWatch('startMinute'));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="startMinute"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Minute</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Minute (0-59)" 
                  min={0} 
                  max={59}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onStartTimeChange(control._getWatch('startHour'), e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name="duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (minutes)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Duration in minutes" 
                min={15} 
                max={240} 
                step={5} 
                {...field}
                onChange={onDurationChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <FormLabel>End Time</FormLabel>
        <Input 
          value={calculatedEndTime || ''} 
          disabled 
          readOnly 
          placeholder="Will be calculated automatically"
        />
        <p className="text-sm text-muted-foreground mt-1">
          End time is automatically calculated based on start time and duration
        </p>
      </div>
    </div>
  );
}

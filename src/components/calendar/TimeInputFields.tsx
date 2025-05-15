
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";

interface TimeInputFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  prefix: "start" | "end";
  label: string;
}

export function TimeInputFields({ form, prefix, label }: TimeInputFieldsProps) {
  // Validate and normalize time inputs
  const sanitizeTimeInput = (value: string): string => {
    // Only allow digits
    const sanitized = value.replace(/\D/g, '');
    
    // Ensure within valid range
    if (prefix === 'startHour' || prefix === 'endHour') {
      const hours = parseInt(sanitized, 10);
      if (isNaN(hours)) return '';
      return Math.min(12, Math.max(1, hours)).toString().padStart(2, '0');
    } else if (prefix === 'startMinute' || prefix === 'endMinute') {
      const minutes = parseInt(sanitized, 10);
      if (isNaN(minutes)) return '';
      return Math.min(59, Math.max(0, minutes)).toString().padStart(2, '0');
    }
    return sanitized;
  };

  return (
    <div className="space-y-4">
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-2">
        <FormField
          control={form.control}
          name={`${prefix}Hour`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="HH"
                  maxLength={2}
                  className="text-center"
                  {...field}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, '');
                    field.onChange(sanitized);
                  }}
                  onBlur={(e) => {
                    // Format to ensure valid hour (1-12)
                    const value = e.target.value;
                    if (value) {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue)) {
                        const formattedValue = Math.min(12, Math.max(1, numValue)).toString().padStart(2, '0');
                        field.onChange(formattedValue);
                      }
                    }
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <span className="text-lg">:</span>
        <FormField
          control={form.control}
          name={`${prefix}Minute`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM"
                  maxLength={2}
                  className="text-center"
                  {...field}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, '');
                    field.onChange(sanitized);
                  }}
                  onBlur={(e) => {
                    // Format to ensure valid minute (0-59)
                    const value = e.target.value;
                    if (value) {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue)) {
                        const formattedValue = Math.min(59, Math.max(0, numValue)).toString().padStart(2, '0');
                        field.onChange(formattedValue);
                      }
                    }
                    field.onBlur();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}Period`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'AM'}>
                <FormControl>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}


import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";
import { format, isValid, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface DateReminderSelectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  date: Date;
  reminderDates: Date[];
  setReminderDates: (dates: Date[]) => void;
}

export function DateReminderSelection({ 
  form, 
  date, 
  reminderDates,
  setReminderDates
}: DateReminderSelectionProps) {
  const [showReminderTime, setShowReminderTime] = useState(form.watch('reminderSet') || false);
  
  // Safe date formatting function
  const formatSafeDate = (dateStr: string): string => {
    try {
      const parsedDate = parseISO(dateStr);
      if (isValid(parsedDate)) {
        return format(parsedDate, "PPP");
      }
      return "Select a date";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Select a date";
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      formatSafeDate(field.value)
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? parseISO(field.value) : undefined}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      field.onChange(format(selectedDate, 'yyyy-MM-dd'));
                    } else {
                      field.onChange('');
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reminderSet"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Set Reminders</FormLabel>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setShowReminderTime(checked);
                }}
              />
            </div>
            {showReminderTime && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="w-full">
                    {reminderDates.length > 0
                      ? `${reminderDates.length} reminder${reminderDates.length > 1 ? 's' : ''} set`
                      : "Select reminder dates"}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={reminderDates}
                    onSelect={(dates) => {
                      // Filter out any invalid dates
                      const validDates = (dates || []).filter(date => 
                        date instanceof Date && !isNaN(date.getTime())
                      );
                      setReminderDates(validDates);
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

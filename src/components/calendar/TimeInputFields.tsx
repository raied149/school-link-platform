
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
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
                  placeholder="HH"
                  maxLength={2}
                  className="text-center"
                  {...field}
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
                  placeholder="MM"
                  maxLength={2}
                  className="text-center"
                  {...field}
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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


import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Teacher } from "@/types";
import { z } from "zod";
import { formSchema } from "./schema";

interface TeacherSelectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  teachers: Teacher[];
  show: boolean;
}

export function TeacherSelection({ form, teachers, show }: TeacherSelectionProps) {
  if (!show) return null;

  return (
    <FormField
      control={form.control}
      name="teacherIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assign Teachers
          </FormLabel>
          <FormControl>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={teacher.id}
                      checked={field.value?.includes(teacher.id)}
                      onCheckedChange={(checked) => {
                        const updatedValue = checked
                          ? [...(field.value || []), teacher.id]
                          : field.value?.filter((id) => id !== teacher.id) || [];
                        field.onChange(updatedValue);
                      }}
                    />
                    <label
                      htmlFor={teacher.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {teacher.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Teacher } from "@/types";
import { z } from "zod";
import { formSchema } from "./schema";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TeacherSelectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  teachers: Teacher[];
  show: boolean;
}

export function TeacherSelection({ form, teachers, show }: TeacherSelectionProps) {
  const [open, setOpen] = useState(false);

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {field.value?.length
                    ? `${field.value.length} teacher${field.value.length > 1 ? 's' : ''} selected`
                    : "Select teachers..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search teachers..." />
                <CommandEmpty>No teachers found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      onSelect={() => {
                        const updatedValue = field.value?.includes(teacher.id)
                          ? field.value.filter((id) => id !== teacher.id)
                          : [...(field.value || []), teacher.id];
                        field.onChange(updatedValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value?.includes(teacher.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {teacher.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

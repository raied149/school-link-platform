
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";
import { format } from "date-fns";

interface EventFormHeaderProps {
  date?: Date;
  formattedDate?: string;
  isToday?: boolean;
  form?: UseFormReturn<z.infer<typeof formSchema>>;
}

export function EventFormHeader({ date, formattedDate, isToday, form }: EventFormHeaderProps) {
  // If form is provided, use the date from the form
  const displayDate = form 
    ? form.watch('date') ? new Date(form.watch('date')) : date 
    : date;
  
  // Use the formatted date from props or format the date from form/props
  const displayFormattedDate = formattedDate || (displayDate ? format(displayDate, 'MMMM d, yyyy') : '');
  
  // Determine if the date is today if not provided explicitly
  const isDateToday = isToday !== undefined 
    ? isToday 
    : displayDate ? format(displayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
        <h3 className="font-medium text-lg">{displayFormattedDate}</h3>
      </div>
      {isDateToday && (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Today
        </Badge>
      )}
    </div>
  );
}

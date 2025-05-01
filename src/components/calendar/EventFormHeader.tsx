
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventFormHeaderProps {
  date: Date;
  formattedDate: string;
  isToday: boolean;
}

export function EventFormHeader({ date, formattedDate, isToday }: EventFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
        <h3 className="font-medium text-lg">{formattedDate}</h3>
      </div>
      {isToday && (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Today
        </Badge>
      )}
    </div>
  );
}

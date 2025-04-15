
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CalendarDatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function CalendarDatePicker({ selected, onSelect }: CalendarDatePickerProps) {
  const [month, setMonth] = React.useState<Date>(new Date());

  const handlePreviousMonth = () => {
    const previousMonth = new Date(month);
    previousMonth.setMonth(month.getMonth() - 1);
    setMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(month.getMonth() + 1);
    setMonth(nextMonth);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between space-x-2 px-1 pb-4">
        <h2 className="font-semibold text-lg">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className={cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className={cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        className="rounded-md border shadow-sm"
        classNames={{
          day_today: "bg-primary text-primary-foreground font-bold",
          day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        }}
      />
    </Card>
  );
}

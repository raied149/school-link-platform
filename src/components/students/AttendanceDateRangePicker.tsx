
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface AttendanceDateRangePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function AttendanceDateRangePicker({ 
  dateRange, 
  setDateRange 
}: AttendanceDateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "MMM d, yyyy")} -{" "}
                {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              format(dateRange.from, "MMM d, yyyy")
            )
          ) : (
            <span>Filter by date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-medium text-sm">Select date range</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose start and end dates to filter attendance
          </p>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="p-3"
        />
        <div className="flex items-center justify-between p-3 border-t bg-muted/20">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDateRange(undefined)}
          >
            Reset
          </Button>
          <Button size="sm">
            Apply Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

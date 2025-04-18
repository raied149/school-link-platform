
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, getYear, getMonth, setMonth, setYear } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarDatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function CalendarDatePicker({ selected, onSelect }: CalendarDatePickerProps) {
  const [month, setCurrentMonth] = React.useState<Date>(selected || new Date());
  
  // Generate arrays for year and month selections
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePreviousMonth = () => {
    const previousMonth = new Date(month);
    previousMonth.setMonth(month.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(month);
    nextMonth.setMonth(month.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleYearChange = (value: string) => {
    const newDate = setYear(month, parseInt(value));
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = months.findIndex(m => m === value);
    if (monthIndex !== -1) {
      const newDate = setMonth(month, monthIndex);
      setCurrentMonth(newDate);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between space-x-2 pb-4">
        <div className="flex items-center space-x-2">
          <Select
            value={months[getMonth(month)]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((monthName) => (
                <SelectItem key={monthName} value={monthName}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={getYear(month).toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
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
        onMonthChange={setCurrentMonth}
        className="rounded-md border shadow-sm pointer-events-auto"
        classNames={{
          day_today: "bg-accent text-accent-foreground",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        }}
      />
    </Card>
  );
}

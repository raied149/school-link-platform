
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { format } from "date-fns";

interface TeacherAttendanceSectionProps {
  teacher: Teacher;
}

export function TeacherAttendanceSection({ teacher }: TeacherAttendanceSectionProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  return (
    <AccordionItem value="attendance">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>Attendance & Leave Information</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
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
                    <span>Filter attendance by date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm">Select date range</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose start and end dates to filter attendance records
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
                  classNames={{
                    day_today: "bg-accent/50 text-accent-foreground",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_range_middle: "bg-accent/50",
                  }}
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Present Days</p>
              <p className="text-sm text-muted-foreground">{teacher.attendance.present}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Absent Days</p>
              <p className="text-sm text-muted-foreground">{teacher.attendance.absent}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Leave Days</p>
              <p className="text-sm text-muted-foreground">{teacher.attendance.leave}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-sm font-medium">Leave Balance</p>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium">Sick</p>
                <p className="text-sm text-muted-foreground">{teacher.leaveBalance.sick}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Casual</p>
                <p className="text-sm text-muted-foreground">{teacher.leaveBalance.casual}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Vacation</p>
                <p className="text-sm text-muted-foreground">{teacher.leaveBalance.vacation}</p>
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

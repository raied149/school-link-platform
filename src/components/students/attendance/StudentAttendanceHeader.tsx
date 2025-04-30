
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentAttendanceHeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedSubject: string;
  setSelectedSubject: (subjectId: string) => void;
  sectionSubjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export function StudentAttendanceHeader({
  selectedDate,
  setSelectedDate,
  selectedSubject,
  setSelectedSubject,
  sectionSubjects,
}: StudentAttendanceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Student Attendance Records</h2>
        <p className="text-muted-foreground">
          {format(selectedDate, 'MMMM d, yyyy')}
        </p>
      </div>
      <div className="flex gap-4">
        <Select 
          value={selectedSubject} 
          onValueChange={setSelectedSubject}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {sectionSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] justify-start text-left font-normal",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'MMMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

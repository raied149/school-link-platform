
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScheduledSubjectSelector } from "@/components/attendance/ScheduledSubjectSelector";

interface AttendanceFiltersProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSubject: string | null;
  handleSubjectSelect: (subjectId: string) => void;
  classes: any[];
  sections: any[];
  onExport?: () => void;
}

export function AttendanceFilters({
  selectedDate,
  setSelectedDate,
  gradeFilter,
  setGradeFilter,
  sectionFilter,
  setSectionFilter,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  selectedSubject,
  handleSubjectSelect,
  classes,
  sections,
  onExport
}: AttendanceFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'MMMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-grades">All Grades</SelectItem>
            {classes.map((classItem: any) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={sectionFilter} 
          onValueChange={setSectionFilter} 
          disabled={gradeFilter === 'all-grades'}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-sections">All Sections</SelectItem>
            {sections.map((section: any) => (
              <SelectItem key={section.id} value={section.id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="leave">Leave</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-[300px]"
          placeholder="Search students..."
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Only show section subjects once a section is selected */}
      {sectionFilter !== 'all-sections' && (
        <div className="mt-4">
          <ScheduledSubjectSelector
            sectionId={sectionFilter}
            date={selectedDate}
            selectedSubjectId={selectedSubject}
            onSelectSubject={handleSubjectSelect}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherAttendanceFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function TeacherAttendanceFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange
}: TeacherAttendanceFiltersProps) {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="w-[300px]"
          placeholder="Search teachers..."
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
}


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
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
  return (
    <div className="flex items-center justify-between w-full space-x-4">
      <div className="flex items-center space-x-4 flex-grow">
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
          className="flex-grow max-w-[300px]"
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


import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/services/taskService";

interface TaskFiltersProps {
  filterStatus: Task['status'] | 'all';
  setFilterStatus: (status: Task['status'] | 'all') => void;
  filterType: Task['type'] | 'all';
  setFilterType: (type: Task['type'] | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function TaskFilters({
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
      <div className="flex-1 relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="h-9 w-full sm:w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="h-9 w-full sm:w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="admin_task">Administrative</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

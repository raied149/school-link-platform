
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface AdminTaskFieldsProps {
  selectedTeachers: string[];
  setTeacherSelectionOpen: (open: boolean) => void;
  setSelectedTeachers: (teachers: string[]) => void;
}

export function AdminTaskFields({
  selectedTeachers,
  setTeacherSelectionOpen,
  setSelectedTeachers
}: AdminTaskFieldsProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <Users className="h-4 w-4" /> Assign to Teacher
      </Label>
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 justify-start"
          onClick={() => setTeacherSelectionOpen(true)}
        >
          {selectedTeachers.length > 0 
            ? `${selectedTeachers.length} teacher${selectedTeachers.length > 1 ? 's' : ''} selected` 
            : "Select teachers"}
        </Button>
        {selectedTeachers.length > 0 && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedTeachers([])}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

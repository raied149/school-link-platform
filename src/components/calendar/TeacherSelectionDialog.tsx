
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Users, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface TeacherSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeachers: string[];
  onTeachersSelect: (teacherIds: string[]) => void;
}

export function TeacherSelectionDialog({
  open,
  onOpenChange,
  selectedTeachers,
  onTeachersSelect,
}: TeacherSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          teacher_details (
            professional_info
          )
        `)
        .eq('role', 'teacher');

      if (error) throw error;
      return data.map(teacher => {
        // Safely access employeeId with proper type checking
        const professionalInfo = teacher.teacher_details?.professional_info;
        let employeeId = 'N/A';
        
        if (professionalInfo && 
            typeof professionalInfo === 'object' && 
            'employeeId' in professionalInfo) {
          employeeId = professionalInfo.employeeId as string || 'N/A';
        }
        
        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          employeeId: employeeId
        };
      });
    }
  });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    onTeachersSelect(teachers.map(t => t.id));
  };

  const handleDeselectAll = () => {
    onTeachersSelect([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Teachers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
          {isLoading ? (
            <div className="py-8 text-center">Loading teachers...</div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredTeachers.map((teacher) => (
                <label
                  key={teacher.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-lg"
                >
                  <Checkbox
                    checked={selectedTeachers.includes(teacher.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onTeachersSelect([...selectedTeachers, teacher.id]);
                      } else {
                        onTeachersSelect(selectedTeachers.filter(id => id !== teacher.id));
                      }
                    }}
                  />
                  <span>{teacher.name}</span>
                  <span className="text-muted-foreground text-sm">({teacher.employeeId})</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

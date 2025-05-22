
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/errorHandlers";

interface SubjectTeacherAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: any | null;
  sectionId?: string;
  academicYearId?: string;
}

interface Teacher {
  id: string;
  name: string;
}

export function SubjectTeacherAssignment({
  open,
  onOpenChange,
  subject,
  sectionId,
  academicYearId,
}: SubjectTeacherAssignmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Reset selected teacher when dialog opens
  useEffect(() => {
    if (open) {
      // Initialize with empty selection
      setSelectedTeacherId("");
    }
  }, [open]);

  // Fetch real teachers from Supabase
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
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
            name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Unnamed Teacher',
            employeeId: employeeId
          };
        });
      } catch (error) {
        console.error("Error fetching teachers:", error);
        return [];
      }
    },
    enabled: open
  });

  // Mutation to assign teacher to subject
  const assignTeacherMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTeacherId || !subject?.id) return;
      
      try {
        // First check if this teacher is already assigned to this subject
        const { data: existingAssignment, error: checkError } = await supabase
          .from('teacher_subjects')
          .select('*')
          .eq('teacher_id', selectedTeacherId)
          .eq('subject_id', subject.id)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // If not already assigned, create the assignment
        if (!existingAssignment) {
          const { error: insertError } = await supabase
            .from('teacher_subjects')
            .insert({
              teacher_id: selectedTeacherId,
              subject_id: subject.id
            });
            
          if (insertError) throw insertError;
        }
        
        return true;
      } catch (error: any) {
        console.error("Error assigning teacher:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Teacher Assigned",
        description: `Teacher has been assigned to ${subject?.name}`
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to assign teacher: ${handleDatabaseError(error)}`,
        variant: "destructive"
      });
    }
  });

  const handleAssign = () => {
    assignTeacherMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Assign Teacher to {subject?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="teacher" className="text-sm font-medium">
              Select Teacher
            </label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedTeacherId || isLoading}>
            Assign Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from "react";
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

interface SectionTeacherAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId?: string;
  classId?: string;
  sectionId?: string;
  academicYearId?: string;
}

interface Teacher {
  id: string;
  name: string;
}

export function SectionTeacherAssignment({
  open,
  onOpenChange,
  subjectId,
  classId,
  sectionId,
  academicYearId,
}: SectionTeacherAssignmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  
  // Reset selected teacher when dialog opens
  useEffect(() => {
    if (open && subjectId) {
      // Check if there's already an assigned teacher
      fetchCurrentAssignment();
    }
  }, [open, subjectId, sectionId]);

  // Fetch the current teacher assignment for this section and subject
  const fetchCurrentAssignment = async () => {
    if (!subjectId || !sectionId) return;
    
    try {
      const { data, error } = await supabase
        .from('subject_section_teachers')
        .select('teacher_id')
        .eq('subject_id', subjectId)
        .eq('section_id', sectionId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching assignment:", error);
        return;
      }
      
      if (data) {
        setSelectedTeacherId(data.teacher_id);
      } else {
        setSelectedTeacherId("");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Fetch teachers that are assigned to this subject
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['subject-teachers', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
          teacher_id,
          profiles:teacher_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq('subject_id', subjectId);
        
      if (error) {
        console.error("Error fetching subject teachers:", error);
        throw error;
      }
      
      return (data || []).map((item) => ({
        id: item.teacher_id,
        name: `${item.profiles.first_name} ${item.profiles.last_name}`
      }));
    },
    enabled: !!subjectId && open
  });

  // Mutation to assign teacher to section for this subject
  const assignTeacherMutation = useMutation({
    mutationFn: async () => {
      if (!subjectId || !sectionId) return;
      
      try {
        // First check if an assignment already exists
        const { data: existing } = await supabase
          .from('subject_section_teachers')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('section_id', sectionId);
          
        if (existing && existing.length > 0) {
          // Update existing assignment
          if (selectedTeacherId) {
            const { error: updateError } = await supabase
              .from('subject_section_teachers')
              .update({ teacher_id: selectedTeacherId })
              .eq('subject_id', subjectId)
              .eq('section_id', sectionId);
              
            if (updateError) throw updateError;
          } else {
            // Remove assignment if no teacher selected
            const { error: deleteError } = await supabase
              .from('subject_section_teachers')
              .delete()
              .eq('subject_id', subjectId)
              .eq('section_id', sectionId);
              
            if (deleteError) throw deleteError;
          }
        } else if (selectedTeacherId) {
          // Create new assignment if a teacher is selected
          const { error: insertError } = await supabase
            .from('subject_section_teachers')
            .insert({
              subject_id: subjectId,
              section_id: sectionId,
              teacher_id: selectedTeacherId,
              class_id: classId,
              academic_year_id: academicYearId
            });
            
          if (insertError) throw insertError;
        }
        
        return true;
      } catch (error) {
        console.error("Error assigning teacher:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject-section-teachers'] });
      toast({
        title: selectedTeacherId ? "Teacher Assigned" : "Assignment Removed",
        description: selectedTeacherId 
          ? "Teacher has been assigned to this subject for this section." 
          : "Teacher assignment has been removed."
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to assign teacher: ${error.message}`,
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
            Assign Teacher to Section
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {isLoading ? (
            <p>Loading available teachers...</p>
          ) : teachers.length === 0 ? (
            <p>No teachers are assigned to this subject yet. Please first assign teachers to this subject.</p>
          ) : (
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
                  <SelectItem value="">None (Remove Assignment)</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || (teachers.length === 0)}>
            {selectedTeacherId ? "Assign Teacher" : "Remove Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

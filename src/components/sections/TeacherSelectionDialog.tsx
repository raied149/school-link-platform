
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Teacher } from "@/types";

// Get all teachers from the real DB (profiles + teacher_details)
async function fetchTeachers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, teacher_details(*)')
    .eq('role', 'teacher');
  if (error) throw error;
  // Transform into Teacher[]
  return (profiles || []).map((profile: any) => ({
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email,
    professionalDetails: {
      employeeId: profile.teacher_details?.professional_info?.employeeId ?? "Not set",
      subjects: profile.teacher_details?.professional_info?.subjects ?? [],
      designation: profile.teacher_details?.professional_info?.designation ?? "",
      department: profile.teacher_details?.professional_info?.department ?? "",
      classesAssigned: profile.teacher_details?.professional_info?.classesAssigned ?? [],
      joiningDate: profile.teacher_details?.professional_info?.joiningDate ?? "",
      employmentType: profile.teacher_details?.professional_info?.employmentType ?? "Full-time",
      qualifications: profile.teacher_details?.professional_info?.qualifications ?? [],
    },
  })) as Teacher[];
}

interface TeacherSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teacher: Teacher) => void;
}

export function TeacherSelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: TeacherSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const {data: teachers = [], isLoading} = useQuery({ queryKey: ["selectable-teachers"], queryFn: fetchTeachers });

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.professionalDetails.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.professionalDetails.subjects?.some((subject: string) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Homeroom Teacher</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by teacher ID, name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {isLoading ? (
          <div className="py-8 text-center">Loading teachers...</div>
        ) : (
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 px-4">Teacher ID</th>
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-left py-2 px-4">Subject</th>
                <th className="text-right py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4">{teacher.professionalDetails.employeeId}</td>
                  <td className="py-2 px-4">{`${teacher.firstName} ${teacher.lastName}`}</td>
                  <td className="py-2 px-4">{teacher.professionalDetails.subjects.join(", ")}</td>
                  <td className="py-2 px-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onSelect(teacher);
                        onOpenChange(false);
                      }}
                    >
                      Select
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

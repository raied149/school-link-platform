
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function fetchStudents(): Promise<StudentDetail[]> {
  // Get all profiles with 'student' role and their details
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*, student_details(*)')
    .eq('role', 'student');
  if (error) throw error;
  // Combine main and details table
  return (profiles || []).map((profile: any) => ({
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`,
    admissionNumber: profile.student_details?.admission_number ?? profile.id.substring(0, 8),
    email: profile.email,
    dateOfBirth: profile.student_details?.dateofbirth ?? "",
    gender: profile.student_details?.gender ?? "other",
    nationality: profile.student_details?.nationality ?? "",
    language: profile.student_details?.language ?? "",
    guardian: profile.student_details?.guardian ?? {
      name: "Not set", email: "notset@example.com", phone: "-", relationship: "-"
    },
    medical: profile.student_details?.medical ?? {},
    createdAt: profile.created_at,
    updatedAt: profile.created_at,
    academicYearId: "",
    currentClassId: profile.student_details?.current_class_id ?? "",
    currentSectionId: profile.student_details?.current_section_id ?? "",
    contactNumber: "",
    address: "",
    parentId: ""
  }));
}

interface StudentSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (students: StudentDetail[]) => void;
  selectedStudents: StudentDetail[];
}

export function StudentSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  selectedStudents,
}: StudentSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedStudents, setLocalSelectedStudents] = useState<StudentDetail[]>(selectedStudents);

  const {data: students = [], isLoading} = useQuery({ queryKey: ["selectable-students"], queryFn: fetchStudents });

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleStudent = (student: StudentDetail) => {
    const isSelected = localSelectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setLocalSelectedStudents(localSelectedStudents.filter(s => s.id !== student.id));
    } else {
      setLocalSelectedStudents([...localSelectedStudents, student]);
    }
  };

  const handleSave = () => {
    onSelect(localSelectedStudents);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Students</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Students:</div>
          <div className="flex flex-wrap gap-2">
            {localSelectedStudents.map((student) => (
              <Badge key={student.id} variant="secondary">
                {student.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center">Loading students...</div>
          ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 px-4">Student ID</th>
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-center py-2 px-4">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isSelected = localSelectedStudents.some(s => s.id === student.id);
                return (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{student.admissionNumber}</td>
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleStudent(student)}
                      />
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

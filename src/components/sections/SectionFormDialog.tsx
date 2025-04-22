
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Teacher, StudentDetail } from "@/types";
import { TeacherSelectionDialog } from "./TeacherSelectionDialog";
import { StudentSelectionDialog } from "./StudentSelectionDialog";
import { Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  defaultValues?: any;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  onSave,
  defaultValues
}: SectionFormDialogProps) {
  const [sectionName, setSectionName] = useState(defaultValues?.name || "");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<StudentDetail[]>([]);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: sectionName,
        teacherId: selectedTeacher?.id,
        studentIds: selectedStudents.map(s => s.id)
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {defaultValues ? "Edit Section" : "Create New Section"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionName">Section Name *</Label>
              <Input
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="Enter section name"
              />
            </div>

            <div className="space-y-2">
              <Label>Homeroom Teacher</Label>
              <div className="flex items-center space-x-2">
                {selectedTeacher ? (
                  <div className="flex-1 p-2 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedTeacher.professionalDetails.employeeId}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTeacher(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsTeacherDialogOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Assign Teacher
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Students</Label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsStudentDialogOpen(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  {selectedStudents.length > 0
                    ? "Manage Students"
                    : "Add Students"}
                </Button>

                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {selectedStudents.map((student) => (
                      <Badge key={student.id} variant="secondary">
                        {student.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !sectionName.trim()}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TeacherSelectionDialog
        open={isTeacherDialogOpen}
        onOpenChange={setIsTeacherDialogOpen}
        onSelect={setSelectedTeacher}
      />

      <StudentSelectionDialog
        open={isStudentDialogOpen}
        onOpenChange={setIsStudentDialogOpen}
        onSelect={setSelectedStudents}
        selectedStudents={selectedStudents}
      />
    </>
  );
}

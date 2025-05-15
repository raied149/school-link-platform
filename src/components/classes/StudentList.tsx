
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash,
  Search,
  UserCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Label } from "@/components/ui/label";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface StudentListProps {
  studentsList: Student[];
  isLoading: boolean;
  onEdit?: (studentId: string, data: Partial<Student>) => Promise<boolean>;
  onDelete?: (studentId: string) => Promise<boolean>;
}

export function StudentList({
  studentsList,
  isLoading,
  onEdit,
  onDelete,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredStudents = studentsList.filter((student) =>
    `${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedStudent || !onEdit) return;
    
    setIsSubmitting(true);
    try {
      const success = await onEdit(selectedStudent.id, editFormData);
      if (success) {
        setIsEditDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent || !onDelete) return;
    
    setIsSubmitting(true);
    try {
      const success = await onDelete(selectedStudent.id);
      if (success) {
        setIsDeleteDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Students</h3>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-muted rounded-md animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No students match your search."
              : "No students have been added yet."}
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date of Birth</TableHead>
                {onEdit || onDelete ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.gender || "N/A"}</TableCell>
                  <TableCell>{student.dateOfBirth || "N/A"}</TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(student)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(student)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedStudent && onEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Make changes to the student information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={editFormData.gender || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={editFormData.dateOfBirth || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedStudent && onDelete && (
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Remove Student"
          description={`Are you sure you want to remove ${selectedStudent.firstName} ${selectedStudent.lastName} from this class?`}
          confirmText="Remove"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          isProcessing={isSubmitting}
        />
      )}
    </div>
  );
}


import { Class } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, EyeIcon, School } from "lucide-react";
import { useState } from "react";
import { ClassFormDialog } from "./ClassFormDialog";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface ClassesListProps {
  classes: Class[];
  yearId: string;
  isLoading: boolean;
  onCreateClass: (classData: Partial<Class>) => Promise<void>;
  onUpdateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  isTeacherView?: boolean;
}

export function ClassesList({
  classes,
  yearId,
  isLoading,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  isTeacherView = false,
}: ClassesListProps) {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditOpen(true);
  };

  const handleDelete = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteOpen(true);
  };

  const handleView = (classItem: Class) => {
    navigate(`/class-years/${yearId}/classes/${classItem.id}`);
  };

  const handleCreateClass = async (data: Partial<Class>) => {
    setIsSubmitting(true);
    try {
      await onCreateClass({
        ...data,
        academicYearId: yearId,
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Error creating class:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClass = async (data: Partial<Class>) => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await onUpdateClass(selectedClass.id, data);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating class:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await onDeleteClass(selectedClass.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting class:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Classes</h3>
        </div>
        {!isTeacherView && (
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-muted animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {isTeacherView 
              ? "You are not assigned to any classes in this academic year."
              : "No classes have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="border rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-semibold">{classItem.name}</h4>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(classItem)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                {!isTeacherView && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(classItem)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(classItem)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isTeacherView && (
        <>
          <ClassFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSave={handleCreateClass}
            isSubmitting={isSubmitting}
          />
          {selectedClass && (
            <ClassFormDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              onSave={handleUpdateClass}
              isSubmitting={isSubmitting}
              existingClass={selectedClass}
            />
          )}
          <ConfirmationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Delete Class"
            description="Are you sure you want to delete this class? All associated data will be permanently removed. This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleConfirmDelete}
            isProcessing={isSubmitting}
          />
        </>
      )}
    </div>
  );
}

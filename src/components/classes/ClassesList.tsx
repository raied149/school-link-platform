
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClassFormDialog } from "@/components/classes/ClassFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Class } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassesListProps {
  classes: Class[];
  yearId: string;
  isLoading: boolean;
  onCreateClass: (classData: Partial<Class>) => Promise<void>;
  onUpdateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
}

export function ClassesList({
  classes,
  yearId,
  isLoading,
  onCreateClass,
  onUpdateClass,
  onDeleteClass
}: ClassesListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const filteredClasses = classes
    .filter(c => 
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(c => selectedGrade === "all" || c.id === selectedGrade)
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

  const uniqueGrades = [
    { id: "all", name: "All Grades" },
    ...classes.sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
  ];

  const handleCreateClass = async (classData: Partial<Class>) => {
    await onCreateClass(classData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateClass = async (classData: Partial<Class>) => {
    if (selectedClass) {
      await onUpdateClass(selectedClass.id, classData);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteClass = async () => {
    if (selectedClass) {
      await onDeleteClass(selectedClass.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const navigateToSections = (classItem: Class) => {
    navigate(`/classes/${yearId}/${classItem.id}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">All Classes</h2>
          <p className="text-muted-foreground">Manage all classes</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="w-48">
          <Select
            value={selectedGrade}
            onValueChange={setSelectedGrade}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {uniqueGrades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-72 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Grade</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigateToSections(classItem)}
                      >
                        Sections
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(classItem)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openDeleteDialog(classItem)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No classes found for this academic year. Create your first class!</p>
        </div>
      )}
      
      <ClassFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateClass}
        mode="create"
      />
      
      {selectedClass && (
        <ClassFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateClass}
          classData={selectedClass}
          mode="edit"
        />
      )}
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete ${selectedClass?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteClass}
        isProcessing={false}
      />
    </>
  );
}


import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClassFormDialog } from "@/components/classes/ClassFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { classService } from "@/services/classService";
import { Class } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ClassesPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  
  // Fetch classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getClasses
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
      return classService.createClass(classData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Class> }) => {
      return classService.updateClass(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return classService.deleteClass(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    }
  });
  
  // Filter classes based on search term
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handlers
  const handleCreateClass = async (classData: Partial<Class>) => {
    await createMutation.mutateAsync(classData as Omit<Class, 'id' | 'createdAt' | 'updatedAt'>);
  };
  
  const handleUpdateClass = async (classData: Partial<Class>) => {
    if (selectedClass) {
      await updateMutation.mutateAsync({ id: selectedClass.id, data: classData });
    }
  };
  
  const handleDeleteClass = async () => {
    if (selectedClass) {
      try {
        await deleteMutation.mutateAsync(selectedClass.id);
        toast({
          title: "Class Deleted",
          description: `${selectedClass.name} has been deleted successfully.`
        });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete class. Please try again.",
          variant: "destructive"
        });
      }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Classes</h2>
            <p className="text-muted-foreground">Manage all classes in the system</p>
          </div>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Grade Level</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((classItem) => (
                  <tr key={classItem.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{classItem.name}</td>
                    <td className="py-3 px-4">{classItem.level}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {classItem.description || "No description"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
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
            <p className="text-muted-foreground">No classes found. Create your first class!</p>
          </div>
        )}
      </Card>
      
      {/* Create Dialog */}
      <ClassFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateClass}
        mode="create"
      />
      
      {/* Edit Dialog */}
      {selectedClass && (
        <ClassFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateClass}
          classData={selectedClass}
          mode="edit"
        />
      )}
      
      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete ${selectedClass?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteClass}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default ClassesPage;

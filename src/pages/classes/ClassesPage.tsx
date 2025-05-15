import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search, BookOpen, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClassFormDialog } from "@/components/classes/ClassFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Class } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ClassesPage = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes', yearId],
    queryFn: async () => {
      if (!yearId) return [];
      
      console.log("Fetching classes for yearId:", yearId);
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('year_id', yearId)
        .order('name');
        
      if (error) {
        console.error("Error fetching classes:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return [];
      }
      
      console.log("Classes data:", data);
      
      return (
        data?.map(row => ({
          id: row.id,
          name: row.name,
          level: Number(typeof row.name === "string" && row.name.match(/\d+/) ? row.name.match(/\d+/)![0] : 1),
          description: "", 
          academicYearId: row.year_id,
          createdAt: row.created_at,
          updatedAt: row.created_at,
        })) ?? []
      );
    },
    enabled: !!yearId
  });

  const createMutation = useMutation({
    mutationFn: async (classData: Omit<Class, "id" | "createdAt" | "updatedAt">) => {
      const { name, academicYearId } = classData;
      
      if (!academicYearId) throw new Error("Academic year ID missing");
      
      console.log("Creating class with data:", { name, year_id: academicYearId });
      
      const { data, error } = await supabase
        .from("classes")
        .insert({ name, year_id: academicYearId })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating class:", error);
        throw error;
      }
      
      console.log("Created class:", data);
      
      return {
        id: data.id,
        name: data.name,
        level: classData.level,
        description: "", 
        academicYearId: data.year_id,
        createdAt: data.created_at,
        updatedAt: data.created_at,
      } as Class;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', yearId] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Class> }) => {
      const updates: any = {};
      if (data.name) updates.name = data.name;
      const { error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', yearId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', yearId] });
    }
  });

  const filteredClasses = classes
    .filter(c => 
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(c => selectedGrade === "all" || c.id === selectedGrade)
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

  const uniqueGrades = [
    { id: "all", name: "All Grades" },
    ...classes
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
  ];

  const handleCreateClass = async (classData: Partial<Class>) => {
    try {
      await createMutation.mutateAsync({
        ...classData,
        academicYearId: yearId || ""
      } as Omit<Class, "id" | "createdAt" | "updatedAt">);
      
      toast({
        title: "Class Created",
        description: `${classData.name} has been created successfully.`
      });
      
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive"
      });
    }
  };

  const handleUpdateClass = async (classData: Partial<Class>) => {
    if (selectedClass) {
      await updateMutation.mutateAsync({ id: selectedClass.id, data: classData });
      toast({
        title: "Class Updated",
        description: `${classData.name} has been updated successfully.`
      });
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

  const navigateToSections = (classItem: Class) => {
    if (!yearId) return;
    navigate(`/sections/${classItem.id}?yearId=${yearId}`);
  };

  return (
    <Card className="p-6">
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

      {isLoadingClasses ? (
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
        isSubmitting={createMutation.isPending}
      />
      
      {selectedClass && (
        <ClassFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateClass}
          existingClass={selectedClass}
          isSubmitting={updateMutation.isPending}
        />
      )}
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete ${selectedClass?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteClass}
        isProcessing={deleteMutation.isPending}
      />
    </Card>
  );
};

export default ClassesPage;

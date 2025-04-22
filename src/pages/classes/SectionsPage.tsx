import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { sectionService } from "@/services/sectionService";
import { classService } from "@/services/classService";
import { academicYearService } from "@/services/academicYearService";
import { Section } from "@/types/section";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { SectionFormDialog } from "@/components/sections/SectionFormDialog";
import { supabase } from "@/integrations/supabase/client";

function useTeacherMap() {
  return useQuery({
    queryKey: ["teachers-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "teacher");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((t: any) => { map[t.id] = `${t.first_name} ${t.last_name}`; });
      return map;
    },
  });
}

const SectionsPage = () => {
  const { yearId, classId } = useParams<{ yearId: string, classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  const { data: academicYear } = useQuery({
    queryKey: ['academicYear', yearId],
    queryFn: () => academicYearService.getAcademicYearById(yearId!),
    enabled: !!yearId
  });
  
  const { data: classDetails } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => classService.getClassById(classId!),
    enabled: !!classId
  });
  
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections', classId, yearId],
    queryFn: () => sectionService.getSectionsByClassAndYear(classId!, yearId!),
    enabled: !!classId && !!yearId
  });
  
  const { data: teacherNameMap = {} } = useTeacherMap();
  
  const createMutation = useMutation({
    mutationFn: (sectionData: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => {
      return sectionService.createSection(sectionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Section> }) => {
      return sectionService.updateSection(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return sectionService.deleteSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
    }
  });
  
  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSaveSection = async (sectionData: any) => {
    try {
      if (selectedSection) {
        await updateMutation.mutateAsync({
          id: selectedSection.id,
          data: {
            ...sectionData,
            classId: classId!,
            academicYearId: yearId!
          }
        });
        
        toast({
          title: "Section Updated",
          description: `${sectionData.name} has been updated successfully.`
        });
      } else {
        await createMutation.mutateAsync({
          ...sectionData,
          classId: classId!,
          academicYearId: yearId!
        });
        
        toast({
          title: "Section Created",
          description: `${sectionData.name} has been created successfully.`
        });
      }
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSection = async () => {
    if (selectedSection) {
      try {
        await deleteMutation.mutateAsync(selectedSection.id);
        toast({
          title: "Section Deleted",
          description: `${selectedSection.name} has been deleted successfully.`
        });
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete section. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const openEditDialog = (section: Section) => {
    setSelectedSection(section);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteDialogOpen(true);
  };
  
  const navigateToSectionDetails = (section: Section) => {
    navigate(`/classes/${yearId}/${classId}/${section.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">
            {academicYear?.name || 'Loading...'} | {classDetails?.name || 'Loading...'}
          </p>
        </div>
        <Button onClick={() => {
          setSelectedSection(null);
          setIsCreateDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Sections</h2>
            <p className="text-muted-foreground">
              Manage sections for {classDetails?.name} in {academicYear?.name}
            </p>
          </div>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
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
        ) : filteredSections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Section Name</th>
                  <th className="text-left py-3 px-4">Homeroom Teacher</th>
                  <th className="text-left py-3 px-4">Students Count</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSections.map((section) => (
                  <tr key={section.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{section.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {section.teacherId
                        ? teacherNameMap[section.teacherId] || "Assigned"
                        : "Not Assigned"}
                    </td>
                    <td className="py-3 px-4">
                      0 students
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToSectionDetails(section)}
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(section)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(section)}
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
            <p className="text-muted-foreground">No sections found for this class. Create your first section!</p>
          </div>
        )}
      </Card>
      
      <SectionFormDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
        onSave={handleSaveSection}
        defaultValues={selectedSection}
      />
      
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Section"
        description={`Are you sure you want to delete ${selectedSection?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteSection}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default SectionsPage;

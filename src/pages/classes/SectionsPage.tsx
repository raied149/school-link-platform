import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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

// New hook to get student counts by section
function useStudentCounts(sections: Section[]) {
  const sectionIds = sections.map(s => s.id);
  
  return useQuery({
    queryKey: ["student-counts", sectionIds],
    queryFn: async () => {
      if (!sectionIds.length) return {};
      
      const { data, error } = await supabase
        .from("student_sections")
        .select("section_id, student_id")
        .in("section_id", sectionIds);
        
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        if (!counts[row.section_id]) counts[row.section_id] = 0;
        counts[row.section_id]++;
      });
      
      return counts;
    },
    enabled: sectionIds.length > 0
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
  
  // Fetch academic year details
  const { data: academicYear } = useQuery({
    queryKey: ['academicYear', yearId],
    queryFn: async () => {
      if (!yearId) return null;
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('id', yearId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching academic year:", error);
        throw error;
      }
      
      return data ? {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      } : null;
    },
    enabled: !!yearId
  });
  
  // Fetch class details
  const { data: classDetails } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching class:", error);
        throw error;
      }
      
      return data ? {
        id: data.id,
        name: data.name,
        academicYearId: data.year_id,
        createdAt: data.created_at
      } : null;
    },
    enabled: !!classId
  });
  
  // Fetch sections for the class
  const { data: sections = [], isLoading: isSectionsLoading } = useQuery({
    queryKey: ['sections', classId, yearId],
    queryFn: async () => {
      if (!classId) return [];
      
      console.log("Fetching sections for classId:", classId);
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', classId);
        
      if (error) {
        console.error("Error fetching sections:", error);
        throw error;
      }
      
      console.log("Sections data:", data);
      
      return (data || []).map((section: any) => ({
        id: section.id,
        name: section.name,
        classId: section.class_id,
        academicYearId: classDetails?.academicYearId || "",
        teacherId: section.teacher_id,
        createdAt: section.created_at,
        updatedAt: section.created_at
      }));
    },
    enabled: !!classId
  });
  
  // Fetch teacher names
  const { data: teacherNameMap = {} } = useTeacherMap();
  
  // Fetch student counts
  const { data: studentCounts = {} } = useStudentCounts(sections);
  
  // Save section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: any) => {
      console.log("Creating section with data:", {
        name: sectionData.name,
        class_id: classId,
        teacher_id: sectionData.teacherId
      });
      
      const { data, error } = await supabase
        .from('sections')
        .insert({
          name: sectionData.name,
          class_id: classId,
          teacher_id: sectionData.teacherId
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating section:", error);
        throw error;
      }

      console.log("Created section:", data);
      
      // If teacher is assigned and students are selected, need to save student assignments too
      if (sectionData.studentIds && sectionData.studentIds.length > 0) {
        const studentSections = sectionData.studentIds.map((studentId: string) => ({
          student_id: studentId,
          section_id: data.id
        }));
        
        console.log("Creating student sections:", studentSections);
        
        const { error: studentSectionError } = await supabase
          .from('student_sections')
          .insert(studentSections);
          
        if (studentSectionError) {
          console.error("Error assigning students to section:", studentSectionError);
          throw studentSectionError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
      queryClient.invalidateQueries({ queryKey: ['student-counts'] });
    }
  });
  
  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (params: { id: string; data: any }) => {
      const { id, data } = params;
      
      console.log("Updating section with data:", {
        id,
        name: data.name,
        teacher_id: data.teacherId
      });
      
      const { error } = await supabase
        .from('sections')
        .update({
          name: data.name,
          teacher_id: data.teacherId
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating section:", error);
        throw error;
      }
      
      // For students, we need to clear and re-add them
      if (data.studentIds && Array.isArray(data.studentIds)) {
        // First, remove all existing student assignments
        const { error: deleteError } = await supabase
          .from('student_sections')
          .delete()
          .eq('section_id', id);
          
        if (deleteError) {
          console.error("Error removing student assignments:", deleteError);
          throw deleteError;
        }
        
        // Only add new assignments if we have students
        if (data.studentIds.length > 0) {
          const studentSections = data.studentIds.map((studentId: string) => ({
            student_id: studentId,
            section_id: id
          }));
          
          console.log("Creating updated student sections:", studentSections);
          
          const { error: insertError } = await supabase
            .from('student_sections')
            .insert(studentSections);
            
          if (insertError) {
            console.error("Error assigning students to section:", insertError);
            throw insertError;
          }
        }
      }
      
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
      queryClient.invalidateQueries({ queryKey: ['student-counts'] });
    }
  });
  
  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting section:", id);
      
      // First delete student assignments
      const { error: studentSectionError } = await supabase
        .from('student_sections')
        .delete()
        .eq('section_id', id);
        
      if (studentSectionError) {
        console.error("Error removing student assignments:", studentSectionError);
        throw studentSectionError;
      }
      
      // Then delete the section
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting section:", error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', classId, yearId] });
      queryClient.invalidateQueries({ queryKey: ['student-counts'] });
    }
  });
  
  // Filter sections by search term
  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handlers
  const handleSaveSection = async (sectionData: any) => {
    try {
      console.log("Saving section with data:", sectionData);
      
      if (selectedSection) {
        await updateSectionMutation.mutateAsync({
          id: selectedSection.id,
          data: sectionData
        });
        
        toast({
          title: "Section Updated",
          description: `${sectionData.name} has been updated successfully.`
        });
      } else {
        await createSectionMutation.mutateAsync(sectionData);
        
        toast({
          title: "Section Created",
          description: `${sectionData.name} has been created successfully.`
        });
      }
      
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving section:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save section. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSection = async () => {
    if (selectedSection) {
      try {
        await deleteSectionMutation.mutateAsync(selectedSection.id);
        toast({
          title: "Section Deleted",
          description: `${selectedSection.name} has been deleted successfully.`
        });
        setIsDeleteDialogOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete section. Please try again.",
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
  
  // Fix the navigation function
  const navigateToSectionDetails = (section: Section) => {
    navigate(`/class/${classId}/section/${section.id}`);
  };
  
  // Redirect if params are missing
  useEffect(() => {
    if (!classId) {
      navigate('/classes', { replace: true });
    }
  }, [classId, navigate]);

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

        {isSectionsLoading ? (
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
                      {studentCounts[section.id] || 0} students
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
        isProcessing={deleteSectionMutation.isPending}
      />
    </div>
  );
};

export default SectionsPage;

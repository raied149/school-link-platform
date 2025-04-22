
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic-year";
import { AcademicYearTabs } from "@/components/classes/AcademicYearTabs";
import { ClassesList } from "@/components/classes/ClassesList";
import { Class } from "@/types";

export default function ClassYearsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { yearId } = useParams<{ yearId: string }>();
  const { toast } = useToast();

  // Fetch academic years
  const { data: academicYears = [], isLoading: isLoadingYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      console.log("Fetching academic years");
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        console.error("Error fetching academic years:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return [];
      }
      
      console.log("Academic years data:", data);
      return (
        data?.map((year: any) => ({
          id: year.id,
          name: year.name,
          startDate: year.start_date,
          endDate: year.end_date,
          isActive: year.is_active,
          createdAt: year.created_at,
          updatedAt: year.updated_at || year.created_at,
        })) ?? []
      ) as AcademicYear[];
    }
  });

  // Fetch classes for selected academic year
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

  const createYearMutation = useMutation({
    mutationFn: async (yearData: Omit<AcademicYear, "id" | "createdAt" | "updatedAt">) => {
      const { name, startDate, endDate, isActive } = yearData;
      if (isActive) {
        const { error } = await supabase
          .from('academic_years')
          .update({ is_active: false })
          .neq('id', null);
        if (error) throw error;
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert({
          name,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No academic year returned after insert.");

      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      } as AcademicYear;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      // Navigate to the newly created year
      navigate(`/classes/${data.id}`);
    }
  });

  const createClassMutation = useMutation({
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

  const updateClassMutation = useMutation({
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

  const deleteClassMutation = useMutation({
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

  // Find the active academic year or default to the latest
  const activeYear = academicYears.find(year => year.isActive);
  const mostRecentYear = academicYears[0];
  const defaultYearId = activeYear?.id || mostRecentYear?.id;

  const isValidYearId = yearId && academicYears.some(year => year.id === yearId);

  // Create handlers for the components
  const handleCreateYear = async (yearData: Partial<AcademicYear>) => {
    try {
      await createYearMutation.mutateAsync(yearData as Omit<AcademicYear, "id" | "createdAt" | "updatedAt">);
      toast({
        title: "Academic Year Created",
        description: `${yearData.name} has been created successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic year",
        variant: "destructive"
      });
    }
  };

  const handleCreateClass = async (classData: Partial<Class>) => {
    try {
      await createClassMutation.mutateAsync({
        ...classData,
        academicYearId: yearId || ""
      } as Omit<Class, "id" | "createdAt" | "updatedAt">);
      
      toast({
        title: "Class Created",
        description: `${classData.name} has been created successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive"
      });
    }
  };

  const handleUpdateClass = async (id: string, classData: Partial<Class>) => {
    try {
      await updateClassMutation.mutateAsync({ id, data: classData });
      toast({
        title: "Class Updated",
        description: `${classData.name} has been updated successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update class",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClassMutation.mutateAsync(id);
      toast({
        title: "Class Deleted",
        description: "Class has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive"
      });
    }
  };

  // Redirect logic in useEffect to fix navigation issues
  useEffect(() => {
    if (!isLoadingYears && academicYears.length > 0) {
      if (!yearId && defaultYearId) {
        console.log("Redirecting to default year:", defaultYearId);
        navigate(`/classes/${defaultYearId}`, { replace: true });
      }
      else if (yearId && !academicYears.some(year => year.id === yearId) && defaultYearId) {
        console.log("Year ID not found, redirecting to default year:", defaultYearId);
        navigate(`/classes/${defaultYearId}`, { replace: true });
      }
    }
  }, [yearId, isLoadingYears, academicYears, defaultYearId, navigate]);

  console.log("Rendering ClassYearsPage with yearId:", yearId);
  console.log("Academic years:", academicYears);
  console.log("Is valid year ID:", isValidYearId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Academic year tabs - always visible */}
      <AcademicYearTabs 
        academicYears={academicYears} 
        selectedYearId={yearId} 
        onYearCreate={handleCreateYear}
      />

      {/* Classes list - shown when academic year is selected */}
      {isLoadingYears ? (
        <Card className="p-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </Card>
      ) : academicYears.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Academic Years Found</h2>
            <p className="text-muted-foreground mb-4">Create your first academic year to get started.</p>
          </div>
        </Card>
      ) : isValidYearId ? (
        <Card className="p-6">
          <ClassesList 
            classes={classes}
            yearId={yearId!}
            isLoading={isLoadingClasses}
            onCreateClass={handleCreateClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            Please select an academic year above to view and manage classes.
          </div>
        </Card>
      )}
    </div>
  );
}

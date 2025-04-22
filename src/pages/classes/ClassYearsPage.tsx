
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassesPage from "./ClassesPage";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic-year";

export default function ClassYearsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { yearId } = useParams<{ yearId: string }>();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch academic years
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      console.log("Fetching academic years");
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false }); // latest year first

      if (error) {
        console.error("Error fetching academic years:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return [];
      }

      // Defensive parse and cast data to AcademicYear[]
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

  const createMutation = useMutation({
    mutationFn: async (yearData: Omit<AcademicYear, "id" | "createdAt" | "updatedAt">) => {
      const { name, startDate, endDate, isActive } = yearData;

      // If this year is active, deactivate all others
      if (isActive) {
        const { error } = await supabase
          .from('academic_years')
          .update({ is_active: false })
          .neq('id', null); // update all rows
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

      if (error) {
        console.error("Error creating academic year:", error);
        throw error;
      }
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    }
  });

  // Find the active academic year or default to the latest (first in sorted array)
  const activeYear = academicYears.find(year => year.isActive);
  const mostRecentYear = academicYears[0];
  const defaultYearId = activeYear?.id || mostRecentYear?.id;

  // When creating a year
  const handleCreateYear = async (yearData: Partial<AcademicYear>) => {
    try {
      await createMutation.mutateAsync(yearData as Omit<AcademicYear, "id" | "createdAt" | "updatedAt">);
      toast({
        title: "Academic Year Created",
        description: `${yearData.name} has been created successfully.`
      });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic year",
        variant: "destructive"
      });
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </Card>
      </div>
    );
  }

  // Empty state (no years)
  if (academicYears.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Academic Years Found</h2>
            <p className="text-muted-foreground mb-4">Create your first academic year to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Academic Year
            </Button>
          </div>
        </Card>
        <AcademicYearFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleCreateYear}
          mode="create"
          existingYears={academicYears}
        />
      </div>
    );
  }

  // Redirect if necessary
  if (!yearId && defaultYearId) {
    navigate(`/classes/${defaultYearId}`, { replace: true });
    return null;
  }

  if (yearId && !academicYears.some(year => year.id === yearId) && defaultYearId) {
    navigate(`/classes/${defaultYearId}`, { replace: true });
    return null;
  }

  // Main UI
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Class Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>
      <Tabs
        value={yearId || defaultYearId}
        className="w-full"
        onValueChange={(value) => navigate(`/classes/${value}`)}
      >
        <TabsList className="w-full flex gap-2 justify-start">
          {academicYears.map((year) => (
            <TabsTrigger
              key={year.id}
              value={year.id}
              className="min-w-[150px]"
            >
              {year.name}
              {year.isActive && (
                <span className="ml-1 text-xs text-green-600">(Active)</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {yearId && <ClassesPage />}
      <AcademicYearFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateYear}
        mode="create"
        existingYears={academicYears}
      />
    </div>
  );
}

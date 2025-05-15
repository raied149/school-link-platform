
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { useToast } from "@/hooks/use-toast"; 
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic-year";
import { AcademicYearTabs } from "@/components/classes/AcademicYearTabs";
import { ClassesList } from "@/components/classes/ClassesList";
import { Class } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const ClassYearsPage = () => {
  const params = useParams();
  const yearId = params.yearId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacherView = user?.role === 'teacher';
  const isStudentView = user?.role === 'student';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Helper function to map database year format to our model format
  const mapDatabaseYearToModel = (dbYear: any): AcademicYear => {
    return {
      id: dbYear.id,
      name: dbYear.name,
      startDate: dbYear.start_date,
      endDate: dbYear.end_date,
      isActive: dbYear.is_active,
      createdAt: dbYear.created_at,
      updatedAt: dbYear.updated_at || dbYear.created_at
    };
  };

  // Helper function to map database class format to our model format
  const mapDatabaseClassToModel = (dbClass: any): Class => {
    return {
      id: dbClass.id,
      name: dbClass.name,
      level: 0, // Default value as it's not in the DB schema
      academicYearId: dbClass.year_id,
      createdAt: dbClass.created_at,
      updatedAt: dbClass.updated_at || dbClass.created_at
    };
  };

  // Fetch active academic year if no yearId is provided
  const { data: activeYear, isLoading: activeYearLoading } = useQuery({
    queryKey: ['activeAcademicYear'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      return data ? mapDatabaseYearToModel(data) : null;
    },
    enabled: !yearId
  });

  // Fetch all academic years
  const { data: academicYearsRaw = [], isLoading: academicYearsLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      // For admins, get all academic years
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Map raw database years to our model format
  const academicYears: AcademicYear[] = academicYearsRaw.map(mapDatabaseYearToModel);

  // Fetch classes for the selected academic year
  const { data: classesRaw = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes', yearId || (activeYear?.id)],
    queryFn: async () => {
      const selectedYearId = yearId || activeYear?.id;
      if (!selectedYearId) return [];
      
      // For admins, get all classes for the selected academic year
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('year_id', selectedYearId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!yearId || !!activeYear?.id
  });

  // Map raw database classes to our model format
  const classes: Class[] = classesRaw.map(mapDatabaseClassToModel);

  // Create academic year mutation
  const createYearMutation = useMutation({
    mutationFn: async (yearData: Partial<AcademicYear>) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert([{
          name: yearData.name,
          start_date: yearData.startDate,
          end_date: yearData.endDate,
          is_active: yearData.isActive
        }])
        .select()
        .single();
        
      if (error) throw error;
      return mapDatabaseYearToModel(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Academic year created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create academic year: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: Partial<Class>) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          name: classData.name,
          year_id: classData.academicYearId
        }])
        .select()
        .single();
        
      if (error) throw error;
      return mapDatabaseClassToModel(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Class created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create class: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Class> }) => {
      const { data: updatedData, error } = await supabase
        .from('classes')
        .update({
          name: data.name,
          year_id: data.academicYearId
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return mapDatabaseClassToModel(updatedData);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Class updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update class: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Success",
        description: "Class deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete class: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Handle navigating to academic year if none is selected
  useEffect(() => {
    if (!yearId && !activeYearLoading && activeYear) {
      navigate(`/class-years/${activeYear.id}`);
    }
  }, [yearId, activeYear, activeYearLoading, navigate]);

  // Handle creating academic year
  const handleCreateYear = async (yearData: Partial<AcademicYear>) => {
    try {
      const newYear = await createYearMutation.mutateAsync(yearData);
      navigate(`/class-years/${newYear.id}`);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Handle creating class
  const handleCreateClass = async (classData: Partial<Class>) => {
    await createClassMutation.mutateAsync(classData);
  };

  // Handle updating class
  const handleUpdateClass = async (id: string, classData: Partial<Class>) => {
    await updateClassMutation.mutateAsync({ id, data: classData });
  };

  // Handle deleting class
  const handleDeleteClass = async (id: string) => {
    await deleteClassMutation.mutateAsync(id);
  };

  // Loading state
  const isLoading = activeYearLoading || academicYearsLoading;

  if (isLoading && !yearId) {
    return (
      <div className="flex items-center justify-center h-48">
        <p>Loading...</p>
      </div>
    );
  }

  if ((!activeYear && !yearId) || (!academicYears || academicYears.length === 0)) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">No Academic Years Found</h2>
            <p className="text-muted-foreground mb-4">
              No academic years have been added yet. Please create one to get started.
            </p>
            <Button onClick={() => handleCreateYear({ name: 'New Academic Year', startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], isActive: true })}>
              Create Academic Year
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const selectedYear = yearId 
    ? academicYears.find(year => year.id === yearId) 
    : activeYear;

  if (!selectedYear) {
    return (
      <div className="flex items-center justify-center h-48">
        <p>Selected academic year not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <AcademicYearTabs 
          academicYears={academicYears} 
          selectedYearId={selectedYear.id} 
          onYearCreate={handleCreateYear}
          isTeacherView={false}
        />
      </div>

      <Card className="p-6">
        <ClassesList 
          classes={classes} 
          yearId={selectedYear.id} 
          isLoading={classesLoading} 
          onCreateClass={handleCreateClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          isTeacherView={false}
        />
      </Card>
    </div>
  );
};

export default ClassYearsPage;

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
import { useAuth } from "@/contexts/AuthContext";

const ClassYearsPage = () => {
  const params = useParams();
  const yearId = params.yearId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacherView = user?.role === 'teacher';
  const isStudentView = user?.role === 'student';
  
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
      return data;
    },
    enabled: !yearId
  });

  // Fetch all academic years
  const { data: academicYears = [], isLoading: academicYearsLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      if (isStudentView) {
        // For students, get their assigned class and its academic year
        const studentId = user?.id;
        
        // First get the student's section
        const { data: sectionData, error: sectionError } = await supabase
          .from('student_sections')
          .select('section_id')
          .eq('student_id', studentId)
          .limit(1)
          .maybeSingle();
          
        if (sectionError) throw sectionError;
        if (!sectionData) return [];
        
        // Now get section details to get the class
        const { data: section, error: sectionDetailsError } = await supabase
          .from('sections')
          .select('class_id')
          .eq('id', sectionData.section_id)
          .limit(1)
          .maybeSingle();
          
        if (sectionDetailsError) throw sectionDetailsError;
        if (!section) return [];
        
        // Now get class details to get the academic year
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('year_id')
          .eq('id', section.class_id)
          .limit(1)
          .maybeSingle();
          
        if (classError) throw classError;
        if (!classData) return [];
        
        // Finally get the academic year
        const { data: years, error: yearsError } = await supabase
          .from('academic_years')
          .select('*')
          .eq('id', classData.year_id);
          
        if (yearsError) throw yearsError;
        return years;
      } 
      else if (isTeacherView) {
        // For teachers, get academic years for classes they teach
        const teacherId = user?.id;
        
        // Get teacher's assigned sections from timetable
        const { data: timetableData, error: timetableError } = await supabase
          .from('timetable')
          .select('section_id')
          .eq('teacher_id', teacherId);
          
        if (timetableError) throw timetableError;
        if (!timetableData?.length) return [];
        
        // Get unique section IDs
        const sectionIds = [...new Set(timetableData.map(item => item.section_id))];
        
        // Get classes for these sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('class_id')
          .in('id', sectionIds);
          
        if (sectionsError) throw sectionsError;
        if (!sectionsData?.length) return [];
        
        // Get unique class IDs
        const classIds = [...new Set(sectionsData.map(item => item.class_id))];
        
        // Get academic years for these classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('year_id')
          .in('id', classIds);
          
        if (classesError) throw classesError;
        if (!classesData?.length) return [];
        
        // Get unique academic year IDs
        const yearIds = [...new Set(classesData.map(item => item.year_id))];
        
        // Get the academic years
        const { data: years, error: yearsError } = await supabase
          .from('academic_years')
          .select('*')
          .in('id', yearIds)
          .order('start_date', { ascending: false });
          
        if (yearsError) throw yearsError;
        return years;
      } else {
        // For admins, get all academic years
        const { data, error } = await supabase
          .from('academic_years')
          .select('*')
          .order('start_date', { ascending: false });
          
        if (error) throw error;
        return data;
      }
    }
  });

  // Fetch classes for the selected academic year
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes', yearId || (activeYear?.id)],
    queryFn: async () => {
      const selectedYearId = yearId || activeYear?.id;
      if (!selectedYearId) return [];
      
      if (isStudentView) {
        // For students, get only their assigned class
        const studentId = user?.id;
        
        // Get student's section
        const { data: sectionData, error: sectionError } = await supabase
          .from('student_sections')
          .select('section_id')
          .eq('student_id', studentId)
          .limit(1)
          .maybeSingle();
          
        if (sectionError) throw sectionError;
        if (!sectionData) return [];
        
        // Get section details to get the class
        const { data: section, error: sectionDetailsError } = await supabase
          .from('sections')
          .select('class_id')
          .eq('id', sectionData.section_id)
          .limit(1)
          .maybeSingle();
          
        if (sectionDetailsError) throw sectionDetailsError;
        if (!section) return [];
        
        // Get the class details
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', section.class_id)
          .eq('year_id', selectedYearId);
          
        if (classError) throw classError;
        return classData || [];
      }
      else if (isTeacherView) {
        // For teachers, get classes they teach in the selected academic year
        const teacherId = user?.id;
        
        // Get teacher's assigned sections from timetable
        const { data: timetableData, error: timetableError } = await supabase
          .from('timetable')
          .select('section_id')
          .eq('teacher_id', teacherId);
          
        if (timetableError) throw timetableError;
        if (!timetableData?.length) return [];
        
        // Get unique section IDs
        const sectionIds = [...new Set(timetableData.map(item => item.section_id))];
        
        // Get classes for these sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('class_id')
          .in('id', sectionIds);
          
        if (sectionsError) throw sectionsError;
        if (!sectionsData?.length) return [];
        
        // Get unique class IDs
        const classIds = [...new Set(sectionsData.map(item => item.class_id))];
        
        // Get classes for the selected academic year
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds)
          .eq('year_id', selectedYearId);
          
        if (error) throw error;
        return data;
      } else {
        // For admins, get all classes for the selected academic year
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('year_id', selectedYearId);
          
        if (error) throw error;
        return data;
      }
    },
    enabled: !!yearId || !!activeYear?.id
  });

  // Create academic year mutation
  const createYearMutation = useMutation({
    mutationFn: async (yearData: Partial<AcademicYear>) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert([yearData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Academic year created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create academic year: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (classData: Partial<Class>) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([classData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast.error(`Failed to create class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Class> }) => {
      const { data: updatedData, error } = await supabase
        .from('classes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return updatedData;
    },
    onSuccess: (data) => {
      toast.success('Class updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast.error(`Failed to update class: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      toast.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete class: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      navigate(`/class-years/${newYear.id}`);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // Handle creating class
  const handleCreateClass = async (classData: Partial<Class>) => {
    return createClassMutation.mutateAsync(classData);
  };

  // Handle updating class
  const handleUpdateClass = async (id: string, classData: Partial<Class>) => {
    return updateClassMutation.mutateAsync({ id, data: classData });
  };

  // Handle deleting class
  const handleDeleteClass = async (id: string) => {
    return deleteClassMutation.mutateAsync(id);
  };

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
            {isStudentView ? (
              <p className="text-muted-foreground">
                You are not assigned to any class yet. Please contact your administrator.
              </p>
            ) : isTeacherView ? (
              <p className="text-muted-foreground">
                You are not assigned to any classes yet. Please contact your administrator.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  No academic years have been added yet. Please create one to get started.
                </p>
                <Button onClick={() => handleCreateYear({ name: 'New Academic Year', startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], isActive: true })}>
                  Create Academic Year
                </Button>
              </>
            )}
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
          isTeacherView={isTeacherView || isStudentView}
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
          isTeacherView={isTeacherView || isStudentView}
        />
      </Card>
    </div>
  );
};

export default ClassYearsPage;

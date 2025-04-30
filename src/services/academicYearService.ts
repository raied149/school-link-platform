
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic-year";

export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(year => ({
        id: year.id,
        name: year.name,
        startDate: year.start_date,
        endDate: year.end_date,
        isActive: year.is_active,
        createdAt: year.created_at,
        updatedAt: year.updated_at || year.created_at
      }));
    } catch (error: any) {
      console.error('Error fetching academic years:', error);
      return [];
    }
  },
  
  getActiveAcademicYear: async (): Promise<AcademicYear | null> => {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();
        
      if (error) {
        // If no active year is found, get the most recent one
        if (error.code === 'PGRST116') {
          const { data: latestYear, error: latestYearError } = await supabase
            .from('academic_years')
            .select('*')
            .order('start_date', { ascending: false })
            .limit(1)
            .single();
            
          if (latestYearError) throw latestYearError;
          if (!latestYear) return null;
          
          return {
            id: latestYear.id,
            name: latestYear.name,
            startDate: latestYear.start_date,
            endDate: latestYear.end_date,
            isActive: latestYear.is_active,
            createdAt: latestYear.created_at,
            updatedAt: latestYear.updated_at || latestYear.created_at
          };
        }
        throw error;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      };
    } catch (error: any) {
      console.error('Error fetching active academic year:', error);
      return null;
    }
  }
};

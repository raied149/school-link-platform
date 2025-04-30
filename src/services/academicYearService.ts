
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
  },

  // Add the missing functions that are used in AcademicYearsPage.tsx
  createAcademicYear: async (yearData: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicYear | null> => {
    try {
      // If this year will be active, first deactivate all other years
      if (yearData.isActive) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .neq('id', 'temp'); // Update all rows
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert({
          name: yearData.name,
          start_date: yearData.startDate,
          end_date: yearData.endDate,
          is_active: yearData.isActive
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
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
      console.error('Error creating academic year:', error);
      return null;
    }
  },

  updateAcademicYear: async (id: string, data: Partial<AcademicYear>): Promise<AcademicYear | null> => {
    try {
      // If this year will be active, first deactivate all other years
      if (data.isActive) {
        await supabase
          .from('academic_years')
          .update({ is_active: false })
          .neq('id', id);
      }

      const { data: updatedData, error } = await supabase
        .from('academic_years')
        .update({
          name: data.name,
          start_date: data.startDate,
          end_date: data.endDate,
          is_active: data.isActive,
        })
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return {
        id: updatedData.id,
        name: updatedData.name,
        startDate: updatedData.start_date,
        endDate: updatedData.end_date,
        isActive: updatedData.is_active,
        createdAt: updatedData.created_at,
        updatedAt: updatedData.updated_at || updatedData.created_at
      };
    } catch (error: any) {
      console.error('Error updating academic year:', error);
      return null;
    }
  },

  deleteAcademicYear: async (id: string): Promise<boolean> => {
    try {
      // Check if this is the active year
      const { data: yearData } = await supabase
        .from('academic_years')
        .select('is_active')
        .eq('id', id)
        .single();
        
      // Don't allow deleting the active year
      if (yearData?.is_active) {
        return false;
      }
      
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting academic year:', error);
      return false;
    }
  }
};


import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BreadcrumbData {
  academicYear?: { id: string; name: string };
  class?: { id: string; name: string };
  section?: { id: string; name: string };
}

export function ActiveClassBreadcrumb() {
  const { classId, sectionId } = useParams();
  const location = useLocation();
  
  // Don't show breadcrumb on section details page or any class years pages
  if (location.pathname.includes('/class/') && location.pathname.includes('/section/') ||
      location.pathname.includes('/class-years')) {
    return null;
  }
  
  const yearId = new URLSearchParams(location.search).get('yearId') || 
                (location.state as any)?.yearId;
  
  // Check if we're in the class-years context
  const isClassYearsContext = location.pathname.includes('/class-years');

  // Fetch data for breadcrumbs
  const { data, isLoading } = useQuery({
    queryKey: ['breadcrumb-data', yearId, classId, sectionId],
    queryFn: async () => {
      const result: BreadcrumbData = {};
      
      // Fetch academic year if yearId is available
      if (yearId) {
        const { data: yearData } = await supabase
          .from('academic_years')
          .select('id, name')
          .eq('id', yearId)
          .maybeSingle();
          
        if (yearData) {
          result.academicYear = { id: yearData.id, name: yearData.name };
        }
      }
      
      // Fetch class if classId is available
      if (classId) {
        const { data: classData } = await supabase
          .from('classes')
          .select('id, name, year_id')
          .eq('id', classId)
          .maybeSingle();
          
        if (classData) {
          result.class = { id: classData.id, name: classData.name };
          
          // If we don't have academic year yet, fetch it using the class's year_id
          if (!result.academicYear && classData.year_id) {
            const { data: yearData } = await supabase
              .from('academic_years')
              .select('id, name')
              .eq('id', classData.year_id)
              .maybeSingle();
              
            if (yearData) {
              result.academicYear = { id: yearData.id, name: yearData.name };
            }
          }
        }
      }
      
      // Fetch section if sectionId is available
      if (sectionId) {
        const { data: sectionData } = await supabase
          .from('sections')
          .select('id, name')
          .eq('id', sectionId)
          .maybeSingle();
          
        if (sectionData) {
          result.section = { id: sectionData.id, name: sectionData.name };
        }
      }
      
      return result;
    },
    enabled: !!yearId || !!classId || !!sectionId
  });

  if (isLoading || !data) {
    return null;
  }

  // Don't show breadcrumb if we don't have any data
  if (!data.academicYear && !data.class && !data.section) {
    return null;
  }

  // Always use Class Years as the root for breadcrumbs for consistency
  const rootPath = "/class-years";
  const rootLabel = "Class Years";

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to={rootPath}>{rootLabel}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      
      {data.academicYear && (
        <>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`${rootPath}/${data.academicYear.id}`}>
                {data.academicYear.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
      
      {data.class && (
        <>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/class-years/sections/${data.class.id}${yearId ? `?yearId=${yearId}` : ''}`}>
                {data.class.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
      
      {data.section && (
        <>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-default">
              {data.section.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  );
}


import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledSubjectSelectorProps {
  sectionId: string | null;
  date: Date;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
}

export function ScheduledSubjectSelector({
  sectionId,
  selectedSubjectId,
  onSelectSubject
}: ScheduledSubjectSelectorProps) {
  // Fetch all subjects assigned to this section
  const { data: sectionSubjects = [], isLoading } = useQuery({
    queryKey: ['section-subjects-all', sectionId],
    queryFn: async () => {
      if (!sectionId) return [];
      
      // Get the class_id for this section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('class_id')
        .eq('id', sectionId)
        .single();
      
      if (sectionError) {
        console.error("Error fetching section:", sectionError);
        throw sectionError;
      }
      
      if (!sectionData?.class_id) {
        return [];
      }
      
      // Get subjects assigned to this class
      const { data: subjectClasses, error: subjectsError } = await supabase
        .from('subject_classes')
        .select(`
          subject_id,
          subjects (
            id,
            name,
            code
          )
        `)
        .eq('class_id', sectionData.class_id);
      
      if (subjectsError) {
        console.error("Error fetching subject classes:", subjectsError);
        throw subjectsError;
      }
      
      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Map(subjectClasses.map(item => 
          [item.subject_id, item.subjects]
        )).values()
      );
      
      return uniqueSubjects;
    },
    enabled: !!sectionId
  });

  if (isLoading) {
    return <div className="text-center py-2">Loading section subjects...</div>;
  }

  if (sectionSubjects.length === 0) {
    return (
      <div className="bg-yellow-50 p-3 rounded-md text-center text-yellow-800 border border-yellow-200">
        No subjects assigned to this section
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600">Section Subjects:</h3>
      <div className="flex flex-wrap gap-2">
        {sectionSubjects.map((subject: any) => (
          <Button
            key={subject.id}
            variant={selectedSubjectId === subject.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectSubject(subject.id)}
            className="flex items-center gap-2"
          >
            {subject.name}
            <Badge variant="secondary" className="text-xs">
              {subject.code}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}

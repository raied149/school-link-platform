
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { mapWeekDayToNumber } from "@/utils/dateUtils";

interface ScheduledSubjectSelectorProps {
  sectionId: string | null;
  date: Date;
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
}

export function ScheduledSubjectSelector({
  sectionId,
  date,
  selectedSubjectId,
  onSelectSubject
}: ScheduledSubjectSelectorProps) {
  // Get day of week number (0-6)
  const dayOfWeek = mapWeekDayToNumber(format(date, 'EEEE') as any);
  
  // Fetch scheduled subjects for this section on this day
  const { data: scheduledSubjects = [], isLoading } = useQuery({
    queryKey: ['scheduled-subjects', sectionId, dayOfWeek],
    queryFn: async () => {
      if (!sectionId) return [];
      
      const { data, error } = await supabase
        .from('timetable')
        .select(`
          subject_id,
          subjects (
            id,
            name,
            code
          )
        `)
        .eq('section_id', sectionId)
        .eq('day_of_week', dayOfWeek)
        .not('subject_id', 'is', null);
      
      if (error) {
        console.error("Error fetching scheduled subjects:", error);
        throw error;
      }
      
      // Extract unique subjects
      const uniqueSubjects = Array.from(
        new Map(data.map(item => 
          [item.subject_id, item.subjects]
        )).values()
      );
      
      return uniqueSubjects;
    },
    enabled: !!sectionId
  });

  if (isLoading) {
    return <div className="text-center py-2">Loading scheduled subjects...</div>;
  }

  if (scheduledSubjects.length === 0) {
    return (
      <div className="bg-yellow-50 p-3 rounded-md text-center text-yellow-800 border border-yellow-200">
        No subjects scheduled for this section on {format(date, 'EEEE')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-600">Scheduled Subjects:</h3>
      <div className="flex flex-wrap gap-2">
        {scheduledSubjects.map((subject: any) => (
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

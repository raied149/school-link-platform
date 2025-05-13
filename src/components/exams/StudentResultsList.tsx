
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface StudentResultsListProps {
  examId: string;
}

export const StudentResultsList: React.FC<StudentResultsListProps> = ({ examId }) => {
  const [selectedSection, setSelectedSection] = useState<string>("");
  
  // Get all sections assigned to this exam
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['exam-sections', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_assignments')
        .select(`
          section_id,
          sections (
            id,
            name
          )
        `)
        .eq('exam_id', examId);
        
      if (error) throw error;
      return data?.map(d => d.sections) || [];
    }
  });
  
  // Auto-select first section when sections load
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);
  
  // Get student results for selected section
  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['student-results', examId, selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      
      const { data, error } = await supabase
        .from('student_exam_results')
        .select(`
          id,
          marks_obtained,
          feedback,
          student_id,
          profiles:student_id (
            id,
            first_name,
            last_name,
            student_details (
              admission_number
            )
          ),
          exams (
            max_score
          )
        `)
        .eq('exam_id', examId)
        .order('marks_obtained', { ascending: false });
        
      if (error) throw error;
      
      // Now filter by student enrollment in section
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('student_sections')
        .select('student_id')
        .eq('section_id', selectedSection);
        
      if (enrollmentError) throw enrollmentError;
      
      const studentIds = enrollments.map(e => e.student_id);
      return data.filter(r => studentIds.includes(r.student_id));
    },
    enabled: !!selectedSection
  });

  if (loadingSections) {
    return <div className="text-center py-4">Loading sections...</div>;
  }
  
  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sections assigned to this exam.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Select Section</label>
        <Select
          value={selectedSection}
          onValueChange={setSelectedSection}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select a section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section: any) => (
              <SelectItem key={section.id} value={section.id}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="hidden md:table-cell">Percentage</TableHead>
              <TableHead className="hidden md:table-cell">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingResults ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading results...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No results found for this section.
                </TableCell>
              </TableRow>
            ) : (
              results.map((result) => {
                const maxScore = result.exams?.max_score || 100;
                const percentage = maxScore > 0 ? Math.round((result.marks_obtained / maxScore) * 100) : 0;
                
                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {result.profiles.first_name} {result.profiles.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.profiles.student_details?.admission_number || result.student_id.substring(0, 8)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{result.marks_obtained} / {maxScore}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={percentage >= 40 ? "default" : "destructive"}
                        className="mt-1"
                      >
                        {percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {result.feedback || <span className="text-muted-foreground">No feedback</span>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

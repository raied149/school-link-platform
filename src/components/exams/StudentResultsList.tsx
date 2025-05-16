
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TestResultFormDialog } from "@/components/exams/TestResultFormDialog";
import { useAuth } from "@/contexts/AuthContext";

interface StudentResultsListProps {
  examId: string;
}

export const StudentResultsList: React.FC<StudentResultsListProps> = ({ examId }) => {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  
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
  const { data: results = [], isLoading: loadingResults, refetch: refetchResults } = useQuery({
    queryKey: ['student-results', examId, selectedSection],
    queryFn: async () => {
      if (!selectedSection) return [];
      
      // First get the student IDs in this section
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('student_sections')
        .select('student_id')
        .eq('section_id', selectedSection);
        
      if (enrollmentError) throw enrollmentError;
      
      const studentIds = enrollments.map(e => e.student_id);
      
      if (studentIds.length === 0) return [];
      
      // Get student information for all students in this section
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          student_details (
            admission_number
          )
        `)
        .in('id', studentIds);
        
      if (studentsError) throw studentsError;
      
      // Get exam info to access max_score
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();
        
      if (examError) throw examError;
      
      // Then get results for students
      const { data: resultsData, error: resultsError } = await supabase
        .from('student_exam_results')
        .select('*')
        .eq('exam_id', examId)
        .in('student_id', studentIds);
        
      if (resultsError) throw resultsError;
      
      // Combine student data with their results (or null if no result)
      return students.map(student => {
        const result = resultsData?.find(r => r.student_id === student.id);
        return {
          student,
          result: result || null,
          maxScore: examData.max_score
        };
      }).sort((a, b) => {
        // Sort by marks (highest first), handling null results
        const marksA = a.result ? a.result.marks_obtained : 0;
        const marksB = b.result ? b.result.marks_obtained : 0;
        return marksB - marksA;
      });
    },
    enabled: !!selectedSection
  });

  const handleEditMarks = (student: any, result: any, maxScore: number) => {
    setSelectedStudent({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      admissionNumber: student.student_details?.admission_number || student.id.substring(0, 8)
    });
    setEditDialogOpen(true);
  };
  
  const handleSaveMarks = async (marks: number, feedback: string) => {
    if (!selectedStudent || !examId) return;
    
    try {
      await supabase
        .from('student_exam_results')
        .upsert({
          exam_id: examId,
          student_id: selectedStudent.id,
          marks_obtained: marks,
          feedback,
          updated_at: new Date().toISOString()
        });
      
      // Refresh results list
      refetchResults();
      
      return true;
    } catch (error) {
      console.error("Error saving marks:", error);
      return false;
    }
  };

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
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Feedback</TableHead>
              {isTeacherOrAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingResults ? (
              <TableRow>
                <TableCell colSpan={isTeacherOrAdmin ? 7 : 6} className="text-center py-8">
                  Loading results...
                </TableCell>
              </TableRow>
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isTeacherOrAdmin ? 7 : 6} className="text-center py-8">
                  No results found for this section.
                </TableCell>
              </TableRow>
            ) : (
              results.map((item: any) => {
                const student = item.student;
                const result = item.result;
                const maxScore = item.maxScore;
                const score = result ? result.marks_obtained : 0;
                const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                
                let statusClass = "bg-red-500";
                let statusText = "Needs Improvement";
                
                if (percentage >= 80) {
                  statusClass = "bg-green-500";
                  statusText = "Excellent";
                } else if (percentage >= 60) {
                  statusClass = "bg-blue-500";
                  statusText = "Good";
                } else if (percentage >= 40) {
                  statusClass = "bg-amber-500";
                  statusText = "Pass";
                }
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.student_details?.admission_number || student.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>
                      {result ? `${score} / ${maxScore}` : 'Not Graded'}
                    </TableCell>
                    <TableCell>
                      {result ? `${percentage}%` : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {result ? (
                        <Badge className={statusClass}>
                          {statusText}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {result?.feedback || <span className="text-muted-foreground">No feedback</span>}
                    </TableCell>
                    {isTeacherOrAdmin && (
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMarks(student, result, maxScore)}
                        >
                          {result ? 'Edit Marks' : 'Add Marks'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      
      {selectedStudent && (
        <TestResultFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          student={{
            name: selectedStudent.name,
            admissionNumber: selectedStudent.admissionNumber,
          }}
          maxMarks={results.find((r: any) => r.student.id === selectedStudent.id)?.maxScore || 100}
          testName={examId}
          onSave={handleSaveMarks}
          initialMarks={results.find((r: any) => r.student.id === selectedStudent.id)?.result?.marks_obtained || 0}
          initialFeedback={results.find((r: any) => r.student.id === selectedStudent.id)?.result?.feedback || ""}
        />
      )}
    </div>
  );
};

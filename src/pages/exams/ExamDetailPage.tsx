
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ExamHeader } from "@/components/exams/ExamHeader";
import { useExamDetail } from "@/hooks/useExamDetail";
import { useAuth } from "@/contexts/AuthContext";
import { MarkEntrySection } from "@/components/exams/MarkEntrySection";
import { StudentResultsList } from "@/components/exams/StudentResultsList";
import { useMarkEntry } from "@/hooks/useMarkEntry";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const ExamDetailPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const isStudentView = user?.role === 'student';
  
  const examDetail = useExamDetail(examId!);
  const markEntry = useMarkEntry(examId!);
  
  // If student view, fetch only the student's results for this exam
  const { data: studentResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['student-exam-results', examId, user?.id],
    queryFn: async () => {
      if (isStudentView && user?.id) {
        const { data, error } = await supabase
          .from('student_exam_results')
          .select(`
            id,
            marks_obtained,
            feedback,
            exams (
              id,
              name,
              date,
              max_score,
              subject_id,
              subjects (
                name,
                code
              )
            )
          `)
          .eq('exam_id', examId)
          .eq('student_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        return data ? [data] : [];
      }
      return [];
    },
    enabled: isStudentView && !!user?.id && !!examId
  });

  if (examDetail.isLoading) {
    return <div className="p-8 text-center">Loading exam details...</div>;
  }

  if (examDetail.error || !examDetail.exam) {
    return (
      <div className="p-8 text-center text-destructive">
        Error loading exam details: {examDetail.error instanceof Error ? examDetail.error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ExamHeader exam={examDetail.exam} onEditClick={examDetail.onEditExam} isStudentView={isStudentView} />
      
      <Card className="p-6">
        {isStudentView ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Results</h2>
            {resultsLoading ? (
              <div className="text-center py-4">Loading your results...</div>
            ) : studentResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No results available yet for this exam.
              </div>
            ) : (
              <div className="rounded-md border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Exam</h3>
                    <p className="text-lg font-semibold">{examDetail.exam.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                    <p className="text-lg">{examDetail.exam.subjects?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                    <p className="text-lg">{format(new Date(examDetail.exam.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Max Score</h3>
                    <p className="text-lg">{examDetail.exam.max_score}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Score</h3>
                    <p className="text-lg font-bold">{studentResults[0]?.marks_obtained || 'Not graded yet'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Percentage</h3>
                    <p className="text-lg">
                      {studentResults[0]?.marks_obtained
                        ? `${Math.round((studentResults[0].marks_obtained / examDetail.exam.max_score) * 100)}%`
                        : 'Not graded yet'}
                    </p>
                  </div>
                </div>
                
                {studentResults[0]?.feedback && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Teacher Feedback</h3>
                    <p className="p-4 bg-muted rounded-md">{studentResults[0].feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="mark-entry">Mark Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results">
              <StudentResultsList examId={examId!} />
            </TabsContent>
            
            <TabsContent value="mark-entry">
              <MarkEntrySection 
                examId={examId!}
                exam={examDetail.exam}
                availableSections={examDetail.availableSections}
                selectedSection={markEntry.selectedSection}
                setSelectedSection={markEntry.setSelectedSection}
                onMarksUpdated={markEntry.onMarksUpdated}
                onEditClick={examDetail.onEditExam}
              />
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default ExamDetailPage;

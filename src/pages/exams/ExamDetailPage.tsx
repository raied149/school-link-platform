
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useExamDetail } from "@/hooks/useExamDetail";
import { ExamHeader } from "@/components/exams/ExamHeader";
import { StudentResultsList } from "@/components/exams/StudentResultsList";
import { MarkEntrySection } from "@/components/exams/MarkEntrySection";

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const {
    exam,
    assignments,
    studentResults,
    selectedSection,
    setSelectedSection,
    activeTab,
    setActiveTab,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    isLoadingExam,
    isLoadingAssignments,
    isLoadingResults,
    assignmentsError,
    handleMarksUpdated,
    handleExamUpdated,
    handleDeleteExam,
    exportResultsAsCSV,
    availableSections,
    className
  } = useExamDetail(examId);

  if (isLoadingExam || isLoadingAssignments) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The exam you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/exams")}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/exams")} 
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exams
      </Button>

      <ExamHeader 
        exam={exam}
        assignments={assignments}
        className={className}
        onEditClick={() => setEditDialogOpen(true)}
        onDeleteClick={() => setDeleteDialogOpen(true)}
      />

      {/* Test/Exam Form Dialog for editing */}
      <TestExamFormDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        examToEdit={exam}
        onExamUpdated={handleExamUpdated}
      />

      {/* Confirmation Dialog for deletion */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Exam"
        description="Are you sure you want to delete this exam? This action cannot be undone and will remove all related data including student results."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteExam}
        isProcessing={isDeleting}
      />

      {assignmentsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error fetching exam assignments. The exam may not be assigned to any sections.
          </AlertDescription>
        </Alert>
      )}

      {!assignmentsError && assignments.length === 0 && (
        <Alert variant="default" className="mb-4 border-yellow-400 bg-yellow-50 text-yellow-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Sections Assigned</AlertTitle>
          <AlertDescription>
            This exam is not assigned to any sections. Please edit the exam to assign it to sections.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">Students & Results</TabsTrigger>
            <TabsTrigger value="mark-entry">Mark Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="mt-4">
            <StudentResultsList 
              examId={examId || ''}
              exam={exam}
              availableSections={availableSections}
              studentResults={studentResults}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              isLoadingResults={isLoadingResults}
              exportResultsAsCSV={exportResultsAsCSV}
              onTabChange={setActiveTab}
            />
          </TabsContent>
          
          <TabsContent value="mark-entry" className="mt-4">
            <MarkEntrySection 
              examId={exam.id}
              exam={exam}
              availableSections={availableSections}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              onMarksUpdated={handleMarksUpdated}
              onEditClick={() => setEditDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}


import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getStudentExamResults, bulkSaveStudentExamResults } from "@/services/examService";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExamStatsDisplay } from "./marks/ExamStatsDisplay";
import { StudentMarkRow } from "./marks/StudentMarkRow";
import { useMarkEntry } from "@/hooks/useMarkEntry";

interface MarkEntryTableProps {
  examId: string;
  sectionId: string;
  maxMarks: number;
  onMarksUpdated?: () => void;
}

export function MarkEntryTable({ examId, sectionId, maxMarks, onMarksUpdated }: MarkEntryTableProps) {
  const {
    isLoading,
    isSaving,
    students,
    marks,
    feedback,
    hasChanges,
    saveSuccess,
    stats,
    handleMarkChange,
    handleFeedbackChange,
    handleSave
  } = useMarkEntry(examId, sectionId, maxMarks, onMarksUpdated);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Loading students...</span>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No students found in this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Mark Entry</h3>
          <p className="text-sm text-muted-foreground">
            Enter marks for each student (max: {maxMarks})
          </p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : saveSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveSuccess ? "Saved" : "Save Marks"}
        </Button>
      </div>
      
      <ExamStatsDisplay stats={stats} maxMarks={maxMarks} />
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Marks (/{maxMarks})</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Feedback (Optional)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((item) => (
              <StudentMarkRow
                key={item.student.id}
                student={item.student}
                mark={marks[item.student.id] || 0}
                feedback={feedback[item.student.id] || ''}
                maxMarks={maxMarks}
                onMarkChange={handleMarkChange}
                onFeedbackChange={handleFeedbackChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

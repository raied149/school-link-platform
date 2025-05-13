
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Stats } from "@/hooks/useMarkEntry";
import { Card } from "@/components/ui/card";
import { useMarkEntry } from "@/hooks/useMarkEntry";

interface MarkEntryTableProps {
  examId: string;
  sectionId: string;
  maxScore: number;
  onMarksUpdated: () => void;
}

export const MarkEntryTable: React.FC<MarkEntryTableProps> = ({
  examId,
  sectionId,
  maxScore,
  onMarksUpdated
}) => {
  const {
    isLoading,
    isSaving,
    students,
    marks,
    feedback,
    stats,
    handleMarkChange,
    handleFeedbackChange,
    updateSingleMark
  } = useMarkEntry(examId);
  
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  
  // Handle inline editing for a student mark
  const handleSaveStudentMark = async (studentId: string) => {
    if (!updateSingleMark) return;
    
    const success = await updateSingleMark(
      studentId,
      marks[studentId],
      feedback[studentId]
    );
    
    if (success) {
      setEditingStudent(null);
      onMarksUpdated();
    }
  };
  
  // Calculate percentage from marks
  const calculatePercentage = (mark: number) => {
    return maxScore > 0 ? Math.round((mark / maxScore) * 100) : 0;
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading student data...</div>;
  }
  
  if (!students || students.length === 0) {
    return <div className="text-center py-8">No students found in this section.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium text-muted-foreground">Average</h4>
          <p className="text-2xl font-bold">{stats.avg.toFixed(1)}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-muted-foreground">Highest</h4>
          <p className="text-2xl font-bold">{stats.max}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-muted-foreground">Lowest</h4>
          <p className="text-2xl font-bold">{stats.min}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium text-muted-foreground">Pass Rate</h4>
          <p className="text-2xl font-bold">{stats.passPercentage.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Marks Entry Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Marks (max: {maxScore})</TableHead>
              <TableHead className="hidden md:table-cell">Percentage</TableHead>
              <TableHead className="hidden md:table-cell">Feedback</TableHead>
              {updateSingleMark && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{student.student.first_name} {student.student.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.student.student_details?.admission_number || student.student.id.substring(0, 8)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    max={maxScore}
                    value={marks[student.student.id] || 0}
                    onChange={(e) => handleMarkChange(student.student.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {calculatePercentage(marks[student.student.id] || 0)}%
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Textarea
                    value={feedback[student.student.id] || ''}
                    onChange={(e) => handleFeedbackChange(student.student.id, e.target.value)}
                    placeholder="Optional feedback..."
                    className="min-h-[80px] resize-none"
                  />
                </TableCell>
                {updateSingleMark && (
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleSaveStudentMark(student.student.id)}
                      size="sm"
                      disabled={editingStudent === student.student.id && isSaving}
                    >
                      {editingStudent === student.student.id && isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

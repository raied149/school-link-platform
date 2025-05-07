
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentResultsListProps {
  examId: string;
  exam: any; 
  availableSections: Array<{ id: string; name: string }>;
  studentResults: any[] | null;
  selectedSection: string;
  setSelectedSection: (value: string) => void;
  isLoadingResults: boolean;
  exportResultsAsCSV: () => void;
  onTabChange: (value: string) => void;
}

export const StudentResultsList = ({
  availableSections,
  studentResults,
  selectedSection,
  setSelectedSection,
  isLoadingResults,
  exportResultsAsCSV,
  exam,
  onTabChange
}: StudentResultsListProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Student Results</h3>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="sm:w-1/2">
          <label className="text-sm font-medium mb-1 block">Filter by Section</label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger>
              <SelectValue placeholder={availableSections.length > 0 ? "Select Section" : "No sections available"} />
            </SelectTrigger>
            <SelectContent>
              {availableSections.length === 0 ? (
                <SelectItem value="no-sections" disabled>No sections available</SelectItem>
              ) : (
                availableSections.map(section => (
                  <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {selectedSection && studentResults && studentResults.length > 0 && (
          <div className="sm:w-1/2 flex items-end">
            <Button variant="outline" onClick={exportResultsAsCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        )}
      </div>
      
      {selectedSection ? (
        isLoadingResults ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : studentResults && studentResults.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentResults.map((item) => {
                const student = item.student;
                const result = item.result;
                
                const marks = result ? result.marks_obtained : 0;
                const percentage = exam.max_score > 0 ? 
                  Math.round((marks / exam.max_score) * 100) : 0;
                  
                let statusColor = "bg-gray-500";
                if (percentage >= 80) statusColor = "bg-green-500";
                else if (percentage >= 60) statusColor = "bg-blue-500";
                else if (percentage >= 40) statusColor = "bg-amber-500";
                else statusColor = "bg-red-500";
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.student_details?.admission_number || student.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>{student.first_name} {student.last_name}</TableCell>
                    <TableCell>
                      {result ? (
                        <span>{result.marks_obtained} / {exam.max_score}</span>
                      ) : (
                        <span className="text-muted-foreground">No marks</span>
                      )}
                    </TableCell>
                    <TableCell>{percentage}%</TableCell>
                    <TableCell>
                      <Badge className={statusColor}>
                        {percentage >= 80 ? "Excellent" : 
                        percentage >= 60 ? "Good" : 
                        percentage >= 40 ? "Pass" : "Needs Improvement"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result && result.feedback ? (
                        <span>{result.feedback}</span>
                      ) : (
                        <span className="text-muted-foreground">No feedback</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">
              No results found for this section.
            </p>
            <Button onClick={() => onTabChange("mark-entry")}>
              Enter Marks
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">
            {availableSections.length === 0 
              ? "No sections are assigned to this exam. Please edit the exam to assign sections."
              : "Please select a section to view student results."
            }
          </p>
          {availableSections.length === 0 && (
            <Button onClick={() => console.log("Edit exam clicked")}>
              Edit Exam
            </Button>
          )}
        </div>
      )}
    </div>
  );
};


import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkEntryTable } from "@/components/exams/MarkEntryTable";

interface MarkEntrySectionProps {
  examId: string;
  exam: any;
  availableSections: Array<{ id: string; name: string }>;
  selectedSection: string;
  setSelectedSection: (value: string) => void;
  onMarksUpdated: () => void;
  onEditClick: () => void;
}

export const MarkEntrySection = ({
  examId,
  exam,
  availableSections,
  selectedSection,
  setSelectedSection,
  onMarksUpdated,
  onEditClick
}: MarkEntrySectionProps) => {
  return (
    <div>
      {availableSections.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">
            No sections are assigned to this exam. Please edit the exam to assign sections first.
          </p>
          <Button onClick={onEditClick}>
            Edit Exam
          </Button>
        </div>
      ) : !selectedSection ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">
            Please select a section to enter marks for students.
          </p>
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-xs">
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(section => (
                    <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <MarkEntryTable 
          examId={examId} 
          sectionId={selectedSection} 
          maxMarks={exam.max_score}
          onMarksUpdated={onMarksUpdated}
        />
      )}
    </div>
  );
};


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface SubjectFilterProps {
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
  isLoading?: boolean;
}

export function SubjectFilter({ 
  subjects, 
  selectedSubject, 
  onSubjectChange,
  isLoading = false 
}: SubjectFilterProps) {
  return (
    <div className="subject-filter">
      <Select value={selectedSubject} onValueChange={onSubjectChange} disabled={isLoading}>
        <SelectTrigger className="w-[180px]">
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select Subject" />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          {subjects && subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name} ({subject.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

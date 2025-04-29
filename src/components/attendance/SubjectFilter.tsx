
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectFilterProps {
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
}

export function SubjectFilter({ subjects, selectedSubject, onSubjectChange }: SubjectFilterProps) {
  return (
    <div className="subject-filter">
      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Subject" />
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


import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeacherAssignmentFieldsProps {
  assignmentType: 'user' | 'section' | 'class';
  setAssignmentType: (type: 'user' | 'section' | 'class') => void;
  selectedUserId?: string;
  setSelectedUserId: (id: string | undefined) => void;
  selectedClassId?: string;
  setSelectedClassId: (id: string | undefined) => void;
  selectedSectionId?: string;
  setSelectedSectionId: (id: string | undefined) => void;
  students: any[];
  classes: any[];
  sections: any[];
}

export function TeacherAssignmentFields({
  assignmentType,
  setAssignmentType,
  selectedUserId,
  setSelectedUserId,
  selectedClassId,
  setSelectedClassId,
  selectedSectionId,
  setSelectedSectionId,
  students,
  classes,
  sections
}: TeacherAssignmentFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Assignment Type</Label>
        <Select value={assignmentType} onValueChange={(value: any) => setAssignmentType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select assignment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Individual Student</SelectItem>
            <SelectItem value="section">Section</SelectItem>
            <SelectItem value="class">Entire Class</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {assignmentType === 'user' && (
        <div className="space-y-2">
          <Label htmlFor="studentId">Assign to Student <span className="text-red-500">*</span></Label>
          <Select 
            value={selectedUserId || undefined} 
            onValueChange={setSelectedUserId}
          >
            <SelectTrigger id="studentId">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {assignmentType === 'class' && (
        <div className="space-y-2">
          <Label htmlFor="classId">Assign to Class <span className="text-red-500">*</span></Label>
          <Select 
            value={selectedClassId || undefined} 
            onValueChange={setSelectedClassId}
          >
            <SelectTrigger id="classId">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {assignmentType === 'section' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sectionClassId">Class <span className="text-red-500">*</span></Label>
            <Select 
              value={selectedClassId || undefined} 
              onValueChange={setSelectedClassId}
            >
              <SelectTrigger id="sectionClassId">
                <SelectValue placeholder="Select a class first" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sectionId">Assign to Section <span className="text-red-500">*</span></Label>
            <Select 
              value={selectedSectionId || undefined} 
              onValueChange={setSelectedSectionId}
              disabled={!selectedClassId}
            >
              <SelectTrigger id="sectionId">
                <SelectValue placeholder={selectedClassId ? "Select a section" : "Select a class first"} />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </>
  );
}

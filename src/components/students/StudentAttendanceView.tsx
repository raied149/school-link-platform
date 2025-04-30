
import { Card } from "@/components/ui/card";
import { useStudentAttendanceView } from "./attendance/useStudentAttendanceView";
import { StudentAttendanceHeader } from "./attendance/StudentAttendanceHeader";
import { SectionAttendanceTable } from "./attendance/SectionAttendanceTable";

interface StudentAttendanceViewProps {
  classId?: string;
  sectionId?: string;
  studentId?: string;
}

export function StudentAttendanceView({ 
  classId, 
  sectionId, 
  studentId 
}: StudentAttendanceViewProps) {
  const {
    selectedDate,
    setSelectedDate,
    selectedSubject,
    setSelectedSubject,
    loading,
    sectionSubjects,
    students,
    filteredAttendanceRecords,
    handleMarkAttendance,
    isLoadingCombined
  } = useStudentAttendanceView(classId, sectionId, studentId);

  if (isLoadingCombined) {
    return <div className="text-center py-8">Loading student attendance data...</div>;
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No students found in this section.
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <StudentAttendanceHeader
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          sectionSubjects={sectionSubjects}
        />
      </div>

      <SectionAttendanceTable
        students={students}
        selectedSubject={selectedSubject}
        filteredAttendanceRecords={filteredAttendanceRecords}
        loading={loading}
        handleMarkAttendance={handleMarkAttendance}
      />
    </Card>
  );
}


import { Card } from "@/components/ui/card";
import { useAttendancePage } from "@/hooks/useAttendancePage";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { StudentAttendanceTable } from "@/components/attendance/StudentAttendanceTable";

const StudentAttendancePage = () => {
  const {
    searchTerm,
    setSearchTerm,
    gradeFilter,
    setGradeFilter,
    sectionFilter,
    setSectionFilter,
    statusFilter,
    setStatusFilter,
    selectedDate,
    setSelectedDate,
    selectedSubject,
    handleSubjectSelect,
    classes,
    sections,
    filteredStudents,
    handleMarkAttendance,
    isLoadingCombined
  } = useAttendancePage();

  const handleExport = () => {
    // Excel export functionality would be implemented here
    console.log("Export to Excel clicked");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track student attendance records
          </p>
        </div>
      </div>

      <Card className="p-6">
        {/* Filters and Search */}
        <AttendanceFilters
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          gradeFilter={gradeFilter}
          setGradeFilter={setGradeFilter}
          sectionFilter={sectionFilter}
          setSectionFilter={setSectionFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSubject={selectedSubject}
          handleSubjectSelect={handleSubjectSelect}
          classes={classes}
          sections={sections}
          onExport={handleExport}
        />

        {/* Content based on selection state */}
        {sectionFilter === 'all-sections' ? (
          <div className="text-center py-10 text-muted-foreground">
            Please select a section to view students
          </div>
        ) : selectedSubject === null ? (
          <div className="text-center py-10 text-muted-foreground">
            Please select a scheduled subject to view and mark attendance
          </div>
        ) : (
          <StudentAttendanceTable
            students={filteredStudents}
            isLoading={isLoadingCombined}
            onMarkAttendance={handleMarkAttendance}
            selectedSubject={selectedSubject}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentAttendancePage;

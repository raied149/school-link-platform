
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScheduledSubjectSelector } from "@/components/attendance/ScheduledSubjectSelector";

const StudentAttendancePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all-grades");
  const [sectionFilter, setSectionFilter] = useState("all-sections");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
        
      if (error) {
        console.error("Error fetching classes:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch sections based on grade filter
  const { data: sections = [] } = useQuery({
    queryKey: ['sections', gradeFilter],
    queryFn: async () => {
      const query = supabase
        .from('sections')
        .select('*');
        
      if (gradeFilter !== 'all-grades') {
        query.eq('class_id', gradeFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching sections:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!classes.length
  });

  // Reset selected subject when grade or section changes
  useEffect(() => {
    setSelectedSubject(null);
  }, [gradeFilter, sectionFilter, selectedDate]);

  // Fetch students
  const { data: studentsData = [], isLoading } = useQuery({
    queryKey: ['students-with-details', sectionFilter],
    queryFn: async () => {
      if (sectionFilter === 'all-sections') {
        return [];
      }
      
      console.log("Fetching students for attendance page");
      
      let query = supabase.from('profiles')
        .select(`
          *,
          student_details!inner(*),
          student_sections!inner(
            section_id,
            sections:section_id(
              id,
              name,
              classes:class_id(
                id,
                name
              )
            )
          )
        `)
        .eq('role', 'student')
        .eq('student_sections.section_id', sectionFilter);
      
      const { data: students, error } = await query;
        
      if (error) {
        console.error("Error fetching students with section data:", error);
        throw error;
      }
      
      return students || [];
    },
    enabled: sectionFilter !== 'all-sections'
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['student-attendance', formattedDate, selectedSubject, sectionFilter],
    queryFn: async () => {
      if (sectionFilter === 'all-sections' || !selectedSubject) {
        return [];
      }
      
      console.log("Fetching attendance records with subject:", selectedSubject);
      
      // Base query
      const query = supabase
        .from('student_attendance')
        .select('*')
        .eq('date', formattedDate)
        .eq('section_id', sectionFilter)
        .eq('subject_id', selectedSubject);
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      
      console.log("Fetched attendance records:", data);
      return data || [];
    },
    enabled: sectionFilter !== 'all-sections' && !!selectedSubject
  });

  // Map students with their attendance
  const students = studentsData.map(student => {
    const section = student.student_sections?.[0]?.sections;
    
    // Find attendance record for the selected subject
    const attendanceRecord = attendanceRecords.find(
      record => record.student_id === student.id && 
                record.date === formattedDate && 
                record.subject_id === selectedSubject
    );

    return {
      ...student,
      section: section ? section.name : 'Not Assigned',
      grade: section?.classes ? section.classes.name : 'Not Assigned',
      sectionId: section ? section.id : null,
      classId: section?.classes ? section.classes.id : null,
      attendance: attendanceRecord ? attendanceRecord.status : 'not-marked'
    };
  });

  // Filter students based on search and status
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
                          fullName.includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "present" && student.attendance === "present") ||
                          (statusFilter === "absent" && student.attendance === "absent") ||
                          (statusFilter === "late" && student.attendance === "late") ||
                          (statusFilter === "leave" && student.attendance === "leave");
    
    return matchesSearch && matchesStatus;
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ 
      studentId, 
      status, 
      sectionId,
      subjectId
    }: { 
      studentId: string; 
      status: 'present' | 'absent' | 'late' | 'leave';
      sectionId: string;
      subjectId: string;
    }) => {
      if (!sectionId || !subjectId) {
        throw new Error("Missing required information");
      }

      // Query parameters for finding existing records
      const queryParams = {
        student_id: studentId,
        date: formattedDate,
        section_id: sectionId,
        subject_id: subjectId
      };

      const { data: existingRecord } = await supabase
        .from('student_attendance')
        .select('id')
        .match(queryParams)
        .maybeSingle();
        
      if (existingRecord) {
        const { data, error } = await supabase
          .from('student_attendance')
          .update({ status })
          .eq('id', existingRecord.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        const record = {
          student_id: studentId,
          section_id: sectionId,
          date: formattedDate,
          status,
          subject_id: subjectId
        };

        const { data, error } = await supabase
          .from('student_attendance')
          .insert(record)
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance', formattedDate, selectedSubject, sectionFilter] });
      toast({
        title: "Attendance recorded",
        description: "The attendance has been saved successfully."
      });
    },
    onError: (error) => {
      console.error("Error marking attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance record.",
        variant: "destructive"
      });
    }
  });

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.sectionId || !selectedSubject) {
      toast({
        title: "Error",
        description: "Missing required information to mark attendance",
        variant: "destructive"
      });
      return;
    }
    
    markAttendanceMutation.mutate({ 
      studentId, 
      status, 
      sectionId: student.sectionId,
      subjectId: selectedSubject
    });
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'present':
        return <Badge variant="outline" className="bg-green-50 text-green-600">Present</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-50 text-red-600">Absent</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Late</Badge>;
      case 'leave':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Leave</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-600">Not marked</Badge>;
    }
  };

  const isLoadingCombined = isLoading || isLoadingAttendance;

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
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-grades">All Grades</SelectItem>
                {classes.map((classItem: any) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={sectionFilter} 
              onValueChange={setSectionFilter} 
              disabled={gradeFilter === 'all-grades'}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sections">All Sections</SelectItem>
                {sections.map((section: any) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
              </SelectContent>
            </Select>

            <Input
              className="w-[300px]"
              placeholder="Search students..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Only show scheduled subjects once a section is selected */}
          {sectionFilter !== 'all-sections' && (
            <div className="mt-4">
              <ScheduledSubjectSelector
                sectionId={sectionFilter}
                date={selectedDate}
                selectedSubjectId={selectedSubject}
                onSelectSubject={handleSubjectSelect}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>

        {sectionFilter === 'all-sections' ? (
          <div className="text-center py-10 text-muted-foreground">
            Please select a section to view students
          </div>
        ) : selectedSubject === null ? (
          <div className="text-center py-10 text-muted-foreground">
            Please select a scheduled subject to view and mark attendance
          </div>
        ) : isLoadingCombined ? (
          <div className="text-center py-8">Loading students...</div>
        ) : (
          <div className="mt-6 rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium">Student ID</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Grade</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Section</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="p-4">{student.id.substring(0, 8)}</td>
                    <td className="p-4">{`${student.first_name} ${student.last_name}`}</td>
                    <td className="p-4">{student.grade}</td>
                    <td className="p-4">{student.section}</td>
                    <td className="p-4">
                      {getStatusBadge(student.attendance)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => handleMarkAttendance(student.id, 'present')}
                        >
                          Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => handleMarkAttendance(student.id, 'absent')}
                        >
                          Absent
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                          onClick={() => handleMarkAttendance(student.id, 'late')}
                        >
                          Late
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          onClick={() => handleMarkAttendance(student.id, 'leave')}
                        >
                          Leave
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      No students found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentAttendancePage;

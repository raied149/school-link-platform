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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const StudentAttendancePage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all-grades");
  const [sectionFilter, setSectionFilter] = useState("all-sections");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

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

  const { data: studentsData = [], isLoading } = useQuery({
    queryKey: ['students-with-details', gradeFilter, sectionFilter],
    queryFn: async () => {
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
        .eq('role', 'student');
        
      if (sectionFilter !== 'all-sections') {
        query = query.eq('student_sections.section_id', sectionFilter);
      } else if (gradeFilter !== 'all-grades') {
        // This is more complex and would require a subquery in SQL
        // For now, we'll filter in the client side
      }
      
      const { data: students, error } = await query;
        
      if (error) {
        console.error("Error fetching students with section data:", error);
        throw error;
      }
      
      return students || [];
    },
    enabled: true
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['student-attendance', formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_attendance')
        .select('*')
        .eq('date', formattedDate);
        
      if (error) {
        console.error("Error fetching attendance records:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: true
  });

  const students = studentsData.map(student => {
    const section = student.student_sections?.[0]?.sections;
    const attendanceRecord = attendanceRecords.find(
      record => record.student_id === student.id && record.date === formattedDate
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

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
                          fullName.includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === "all-grades" || student.classId === gradeFilter;
    
    const matchesSection = sectionFilter === "all-sections" || student.sectionId === sectionFilter;
    
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "present" && student.attendance === "present") ||
                          (statusFilter === "absent" && student.attendance === "absent") ||
                          (statusFilter === "late" && student.attendance === "late") ||
                          (statusFilter === "leave" && student.attendance === "leave");
    
    return matchesSearch && matchesGrade && matchesSection && matchesStatus;
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, sectionId }: { 
      studentId: string, 
      status: 'present' | 'absent' | 'late' | 'leave',
      sectionId: string
    }) => {
      if (!sectionId) {
        throw new Error("Student is not assigned to a section");
      }

      const { data: existingRecord } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('date', formattedDate)
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
        const { data, error } = await supabase
          .from('student_attendance')
          .insert({
            student_id: studentId,
            section_id: sectionId,
            date: formattedDate,
            status
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance', formattedDate] });
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
    if (!student || !student.sectionId) {
      toast({
        title: "Error",
        description: "This student is not assigned to any section",
        variant: "destructive"
      });
      return;
    }
    
    markAttendanceMutation.mutate({ 
      studentId, 
      status, 
      sectionId: student.sectionId 
    });
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

  if (isLoading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

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
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
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

            <Select value={sectionFilter} onValueChange={setSectionFilter}>
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>

        <div className="rounded-md border">
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
      </Card>
    </div>
  );
};

export default StudentAttendancePage;


import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useAttendancePage = () => {
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

      // Query parameters for finding existing records - now includes subject_id
      const queryParams = {
        student_id: studentId,
        date: formattedDate,
        section_id: sectionId,
        subject_id: subjectId
      };

      // First check if a record exists for this specific student, date, section AND subject
      const { data: existingRecord, error: checkError } = await supabase
        .from('student_attendance')
        .select('id')
        .match(queryParams)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing attendance record:", checkError);
        throw checkError;
      }
        
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('student_attendance')
          .update({ status })
          .eq('id', existingRecord.id)
          .select();
          
        if (error) {
          console.error("Error updating attendance:", error);
          throw error;
        }
        return data;
      } else {
        // Create new record with the subject_id included
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
          
        if (error) {
          console.error("Error creating attendance record:", error);
          throw error;
        }
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

  const isLoadingCombined = isLoading || isLoadingAttendance;

  return {
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
    isLoadingCombined,
    formattedDate
  };
};

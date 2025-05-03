
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, Navigate } from "react-router-dom";
import { Users, BookOpen, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";
import { SubjectManagement } from "@/components/subjects/SubjectManagement";
import { ClassHeader } from "@/components/classes/ClassHeader";
import { StudentList } from "@/components/classes/StudentList";
import { WeeklyTimetableView } from "@/components/timetable/WeeklyTimetableView";
import { timetableService } from "@/services/timetableService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ClassDetailsPage = () => {
  const { yearId, classId, sectionId } = useParams<{ 
    yearId: string, 
    classId: string,
    sectionId: string
  }>();
  
  const { user } = useAuth();
  
  const { data: academicYear } = useQuery({
    queryKey: ['academicYear', yearId],
    queryFn: async () => {
      if (!yearId) return null;
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('id', yearId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at
      } : null;
    },
    enabled: !!yearId
  });
  
  const { data: classDetails } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();
        
      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        academicYearId: data.year_id,
        createdAt: data.created_at
      } : null;
    },
    enabled: !!classId
  });
  
  const { data: sectionDetails } = useQuery({
    queryKey: ['section', sectionId],
    queryFn: async () => {
      if (!sectionId) return null;
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', sectionId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        name: data.name,
        classId: data.class_id,
        academicYearId: yearId || "",
        teacherId: data.teacher_id,
        createdAt: data.created_at,
        updatedAt: data.created_at
      };
    },
    enabled: !!sectionId
  });

  // Fetch filtered timetable data
  const { data: timeSlots = [], isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ['class-timetable', classId, sectionId],
    queryFn: () => {
      if (!classId || !sectionId) return [];
      return timetableService.getTimeSlots({
        classId,
        sectionId
      });
    },
    enabled: !!classId && !!sectionId
  });

  if (!classId || !sectionId || !yearId) {
    return <Navigate to="/classes" replace />;
  }

  return (
    <div className="space-y-6">
      <ClassHeader 
        className={classDetails?.name} 
        section={sectionDetails?.name}
        academicYear={academicYear?.name}
      />

      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="timetable">
            <Clock className="h-4 w-4 mr-2" />
            Timetable
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="py-4">
          <StudentList sectionId={sectionId} />
        </TabsContent>
        
        <TabsContent value="subjects" className="py-4">
          <SubjectManagement 
            classId={classId} 
            sectionId={sectionId}
            academicYearId={yearId}
          />
        </TabsContent>
        
        <TabsContent value="timetable" className="py-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Class Timetable</h2>
              <Button asChild>
                <Link to={`/timetable?classId=${classId}&sectionId=${sectionId}`}>
                  Full Timetable Management
                </Link>
              </Button>
            </div>
            
            {isLoadingTimeSlots ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading timetable...</p>
              </div>
            ) : (
              <WeeklyTimetableView
                timeSlots={timeSlots}
                isLoading={isLoadingTimeSlots}
                onEdit={() => {}} // No-op since we redirect to full timetable page
                onDelete={() => {}}
                user={user}
              />
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="py-4">
          <StudentAttendanceView 
            classId={classId}
            sectionId={sectionId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetailsPage;

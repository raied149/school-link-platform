
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sectionService } from "@/services/sectionService";
import { classService } from "@/services/classService";
import { academicYearService } from "@/services/academicYearService";
import { useParams } from "react-router-dom";
import { Users, BookOpen, Calendar, Clock, Plus } from "lucide-react";
import { StudentAcademicDetails } from "@/components/students/StudentAcademicDetails";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";
import { SubjectManagement } from "@/components/subjects/SubjectManagement";
import { Button } from "@/components/ui/button";
import { TimetableManagement } from "@/components/timetable/TimetableManagement";

const ClassDetailsPage = () => {
  const { yearId, classId, sectionId } = useParams<{ 
    yearId: string, 
    classId: string,
    sectionId: string
  }>();
  
  const { data: academicYear } = useQuery({
    queryKey: ['academicYear', yearId],
    queryFn: () => academicYearService.getAcademicYearById(yearId!),
    enabled: !!yearId
  });
  
  const { data: classDetails } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => classService.getClassById(classId!),
    enabled: !!classId
  });
  
  const { data: sectionDetails } = useQuery({
    queryKey: ['section', sectionId],
    queryFn: () => sectionService.getSectionById(sectionId!),
    enabled: !!sectionId
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {classDetails?.name} - {sectionDetails?.name}
        </h1>
        <p className="text-muted-foreground">
          Academic Year: {academicYear?.name || 'Loading...'}
        </p>
      </div>

      <Tabs defaultValue="students">
        <TabsList className="grid w-full grid-cols-5">
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
          <StudentAcademicDetails classId={classId} sectionId={sectionId} />
        </TabsContent>
        
        <TabsContent value="subjects" className="py-4">
          <SubjectManagement 
            classId={classId} 
            sectionId={sectionId} 
            academicYearId={yearId} 
          />
        </TabsContent>
        
        <TabsContent value="timetable" className="py-4">
          <TimetableManagement
            classId={classId!}
            sectionId={sectionId!}
            academicYearId={yearId!}
          />
        </TabsContent>
        
        <TabsContent value="attendance" className="py-4">
          <StudentAttendanceView classId={classId} sectionId={sectionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetailsPage;

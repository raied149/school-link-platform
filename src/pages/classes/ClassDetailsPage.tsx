import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sectionService } from "@/services/sectionService";
import { classService } from "@/services/classService";
import { academicYearService } from "@/services/academicYearService";
import { useParams } from "react-router-dom";
import { Users, BookOpen, Calendar, Clock } from "lucide-react";
import { StudentAcademicDetails } from "@/components/students/StudentAcademicDetails";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";

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
          <StudentAcademicDetails classId={classId} sectionId={sectionId} />
        </TabsContent>
        
        <TabsContent value="subjects" className="py-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subjects</h2>
            <p className="text-muted-foreground">
              This tab will contain the list of subjects taught in this section and their assigned teachers.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="timetable" className="py-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Timetable</h2>
            <p className="text-muted-foreground">
              This tab will contain the weekly timetable for this section.
            </p>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="py-4">
          <StudentAttendanceView classId={classId} sectionId={sectionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetailsPage;

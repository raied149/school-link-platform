
import React from "react";
import { useParams } from "react-router-dom";
import { Teacher } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { TeacherPersonalSection } from "./teacher/TeacherPersonalSection";
import { TeacherContactSection } from "./teacher/TeacherContactSection";
import { TeacherProfessionalSection } from "./teacher/TeacherProfessionalSection";
import { TeacherAttendanceSection } from "./teacher/TeacherAttendanceSection";
import { TeacherPerformanceSection } from "./teacher/TeacherPerformanceSection";
import { TeacherEmergencySection } from "./teacher/TeacherEmergencySection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface TeacherDetailsProps {
  teacher?: Teacher;
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  const { teacherId } = useParams();
  
  const { data: fetchedTeacher, isLoading } = useQuery({
    queryKey: ['teacher', teacherId || teacher?.id],
    queryFn: async () => {
      const id = teacherId || teacher?.id;
      
      if (!id) return null;
      
      // Fetch profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileError) {
        console.error("Error fetching teacher profile:", profileError);
        throw profileError;
      }
      
      // Fetch teacher details
      const { data: teacherDetails, error: detailsError } = await supabase
        .from('teacher_details')
        .select('*')
        .eq('id', id)
        .single();
      
      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error("Error fetching teacher details:", detailsError);
        throw detailsError;
      }
      
      // Map to our Teacher type
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email || '',
        role: profile.role,
        gender: teacherDetails?.gender || 'other',
        dateOfBirth: teacherDetails?.date_of_birth || '',
        nationality: teacherDetails?.nationality || '',
        contactInformation: {
          currentAddress: teacherDetails?.contact_info?.currentAddress || '',
          permanentAddress: teacherDetails?.contact_info?.permanentAddress || '',
          personalPhone: teacherDetails?.contact_info?.personalPhone || '',
          schoolPhone: teacherDetails?.contact_info?.schoolPhone || '',
          personalEmail: teacherDetails?.contact_info?.personalEmail || '',
          schoolEmail: teacherDetails?.contact_info?.schoolEmail || '',
        },
        professionalDetails: {
          employeeId: teacherDetails?.professional_info?.employeeId || '',
          designation: teacherDetails?.professional_info?.designation || '',
          department: teacherDetails?.professional_info?.department || '',
          subjects: teacherDetails?.professional_info?.subjects || [],
          classesAssigned: teacherDetails?.professional_info?.classesAssigned || [],
          joiningDate: teacherDetails?.professional_info?.joiningDate || '',
          qualifications: teacherDetails?.professional_info?.qualifications || [],
          employmentType: teacherDetails?.professional_info?.employmentType || 'Full-time',
        },
        attendance: { present: 0, absent: 0, leave: 0 }, // Default values
        leaveBalance: { sick: 0, casual: 0, vacation: 0 }, // Default values
        performance: {},
        emergency: {
          contactName: teacherDetails?.emergency_contact?.name || '',
          relationship: teacherDetails?.emergency_contact?.relationship || '',
          phone: teacherDetails?.emergency_contact?.phone || '',
        },
        medicalInformation: {
          conditions: teacherDetails?.medical_info?.conditions || [],
          allergies: teacherDetails?.medical_info?.allergies || [],
        },
        createdAt: profile.created_at,
        updatedAt: profile.created_at,
      };
    },
    enabled: !!(teacherId || teacher?.id),
  });

  const displayTeacher = teacher || fetchedTeacher;
  
  if (isLoading) {
    return <div>Loading teacher details...</div>;
  }
  
  if (!displayTeacher) {
    return <div>Teacher not found</div>;
  }

  return (
    <Card className="p-6">
      <Accordion type="single" defaultValue="personal" collapsible className="space-y-4">
        <TeacherPersonalSection teacher={displayTeacher} />
        <TeacherContactSection teacher={displayTeacher} />
        <TeacherProfessionalSection teacher={displayTeacher} />
        <TeacherAttendanceSection teacher={displayTeacher} />
        <TeacherPerformanceSection teacher={displayTeacher} />
        <TeacherEmergencySection teacher={displayTeacher} />
      </Accordion>
    </Card>
  );
}

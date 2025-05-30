
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
      
      // Parse JSON fields properly
      const contactInfo = typeof teacherDetails?.contact_info === 'string' 
        ? JSON.parse(teacherDetails.contact_info) 
        : teacherDetails?.contact_info || {};
        
      const professionalInfo = typeof teacherDetails?.professional_info === 'string'
        ? JSON.parse(teacherDetails.professional_info)
        : teacherDetails?.professional_info || {};
        
      const emergencyContact = typeof teacherDetails?.emergency_contact === 'string'
        ? JSON.parse(teacherDetails.emergency_contact)
        : teacherDetails?.emergency_contact || {};
        
      const medicalInfo = typeof teacherDetails?.medical_info === 'string'
        ? JSON.parse(teacherDetails.medical_info)
        : teacherDetails?.medical_info || {};
      
      // Ensure gender is one of the allowed values
      const gender = (teacherDetails?.gender === 'male' || teacherDetails?.gender === 'female')
        ? teacherDetails.gender as 'male' | 'female'
        : 'other';
      
      // Map to our Teacher type
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email || '',
        role: profile.role,
        gender: gender,
        dateOfBirth: teacherDetails?.date_of_birth || '',
        nationality: teacherDetails?.nationality || '',
        contactInformation: {
          currentAddress: contactInfo.currentAddress || '',
          permanentAddress: contactInfo.permanentAddress || '',
          personalPhone: contactInfo.personalPhone || '',
          schoolPhone: contactInfo.schoolPhone || '',
          personalEmail: contactInfo.personalEmail || '',
          schoolEmail: contactInfo.schoolEmail || '',
        },
        professionalDetails: {
          employeeId: professionalInfo.employeeId || '',
          designation: professionalInfo.designation || '',
          department: professionalInfo.department || '',
          subjects: professionalInfo.subjects || [],
          classesAssigned: professionalInfo.classesAssigned || [],
          joiningDate: professionalInfo.joiningDate || '',
          qualifications: professionalInfo.qualifications || [],
          employmentType: professionalInfo.employmentType || 'Full-time',
        },
        attendance: { present: 0, absent: 0, leave: 0 }, // Default values
        leaveBalance: { sick: 0, casual: 0, vacation: 0 }, // Default values
        performance: {},
        emergency: {
          contactName: emergencyContact.name || '',
          relationship: emergencyContact.relationship || '',
          phone: emergencyContact.phone || '',
        },
        medicalInformation: {
          conditions: medicalInfo.conditions || [],
          allergies: medicalInfo.allergies || [],
        },
        createdAt: profile.created_at,
        updatedAt: profile.created_at,
      } as Teacher;
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

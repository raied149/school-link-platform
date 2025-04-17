
import { Teacher } from "@/types";
import { TeacherPersonalSection } from "./teacher/TeacherPersonalSection";
import { TeacherContactSection } from "./teacher/TeacherContactSection";
import { TeacherProfessionalSection } from "./teacher/TeacherProfessionalSection";
import { TeacherAttendanceSection } from "./teacher/TeacherAttendanceSection";
import { TeacherPerformanceSection } from "./teacher/TeacherPerformanceSection";
import { TeacherEmergencySection } from "./teacher/TeacherEmergencySection";

interface TeacherDetailsProps {
  teacher: Teacher;
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  return (
    <>
      <TeacherPersonalSection teacher={teacher} />
      <TeacherContactSection teacher={teacher} />
      <TeacherProfessionalSection teacher={teacher} />
      <TeacherAttendanceSection teacher={teacher} />
      <TeacherPerformanceSection teacher={teacher} />
      <TeacherEmergencySection teacher={teacher} />
    </>
  );
}

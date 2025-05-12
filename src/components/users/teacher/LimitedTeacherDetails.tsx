
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TeacherPersonalSection } from "./TeacherPersonalSection";
import { TeacherEmergencySection } from "./TeacherEmergencySection";

interface LimitedTeacherDetailsProps {
  teacher: Teacher;
}

export function LimitedTeacherDetails({ teacher }: LimitedTeacherDetailsProps) {
  return (
    <>
      <AccordionItem value="personal">
        <AccordionTrigger>Personal Information</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm">{teacher.firstName} {teacher.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm capitalize">{teacher.gender || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Nationality</p>
              <p className="text-sm">{teacher.nationality || "Not specified"}</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="emergency">
        <AccordionTrigger>Emergency Contact</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Emergency Contact Name</p>
              <p className="text-sm">{teacher.emergency?.contactName || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Emergency Contact Relationship</p>
              <p className="text-sm">{teacher.emergency?.relationship || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Emergency Contact Phone</p>
              <p className="text-sm">{teacher.emergency?.phone || "Not specified"}</p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}

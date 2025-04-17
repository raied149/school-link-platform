
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TeacherEmergencySectionProps {
  teacher: Teacher;
}

export function TeacherEmergencySection({ teacher }: TeacherEmergencySectionProps) {
  return (
    <AccordionItem value="emergency">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M12 22c4.97 0 9-2.69 9-6s-4.03-6-9-6-9 2.69-9 6 4.03 6 9 6Z" />
            <path d="M12 16v6" />
            <path d="M12 6a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M12 6v4" />
          </svg>
          <span>Emergency Information</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Contact Name</p>
              <p className="text-sm text-muted-foreground">{teacher.emergency.contactName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Relationship</p>
              <p className="text-sm text-muted-foreground">{teacher.emergency.relationship}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{teacher.emergency.phone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Medical Conditions</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.medicalInformation.conditions.map((condition: string, index: number) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Allergies</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.medicalInformation.allergies.map((allergy: string, index: number) => (
                <li key={index}>{allergy}</li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

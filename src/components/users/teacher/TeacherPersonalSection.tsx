
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { differenceInYears, parseISO } from "date-fns";

interface TeacherPersonalSectionProps {
  teacher: Teacher;
}

export function TeacherPersonalSection({ teacher }: TeacherPersonalSectionProps) {
  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth));
  };

  return (
    <AccordionItem value="personal">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Personal Details</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Full Name</p>
              <p className="text-sm text-muted-foreground">
                {teacher.firstName} {teacher.middleName} {teacher.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm text-muted-foreground">{teacher.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">
                {teacher.dateOfBirth} ({calculateAge(teacher.dateOfBirth)} years)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Nationality</p>
              <p className="text-sm text-muted-foreground">{teacher.nationality}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Religion</p>
              <p className="text-sm text-muted-foreground">{teacher.religion}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Marital Status</p>
              <p className="text-sm text-muted-foreground">{teacher.maritalStatus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Blood Group</p>
              <p className="text-sm text-muted-foreground">{teacher.bloodGroup}</p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

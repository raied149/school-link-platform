
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TeacherContactSectionProps {
  teacher: Teacher;
}

export function TeacherContactSection({ teacher }: TeacherContactSectionProps) {
  return (
    <AccordionItem value="contact">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span>Contact Information</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 p-4">
          <div>
            <p className="text-sm font-medium">Current Address</p>
            <p className="text-sm text-muted-foreground">{teacher.contactInformation.currentAddress}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Permanent Address</p>
            <p className="text-sm text-muted-foreground">{teacher.contactInformation.permanentAddress}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Personal Phone</p>
              <p className="text-sm text-muted-foreground">{teacher.contactInformation.personalPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">School Phone</p>
              <p className="text-sm text-muted-foreground">{teacher.contactInformation.schoolPhone}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Personal Email</p>
              <p className="text-sm text-muted-foreground">{teacher.contactInformation.personalEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium">School Email</p>
              <p className="text-sm text-muted-foreground">{teacher.contactInformation.schoolEmail}</p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

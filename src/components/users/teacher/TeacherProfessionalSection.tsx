
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TeacherProfessionalSectionProps {
  teacher: Teacher;
}

export function TeacherProfessionalSection({ teacher }: TeacherProfessionalSectionProps) {
  return (
    <AccordionItem value="professional">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>Professional Details</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Employee ID</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails.employeeId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Designation</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails.designation}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Joining Date</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails.joiningDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Employment Type</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails.employmentType}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Subjects Taught</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.professionalDetails.subjects.map((subject: string, index: number) => (
                <li key={index}>{subject}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Classes Assigned</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.professionalDetails.classesAssigned.map((classAssigned: string, index: number) => (
                <li key={index}>{classAssigned}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Qualifications</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.professionalDetails.qualifications.map((qualification: string, index: number) => (
                <li key={index}>{qualification}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Specializations</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.professionalDetails.specializations.map((specialization: string, index: number) => (
                <li key={index}>{specialization}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Previous Experience</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.professionalDetails.previousExperience.map((exp: any, index: number) => (
                <li key={index}>{exp.position} at {exp.schoolName} ({exp.duration})</li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}


import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TeacherProfessionalSectionProps {
  teacher: Teacher;
}

export function TeacherProfessionalSection({ teacher }: TeacherProfessionalSectionProps) {
  // Make sure all arrays exist or default to empty arrays
  const subjects = teacher.professionalDetails?.subjects || [];
  const classesAssigned = teacher.professionalDetails?.classesAssigned || [];
  const qualifications = teacher.professionalDetails?.qualifications || [];
  const specializations = teacher.professionalDetails?.specializations || [];
  const previousExperience = teacher.professionalDetails?.previousExperience || [];

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
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails?.employeeId || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Designation</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails?.designation || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails?.department || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Joining Date</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails?.joiningDate || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Employment Type</p>
              <p className="text-sm text-muted-foreground">{teacher.professionalDetails?.employmentType || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Subjects Taught</p>
            {subjects.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {subjects.map((subject: string, index: number) => (
                  <li key={index}>{subject}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No subjects specified</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Classes Assigned</p>
            {classesAssigned.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {classesAssigned.map((classAssigned: string, index: number) => (
                  <li key={index}>{classAssigned}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No classes assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Qualifications</p>
            {qualifications.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {qualifications.map((qualification: string, index: number) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No qualifications specified</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Specializations</p>
            {specializations.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {specializations.map((specialization: string, index: number) => (
                  <li key={index}>{specialization}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specializations specified</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Previous Experience</p>
            {previousExperience.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {previousExperience.map((exp: any, index: number) => (
                  <li key={index}>{exp.position} at {exp.schoolName} ({exp.duration})</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No previous experience</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

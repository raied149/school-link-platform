import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeacherProfessionalSectionProps {
  teacher: Teacher;
}

export function TeacherProfessionalSection({ teacher }: TeacherProfessionalSectionProps) {
  // Query for subjects assigned to this teacher
  const { data: teacherSubjects = [] } = useQuery({
    queryKey: ['subjects-by-teacher', teacher.id],
    queryFn: async () => {
      const { data: ts, error } = await supabase
        .from("teacher_subjects")
        .select("subject_id, subjects(name, code)")
        .eq("teacher_id", teacher.id);
      if (error) throw error;
      return (ts || []).map((row: any) => row.subjects?.name).filter(Boolean);
    },
    enabled: !!teacher.id
  });

  // Make sure all arrays exist or default to empty arrays
  const subjects = teacherSubjects;

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
              <p className="text-sm text-muted-foreground">No subjects assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Classes Assigned</p>
            {teacher.professionalDetails?.classesAssigned.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {teacher.professionalDetails?.classesAssigned.map((classAssigned: string, index: number) => (
                  <li key={index}>{classAssigned}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No classes assigned</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Qualifications</p>
            {teacher.professionalDetails?.qualifications.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {teacher.professionalDetails?.qualifications.map((qualification: string, index: number) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No qualifications specified</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Specializations</p>
            {teacher.professionalDetails?.specializations.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {teacher.professionalDetails?.specializations.map((specialization: string, index: number) => (
                  <li key={index}>{specialization}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specializations specified</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Previous Experience</p>
            {teacher.professionalDetails?.previousExperience.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {teacher.professionalDetails?.previousExperience.map((exp: any, index: number) => (
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

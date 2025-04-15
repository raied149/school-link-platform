import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Teacher } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import { Book, Briefcase, Calendar, Heart, Home, Mail, Phone, Shield, User } from "lucide-react";

interface TeacherDetailsProps {
  teacher: Teacher;
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth));
  };

  return (
    <>
      <AccordionItem value="personal">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
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

      <AccordionItem value="contact">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
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

      <AccordionItem value="professional">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
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

      <AccordionItem value="attendance">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Attendance & Leave Information</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Present Days</p>
                <p className="text-sm text-muted-foreground">{teacher.attendance.present}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Absent Days</p>
                <p className="text-sm text-muted-foreground">{teacher.attendance.absent}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Leave Days</p>
                <p className="text-sm text-muted-foreground">{teacher.attendance.leave}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium">Leave Balance</p>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium">Sick</p>
                  <p className="text-sm text-muted-foreground">{teacher.leaveBalance.sick}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Casual</p>
                  <p className="text-sm text-muted-foreground">{teacher.leaveBalance.casual}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Vacation</p>
                  <p className="text-sm text-muted-foreground">{teacher.leaveBalance.vacation}</p>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="performance">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span>Performance & Awards</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Last Review Date</p>
                <p className="text-sm text-muted-foreground">{teacher.performance.lastReviewDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Rating</p>
                <p className="text-sm text-muted-foreground">{teacher.performance.rating}/5</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Feedback</p>
              <p className="text-sm text-muted-foreground">{teacher.performance.feedback}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Awards & Recognition</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {teacher.performance.awards.map((award: string, index: number) => (
                  <li key={index}>{award}</li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="emergency">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
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
    </>
  );
}

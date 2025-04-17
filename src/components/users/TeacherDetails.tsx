
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Teacher } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeacherDetailsProps {
  teacher: Teacher;
}

export function TeacherDetails({ teacher }: TeacherDetailsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const calculateAge = (dateOfBirth: string) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth));
  };

  return (
    <>
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

      <AccordionItem value="attendance">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Attendance & Leave Information</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d, yyyy")} -{" "}
                          {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Filter attendance by date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <h3 className="font-medium text-sm">Select date range</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose start and end dates to filter attendance records
                    </p>
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range)}
                    numberOfMonths={2}
                    className="p-3"
                  />
                  <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDateRange(undefined)}
                    >
                      Reset
                    </Button>
                    <Button size="sm">
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
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
    </>
  );
}

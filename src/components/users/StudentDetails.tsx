import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StudentDetail } from "@/types";
import { differenceInYears, parseISO } from "date-fns";
import { Book, Heart, User } from "lucide-react";
import { StudentAttendanceView } from "@/components/students/StudentAttendanceView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StudentDetailsProps {
  student: StudentDetail;
}

export function StudentDetails({ student }: StudentDetailsProps) {
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
                <p className="text-sm font-medium">Gender</p>
                <p className="text-sm text-muted-foreground">{student.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {student.dateOfBirth} ({calculateAge(student.dateOfBirth)} years)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Nationality</p>
                <p className="text-sm text-muted-foreground">{student.nationality}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-sm text-muted-foreground">{student.language}</p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm font-medium">Guardian Details</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{student.guardian.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{student.guardian.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{student.guardian.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Relationship</p>
                  <p className="text-sm text-muted-foreground">{student.guardian.relationship}</p>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="academic">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span>Academic Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4">
            {student.academicResults && student.academicResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam/Test</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.academicResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.examName}</TableCell>
                      <TableCell>{result.subject}</TableCell>
                      <TableCell>{result.marks}/{result.maxMarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">No academic records found</p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="attendance">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Attendance Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4">
            <StudentAttendanceView studentId={student.id} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="medical">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Medical Details</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div>
              <p className="text-sm font-medium">Blood Group</p>
              <p className="text-sm text-muted-foreground">{student.medical.bloodGroup || "Not specified"}</p>
            </div>
            {student.medical.allergies && student.medical.allergies.length > 0 && (
              <div>
                <p className="text-sm font-medium">Allergies</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {student.medical.allergies.map((allergy, index) => (
                    <li key={index}>{allergy}</li>
                  ))}
                </ul>
              </div>
            )}
            {student.medical.medications && student.medical.medications.length > 0 && (
              <div>
                <p className="text-sm font-medium">Current Medications</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {student.medical.medications.map((medication, index) => (
                    <li key={index}>{medication}</li>
                  ))}
                </ul>
              </div>
            )}
            {student.medical.medicalHistory && (
              <div>
                <p className="text-sm font-medium">Medical History</p>
                <p className="text-sm text-muted-foreground">{student.medical.medicalHistory}</p>
              </div>
            )}
            {student.medical.emergencyContact && (
              <div>
                <p className="text-sm font-medium">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{student.medical.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{student.medical.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Relationship</p>
                    <p className="text-sm text-muted-foreground">{student.medical.emergencyContact.relationship}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentDetail } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StudentDetails } from "./StudentDetails";
import { mockStudents } from "@/mocks/data";

export function StudentTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.admissionNumber}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>Grade 1</TableCell>
              <TableCell>Section A</TableCell>
              <TableCell className="w-1/2">
                <Accordion type="single" collapsible>
                  <StudentDetails student={student as StudentDetail} />
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

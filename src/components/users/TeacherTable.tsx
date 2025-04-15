
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Accordion } from "@/components/ui/accordion";
import { TeacherDetails } from "./TeacherDetails";
import { mockTeachers } from "@/mocks/data";

export function TeacherTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTeachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.professionalDetails.employeeId}</TableCell>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.professionalDetails.department}</TableCell>
              <TableCell>{teacher.professionalDetails.designation}</TableCell>
              <TableCell className="w-1/2">
                <Accordion type="single" collapsible>
                  <TeacherDetails teacher={teacher} />
                </Accordion>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

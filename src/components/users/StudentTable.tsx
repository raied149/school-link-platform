import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentDetail } from "@/types";
import { Accordion } from "@/components/ui/accordion";
import { StudentDetails } from "./StudentDetails";
import { mockStudents } from "@/mocks/data";
import { useMemo } from "react";

interface StudentTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
}

export function StudentTable({ searchFilters }: StudentTableProps) {
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      if (searchFilters.idSearch && !student.admissionNumber.toLowerCase().includes(searchFilters.idSearch.toLowerCase())) {
        return false;
      }
      if (searchFilters.nameSearch && !student.name.toLowerCase().includes(searchFilters.nameSearch.toLowerCase())) {
        return false;
      }
      
      if (searchFilters.globalSearch) {
        const searchTerm = searchFilters.globalSearch.toLowerCase();
        const searchableString = JSON.stringify(student).toLowerCase();
        return searchableString.includes(searchTerm);
      }
      
      return true;
    });
  }, [searchFilters]);

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
          {filteredStudents.map((student) => (
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


import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { Teacher } from "@/types";

interface TeacherSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (teacher: Teacher) => void;
}

export function TeacherSelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: TeacherSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for now - this would be replaced with actual teacher data
  const mockTeachers: Teacher[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      professionalDetails: {
        employeeId: "T001",
        subjects: ["Mathematics"],
        designation: "Senior Teacher",
        department: "Mathematics",
        classesAssigned: [],
        joiningDate: "2024-01-01",
        employmentType: "Full-time",
        qualifications: []
      }
    } as Teacher,
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      professionalDetails: {
        employeeId: "T002",
        subjects: ["Science"],
        designation: "Teacher",
        department: "Science",
        classesAssigned: [],
        joiningDate: "2023-06-15",
        employmentType: "Full-time",
        qualifications: []
      }
    } as Teacher,
    {
      id: "3",
      firstName: "Michael",
      lastName: "Johnson",
      professionalDetails: {
        employeeId: "T003",
        subjects: ["English"],
        designation: "Teacher",
        department: "Languages",
        classesAssigned: [],
        joiningDate: "2023-09-01",
        employmentType: "Part-time",
        qualifications: []
      }
    } as Teacher,
    // Add more mock teachers as needed
  ];
  
  const filteredTeachers = mockTeachers.filter(teacher => 
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.professionalDetails.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.professionalDetails.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Homeroom Teacher</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by teacher ID, name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 px-4">Teacher ID</th>
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-left py-2 px-4">Subject</th>
                <th className="text-right py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-4">{teacher.professionalDetails.employeeId}</td>
                  <td className="py-2 px-4">{`${teacher.firstName} ${teacher.lastName}`}</td>
                  <td className="py-2 px-4">{teacher.professionalDetails.subjects.join(", ")}</td>
                  <td className="py-2 px-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onSelect(teacher);
                        onOpenChange(false);
                      }}
                    >
                      Select
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

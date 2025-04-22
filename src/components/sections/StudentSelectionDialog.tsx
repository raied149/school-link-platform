
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { StudentDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface StudentSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (students: StudentDetail[]) => void;
  selectedStudents: StudentDetail[];
}

export function StudentSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  selectedStudents,
}: StudentSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedStudents, setLocalSelectedStudents] = useState<StudentDetail[]>(selectedStudents);
  
  // Mock data for now - this would be replaced with actual student data
  const mockStudents: StudentDetail[] = [
    {
      id: "1",
      name: "Alice Smith",
      admissionNumber: "S001",
      email: "alice@school.com",
      dateOfBirth: "2010-01-01",
      gender: "female",
      nationality: "US",
      language: "English",
      guardian: {
        name: "John Smith",
        email: "john@example.com",
        phone: "1234567890",
        relationship: "Father"
      },
      medical: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Bob Johnson",
      admissionNumber: "S002",
      email: "bob@school.com",
      dateOfBirth: "2010-03-15",
      gender: "male",
      nationality: "US",
      language: "English",
      guardian: {
        name: "Mary Johnson",
        email: "mary@example.com",
        phone: "0987654321",
        relationship: "Mother"
      },
      medical: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "Charlie Brown",
      admissionNumber: "S003",
      email: "charlie@school.com",
      dateOfBirth: "2010-05-22",
      gender: "male",
      nationality: "US",
      language: "English",
      guardian: {
        name: "Lucy Brown",
        email: "lucy@example.com",
        phone: "1122334455",
        relationship: "Mother"
      },
      medical: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // Add more mock students as needed
  ];

  const filteredStudents = mockStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (student: StudentDetail) => {
    const isSelected = localSelectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setLocalSelectedStudents(localSelectedStudents.filter(s => s.id !== student.id));
    } else {
      setLocalSelectedStudents([...localSelectedStudents, student]);
    }
  };

  const handleSave = () => {
    onSelect(localSelectedStudents);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Students</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Students:</div>
          <div className="flex flex-wrap gap-2">
            {localSelectedStudents.map((student) => (
              <Badge key={student.id} variant="secondary">
                {student.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b">
                <th className="text-left py-2 px-4">Student ID</th>
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-center py-2 px-4">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isSelected = localSelectedStudents.some(s => s.id === student.id);
                return (
                  <tr key={student.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{student.admissionNumber}</td>
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleStudent(student)}
                      />
                    </td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

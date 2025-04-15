
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Subject, Teacher, TeacherAssignment } from "@/types";

interface SubjectTeacherAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  sectionId?: string;
  academicYearId?: string;
}

// Mock teacher data - in a real app, you'd fetch this from a service
const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@school.com",
    role: "teacher",
    firstName: "John",
    lastName: "Smith",
    gender: "male",
    dateOfBirth: "1980-01-01",
    nationality: "USA",
    contactInformation: {
      currentAddress: "123 Main St",
      personalPhone: "123-456-7890",
      personalEmail: "john@school.com",
      schoolEmail: "john.smith@school.com",
    },
    professionalDetails: {
      employeeId: "T001",
      designation: "Senior Teacher",
      department: "Mathematics",
      subjects: ["Mathematics"],
      classesAssigned: ["10", "11"],
      joiningDate: "2019-01-01",
      qualifications: ["M.Sc Mathematics"],
      employmentType: "Full-time",
    },
    attendance: {
      present: 90,
      absent: 5,
      leave: 5,
    },
    leaveBalance: {
      sick: 10,
      casual: 5,
      vacation: 15,
    },
    emergency: {
      contactName: "Jane Smith",
      relationship: "Spouse",
      phone: "123-456-7891",
    },
    createdAt: "2019-01-01",
    updatedAt: "2022-01-01",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@school.com",
    role: "teacher",
    firstName: "Sarah",
    lastName: "Johnson",
    gender: "female",
    dateOfBirth: "1985-05-15",
    nationality: "USA",
    contactInformation: {
      currentAddress: "456 Oak St",
      personalPhone: "123-456-7892",
      personalEmail: "sarah@school.com",
      schoolEmail: "sarah.johnson@school.com",
    },
    professionalDetails: {
      employeeId: "T002",
      designation: "Teacher",
      department: "Science",
      subjects: ["Physics", "Chemistry"],
      classesAssigned: ["9", "10"],
      joiningDate: "2020-01-01",
      qualifications: ["M.Sc Physics"],
      employmentType: "Full-time",
    },
    attendance: {
      present: 85,
      absent: 10,
      leave: 5,
    },
    leaveBalance: {
      sick: 8,
      casual: 5,
      vacation: 15,
    },
    emergency: {
      contactName: "Mike Johnson",
      relationship: "Spouse",
      phone: "123-456-7893",
    },
    createdAt: "2020-01-01",
    updatedAt: "2022-01-01",
  },
];

export function SubjectTeacherAssignment({
  open,
  onOpenChange,
  subject,
  sectionId,
  academicYearId,
}: SubjectTeacherAssignmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // In a real app, fetch teachers from API
  const { data: teachers = mockTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => Promise.resolve(mockTeachers),
  });

  // Reset selected teacher when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTeacherId("");
    }
  }, [open]);

  const handleAssign = () => {
    if (!selectedTeacherId || !subject || !sectionId || !academicYearId) {
      toast({
        title: "Error",
        description: "Please select a teacher to assign",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you'd send this to an API
    toast({
      title: "Teacher Assigned",
      description: `Teacher has been assigned to ${subject.name}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Assign Teacher to {subject?.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="teacher" className="text-sm font-medium">
              Select Teacher
            </label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} ({teacher.professionalDetails.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>
            Assign Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

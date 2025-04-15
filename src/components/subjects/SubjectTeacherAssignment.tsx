
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
    performance: {
      // Added missing field
      lastReviewDate: "2022-06-01",
      rating: 4.5,
      feedback: "Excellent teaching skills",
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
    performance: {
      // Added missing field
      lastReviewDate: "2022-05-15",
      rating: 4.2,
      feedback: "Great classroom management",
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

// Mock assignments data - in a real app, this would be stored in a database
const mockAssignments: TeacherAssignment[] = [];

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

  // Get existing assignment if any
  const { data: currentAssignment } = useQuery({
    queryKey: ['teacherAssignment', subject?.id, sectionId],
    queryFn: () => {
      return Promise.resolve(
        mockAssignments.find(
          a => a.subjectId === subject?.id && a.sectionId === sectionId
        )
      );
    },
    enabled: !!subject && !!sectionId,
  });

  // Reset selected teacher when dialog opens or when there's an existing assignment
  useEffect(() => {
    if (open) {
      setSelectedTeacherId(currentAssignment?.teacherId || "");
    }
  }, [open, currentAssignment]);

  // Filter teachers by subject expertise
  const eligibleTeachers = teachers.filter(teacher => 
    teacher.professionalDetails.subjects.some(s => 
      s.toLowerCase() === subject?.name.toLowerCase()
    )
  );

  // Create or update assignment mutation
  const assignMutation = useMutation({
    mutationFn: (data: Omit<TeacherAssignment, 'id' | 'createdAt' | 'updatedAt'>) => {
      // In a real app, this would call an API
      const existingIndex = mockAssignments.findIndex(
        a => a.subjectId === data.subjectId && a.sectionId === data.sectionId
      );
      
      if (existingIndex !== -1) {
        // Update existing assignment
        mockAssignments[existingIndex] = {
          ...mockAssignments[existingIndex],
          teacherId: data.teacherId,
          updatedAt: new Date().toISOString(),
        };
        return Promise.resolve(mockAssignments[existingIndex]);
      } else {
        // Create new assignment
        const newAssignment: TeacherAssignment = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockAssignments.push(newAssignment);
        return Promise.resolve(newAssignment);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherAssignment'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Teacher Assigned",
        description: `Teacher has been assigned to ${subject?.name}`,
      });
      onOpenChange(false);
    },
  });

  const handleAssign = () => {
    if (!selectedTeacherId || !subject || !sectionId || !academicYearId) {
      toast({
        title: "Error",
        description: "Please select a teacher to assign",
        variant: "destructive",
      });
      return;
    }

    assignMutation.mutate({
      teacherId: selectedTeacherId,
      subjectId: subject.id,
      sectionId: sectionId,
      academicYearId: academicYearId,
    });
  };

  const getAssignedTeacher = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Assign Teacher to {subject?.name}
          </DialogTitle>
          <DialogDescription>
            Select a teacher who specializes in this subject area
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {currentAssignment && (
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="font-medium">Currently Assigned:</p>
              <p className="text-sm">
                {getAssignedTeacher(currentAssignment.teacherId)?.firstName} 
                {" "}
                {getAssignedTeacher(currentAssignment.teacherId)?.lastName}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="teacher" className="text-sm font-medium">
              {currentAssignment ? "Reassign Teacher" : "Select Teacher"}
            </label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {eligibleTeachers.length > 0 ? (
                  eligibleTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName} ({teacher.professionalDetails.department})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">
                    No eligible teachers found for this subject
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {eligibleTeachers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                There are no teachers who specialize in this subject. You may need to update teacher profiles.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedTeacherId || assignMutation.isPending}>
            {assignMutation.isPending ? "Assigning..." : "Assign Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

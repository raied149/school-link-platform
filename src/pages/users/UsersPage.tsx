
import { Card } from "@/components/ui/card";
import { UserTabs } from "@/components/users/UserTabs";
import { useState } from "react";
import { AddStudentDialog } from "@/components/users/AddStudentDialog";
import { ImportStudentsDialog } from "@/components/users/ImportStudentsDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Import } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UsersPage = () => {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        {!isTeacher && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Import className="mr-2 h-4 w-4" />
              Import from Excel
            </Button>
            <Button onClick={() => setIsAddStudentOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <p className="text-muted-foreground">
            {isTeacher 
              ? "View student information and records" 
              : "Manage student information and records"}
          </p>
        </div>

        <UserTabs 
          defaultTab="students" 
          showStudentsOnly={true} 
          isTeacherView={isTeacher}
        />
      </Card>

      {!isTeacher && (
        <>
          <AddStudentDialog 
            open={isAddStudentOpen}
            onOpenChange={setIsAddStudentOpen}
          />
          <ImportStudentsDialog 
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default UsersPage;

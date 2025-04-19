
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserTabs } from "@/components/users/UserTabs";
import { useState } from "react";
import { AddStudentDialog } from "@/components/users/AddStudentDialog";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <Button onClick={() => setIsAddStudentOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <p className="text-muted-foreground">
            Manage student information and records
          </p>
        </div>

        <UserTabs defaultTab="students" showStudentsOnly={true} />
      </Card>

      <AddStudentDialog 
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
      />
    </div>
  );
};

export default UsersPage;

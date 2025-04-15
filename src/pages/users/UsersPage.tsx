
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UserTabs } from "@/components/users/UserTabs";

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">All Students</h2>
          <p className="text-muted-foreground">
            Manage and view all student details
          </p>
        </div>

        <UserTabs />
      </Card>
    </div>
  );
};

export default UsersPage;

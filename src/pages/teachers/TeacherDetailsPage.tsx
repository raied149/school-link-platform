
import { Card } from "@/components/ui/card";
import { UserTabs } from "@/components/users/UserTabs";

const TeacherDetailsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Teacher Details</h2>
          <p className="text-muted-foreground">
            Manage and view teacher information
          </p>
        </div>

        <UserTabs defaultTab="teachers" showTeachersOnly={true} />
      </Card>
    </div>
  );
};

export default TeacherDetailsPage;

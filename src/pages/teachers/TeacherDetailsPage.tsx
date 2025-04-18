
import { Card } from "@/components/ui/card";
import { UserTabs } from "@/components/users/UserTabs";
import { TeacherPageHeader } from "@/components/teachers/TeacherPageHeader";

const TeacherDetailsPage = () => {
  return (
    <div className="space-y-6">
      <TeacherPageHeader />

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

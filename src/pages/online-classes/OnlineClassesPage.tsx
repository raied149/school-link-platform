
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnlineClassFormDialog } from "@/components/online-classes/OnlineClassFormDialog";
import { onlineClassService } from "@/services/online-classes";
import { OnlineClassList } from "@/components/online-classes/OnlineClassList";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const OnlineClassesPage = () => {
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  // Get the user's classes (all for admin/teacher, filtered for student)
  const { data: classes, isLoading, error, refetch } = useQuery({
    queryKey: ["online-classes"],
    queryFn: () => {
      if (isStudent) {
        // For students, only fetch classes they're enrolled in
        return onlineClassService.getClassesForStudent(user?.id || "");
      } else {
        // For teachers and admins, fetch all classes
        return onlineClassService.getAllClasses();
      }
    },
  });

  // Refresh the class list when dialog closes with success
  const handleDialogOpenChange = (open: boolean, success?: boolean) => {
    setOpenScheduleDialog(open);
    if (!open && success) {
      refetch();
    }
  };

  useEffect(() => {
    // Initial fetch
    refetch();
  }, [refetch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Online Classes
        </h1>
        {!isStudent && (
          <Button onClick={() => setOpenScheduleDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Class
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Available Online Classes</h2>
          <p className="text-muted-foreground">
            {isStudent 
              ? "View your scheduled online classes" 
              : "View and manage online class schedules"}
          </p>
        </div>

        <OnlineClassList 
          classes={classes || []} 
          isLoading={isLoading} 
          onRefresh={refetch}
          isStudentView={isStudent}
        />
      </Card>

      {!isStudent && (
        <OnlineClassFormDialog
          open={openScheduleDialog}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </div>
  );
};

export default OnlineClassesPage;

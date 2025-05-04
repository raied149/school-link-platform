
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";
import { Video, Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OnlineClassFormDialog } from "@/components/online-classes/OnlineClassFormDialog";
import { OnlineClassList } from "@/components/online-classes/OnlineClassList";
import { onlineClassService } from "@/services/onlineClassService";
import { useAuth } from "@/contexts/AuthContext";
import { DateSelector } from "@/components/attendance/DateSelector";
import { toast } from "sonner";

// Development UUID - matches our RLS policies (consistent with other files)
const DEV_USER_UUID = "00000000-0000-4000-a000-000000000000";

const OnlineClassesPage = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAll, setShowAll] = useState(true);
  const queryClient = useQueryClient();

  console.log("Current user:", user);

  // Query for fetching online classes
  const { data: classes = [], isLoading, isError, error } = useQuery({
    queryKey: ["online-classes", user?.id, user?.role],
    queryFn: () => {
      if (!user) {
        console.log("User not authenticated, showing empty classes list");
        return [];
      }
      console.log("Fetching online classes for user:", user.id, user.role);
      // We're now using a consistent user ID that works with our RLS policies
      return onlineClassService.getOnlineClassesForUser(DEV_USER_UUID, user.role);
    },
    enabled: !!user,
  });

  // Log the fetched classes for debugging
  console.log("Fetched online classes:", classes);

  // Handle errors from the query
  if (isError) {
    console.error("Error fetching online classes:", error);
    // Don't show toast here as it would appear on every render
  }

  // Mutation for deleting a class
  const deleteMutation = useMutation({
    mutationFn: onlineClassService.deleteOnlineClass,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["online-classes"] });
        toast.success("Class deleted successfully");
      } else {
        toast.error("Failed to delete class");
      }
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(`Failed to delete class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Filter classes based on selected date if not showing all
  const filteredClasses = showAll
    ? classes
    : classes.filter((cls) => 
        cls.date === format(startOfDay(selectedDate), "yyyy-MM-dd")
      );

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  const handleFormClose = (success: boolean = false) => {
    setIsFormOpen(false);
    
    // Force a refetch if the form was submitted successfully
    if (success) {
      console.log("Form closed with success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["online-classes"] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Online Classes</h1>
        <div className="flex gap-2">
          {isTeacherOrAdmin && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Class
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
            <Video className="h-5 w-5" />
            Online Classes Schedule
          </h2>
          <p className="text-muted-foreground">
            View and join online classes scheduled for you
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={showAll ? "default" : "outline"}
              onClick={() => setShowAll(true)}
            >
              All Classes
            </Button>
            <Button
              variant={!showAll ? "default" : "outline"}
              onClick={() => setShowAll(false)}
            >
              By Date
            </Button>
          </div>

          {!showAll && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Select Date:</span>
              <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
            </div>
          )}
        </div>

        <OnlineClassList
          classes={filteredClasses}
          isLoading={isLoading}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </Card>

      <OnlineClassFormDialog 
        open={isFormOpen} 
        onOpenChange={handleFormClose} 
      />
    </div>
  );
};

export default OnlineClassesPage;

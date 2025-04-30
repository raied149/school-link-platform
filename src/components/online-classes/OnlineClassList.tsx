
import { useAuth } from "@/contexts/AuthContext";
import { OnlineClassWithDetails } from "@/services/onlineClassService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Link, Video, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OnlineClassListProps {
  classes: OnlineClassWithDetails[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export function OnlineClassList({ classes, isLoading, onDelete }: OnlineClassListProps) {
  const { user } = useAuth();
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
      setClassToDelete(null);
    }
  };

  const groupedByDate = classes.reduce(
    (acc, cls) => {
      const date = cls.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(cls);
      return acc;
    },
    {} as Record<string, OnlineClassWithDetails[]>
  );

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>Loading online classes...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Video className="h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No online classes found</h3>
        <p className="text-muted-foreground">
          There are no scheduled online classes yet.
        </p>
      </div>
    );
  }

  const isOwner = (createdBy: string) => user?.id === createdBy;
  const isTeacher = user?.role === "teacher";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {format(new Date(date), "EEEE, MMMM d, yyyy")}
            </h3>
            <Badge>
              {groupedByDate[date].length} {groupedByDate[date].length === 1 ? "class" : "classes"}
            </Badge>
          </div>

          <div className="space-y-4">
            {groupedByDate[date]
              .sort(
                (a, b) =>
                  new Date(`2000-01-01T${a.start_time}`).getTime() -
                  new Date(`2000-01-01T${b.start_time}`).getTime()
              )
              .map((cls) => (
                <div
                  key={cls.id}
                  className="border rounded-lg p-4 hover:bg-accent/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {cls.title || `${cls.subject_name} - ${cls.section_name}`}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {cls.subject_name}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(`2000-01-01T${cls.start_time}`), "h:mm a")}
                            {cls.end_time &&
                              ` - ${format(
                                new Date(`2000-01-01T${cls.end_time}`),
                                "h:mm a"
                              )}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {cls.class_name} - {cls.section_name}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Created by {cls.teacher_name || "Unknown Teacher"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(cls.google_meet_link, "_blank")}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Class
                      </Button>
                      
                      {(isOwner(cls.created_by) || isAdmin) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setClassToDelete(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!classToDelete} 
        onOpenChange={(open) => !open && setClassToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Online Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this online class? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => classToDelete && handleDelete(classToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

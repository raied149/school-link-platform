
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { toast } from "sonner";
import { Video, ExternalLink, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { onlineClassService } from "@/services/online-classes";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useAuth } from "@/contexts/AuthContext";

interface OnlineClassListProps {
  classes: any[];
  isLoading: boolean;
  onRefresh: () => void;
  isStudentView?: boolean;
}

export function OnlineClassList({ 
  classes = [], 
  isLoading, 
  onRefresh,
  isStudentView = false
}: OnlineClassListProps) {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { user } = useAuth();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => onlineClassService.deleteOnlineClass(id),
    onSuccess: () => {
      toast.success("Online class deleted successfully");
      onRefresh();
    },
    onError: (error) => {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete online class");
    },
  });

  const handleDeleteClick = (classItem: any) => {
    setSelectedClass(classItem);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClass) {
      deleteMutation.mutate(selectedClass.id);
      setConfirmDialogOpen(false);
    }
  };

  const handleJoinClass = (meetLink: string) => {
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading classes...</div>;
  }

  if (!classes || classes.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No online classes scheduled
      </div>
    );
  }

  // Sort classes by date and time
  const sortedClasses = [...classes].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`);
    const dateB = new Date(`${b.date}T${b.start_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Group classes by date for better organization
  const classGroups = sortedClasses.reduce((groups: any, item: any) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(classGroups).map(([date, dateClasses]: [string, any]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-medium">
            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
            {isPast(parseISO(date)) ? (
              <Badge variant="outline" className="ml-2 bg-muted">
                Past
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                Upcoming
              </Badge>
            )}
          </h3>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dateClasses as any[]).map((classItem) => {
                  const classDate = parseISO(classItem.date);
                  const startTime = classItem.start_time;
                  const endTime = classItem.end_time;
                  const isUpcoming = isFuture(
                    new Date(`${classItem.date}T${classItem.start_time}`)
                  );

                  // Get subject, class and teacher info
                  const subjectName = classItem.subjects?.name || "Unknown Subject";
                  const className = classItem.classes?.name || "Unknown Class";
                  const sectionName = classItem.sections?.name || "";
                  const teacherName = 
                    classItem.profiles?.first_name && classItem.profiles?.last_name
                      ? `${classItem.profiles.first_name} ${classItem.profiles.last_name}`
                      : "Unknown Teacher";

                  return (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{subjectName}</TableCell>
                      <TableCell>
                        {className} {sectionName && `- ${sectionName}`}
                      </TableCell>
                      <TableCell>
                        {startTime && endTime
                          ? `${startTime} - ${endTime}`
                          : startTime || "Not specified"}
                      </TableCell>
                      <TableCell>{teacherName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinClass(classItem.google_meet_link)}
                            disabled={!isUpcoming}
                          >
                            {isUpcoming ? (
                              <>
                                <Video className="mr-2 h-4 w-4" />
                                Join
                              </>
                            ) : (
                              <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Link
                              </>
                            )}
                          </Button>
                          
                          {!isStudentView && user?.role !== 'student' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(classItem)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Online Class"
        description="Are you sure you want to delete this online class? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
}

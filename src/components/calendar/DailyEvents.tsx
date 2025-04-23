
import { SchoolEvent } from "@/types";
import { format } from "date-fns";
import { CalendarClock, Users, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DailyEventsProps {
  date: Date;
  events: SchoolEvent[];
  isLoading: boolean;
}

export function DailyEvents({ date, events, isLoading }: DailyEventsProps) {
  if (isLoading) {
    return <div className="text-center p-4">Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Events for {format(date, "MMMM d, yyyy")}
      </h3>
      {events.length === 0 ? (
        <p className="text-muted-foreground">No events scheduled for this day</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.name}</h4>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {event.type}
                  </span>
                </div>
                {(event.startTime || event.endTime) && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {event.teacherIds && event.teacherIds.length > 0 && (
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{event.teacherIds.length} teachers assigned</span>
                    </div>
                  )}
                  {event.reminderSet && event.reminderTimes && (
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>
                        {event.reminderTimes.length > 1 
                          ? `${event.reminderTimes.length} reminders set` 
                          : `Reminder set for ${format(new Date(event.reminderTimes[0]), "MMM d")}`}
                      </span>
                    </div>
                  )}
                </div>
                {event.createdAt && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Added {format(new Date(event.createdAt), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { SchoolEvent } from "@/types";
import { EventDescription } from "./EventDescription";
import { EventFormHeader } from "./EventFormHeader";
import { Task } from "@/services/taskService";

interface DailyEventsProps {
  date: Date;
  events: SchoolEvent[];
  isLoading: boolean;
  onDelete: (eventId: string) => void;
  onUpdate: (eventId: string, eventData: Partial<SchoolEvent>) => void;
  tasks?: Task[];
  onTaskStatusChange?: (taskId: string, status: Task['status']) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export function DailyEvents({ 
  date, 
  events, 
  isLoading, 
  onDelete, 
  onUpdate, 
  tasks = [],
  onTaskStatusChange,
  onTaskEdit,
  onTaskDelete
}: DailyEventsProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const formattedDate = format(date, "MMMM d, yyyy");
  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <EventFormHeader date={date} formattedDate={formattedDate} isToday={isToday} />

      <div className="mt-4 space-y-4">
        {isLoading ? (
          <p>Loading events...</p>
        ) : events.length === 0 && tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No events scheduled for {formattedDate}.
          </div>
        ) : (
          <>
            {/* Regular calendar events */}
            {events.map(event => (
              <div key={event.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{event.name}</h3>
                      <Badge>{event.type}</Badge>
                    </div>
                    {(event.startTime || event.endTime) && (
                      <p className="text-sm text-muted-foreground">
                        {event.startTime && event.endTime 
                          ? `${event.startTime} - ${event.endTime}`
                          : event.startTime 
                            ? `Starts at ${event.startTime}`
                            : `Ends at ${event.endTime}`}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onUpdate(event.id, {})}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {event.description && (
                  <EventDescription
                    description={event.description}
                    isExpanded={expandedEvent === event.id}
                    onToggle={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  />
                )}
              </div>
            ))}
            
            {/* Tasks due on this date */}
            {tasks.map(task => (
              <div key={task.id} className={`border rounded-md p-4 ${task.status === 'completed' ? 'bg-green-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className="bg-blue-100">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {task.type}
                      </Badge>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                    {task.due_time && (
                      <p className="text-sm text-muted-foreground">
                        Due at {task.due_time}
                      </p>
                    )}
                    {task.description && (
                      <p className="text-sm mt-1">{task.description}</p>
                    )}
                  </div>
                  
                  {onTaskEdit && onTaskDelete && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => onTaskEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => onTaskDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {onTaskStatusChange && (
                  <div className="mt-2 flex gap-2">
                    {task.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-700"
                        onClick={() => onTaskStatusChange(task.id, 'completed')}
                      >
                        Mark as completed
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onTaskStatusChange(task.id, 'pending')}
                      >
                        Mark as pending
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

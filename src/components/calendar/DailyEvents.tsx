
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit, Trash2, CheckCircle, ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { EventFormHeader } from './EventFormHeader';
import { EventDescription } from './EventDescription';
import { SchoolEvent } from '@/types';
import { Task } from '@/services/taskService';
import { TaskItem } from '../tasks/TaskItem';

interface DailyEventsProps {
  date: Date;
  events: SchoolEvent[];
  tasks?: Task[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, eventData: Partial<SchoolEvent>) => void;
  onTaskStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: Task) => void;
}

export function DailyEvents({ 
  date, 
  events, 
  tasks = [], 
  isLoading,
  onDelete, 
  onUpdate,
  onTaskStatusChange,
  onTaskDelete,
  onTaskEdit
}: DailyEventsProps) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const isToday = formattedDate === format(new Date(), 'yyyy-MM-dd');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  
  const toggleEventDescription = (id: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Custom function to format event types for display
  const formatEventType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const eventTypeColors: Record<string, string> = {
    school_event: 'bg-blue-100 text-blue-800',
    holiday: 'bg-green-100 text-green-800',
    exam: 'bg-red-100 text-red-800',
    meeting: 'bg-purple-100 text-purple-800',
    reminder: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <EventFormHeader 
          date={date}
          formattedDate={format(date, 'MMMM d, yyyy')}
          isToday={isToday}
        />
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : events.length === 0 && tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No events or tasks scheduled for this day</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-4">
          {events.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" /> Events
              </h3>
              <div className="space-y-3">
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{event.name}</h4>
                            <Badge variant="outline" className={eventTypeColors[event.type] || 'bg-gray-100'}>
                              {formatEventType(event.type)}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                            {event.startTime && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                              </span>
                            )}
                          </div>
                          
                          {event.description && (
                            <EventDescription 
                              description={event.description}
                              isExpanded={!!expandedEvents[event.id]}
                              onToggle={() => toggleEventDescription(event.id)}
                            />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => onDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {tasks.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h3 className="font-medium mb-2 flex items-center">
                <ListTodo className="h-4 w-4 mr-1" /> Tasks
              </h3>
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={onTaskDelete || (() => {})}
                    onEdit={onTaskEdit || (() => {})}
                    onStatusChange={onTaskStatusChange || (() => {})}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

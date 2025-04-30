
import { Task } from "@/services/taskService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Check, Clock, Calendar, BookOpen, User, Users, GraduationCap } from "lucide-react";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  currentUserId?: string;
}

export function TaskItem({ task, onDelete, onEdit, onStatusChange, currentUserId }: TaskItemProps) {
  const isCreator = task.created_by === currentUserId;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };

  const typeIcons = {
    'personal': <User className="h-4 w-4 mr-1" />,
    'assignment': <BookOpen className="h-4 w-4 mr-1" />,
    'admin_task': <GraduationCap className="h-4 w-4 mr-1" />
  };

  return (
    <Card className={`${isOverdue ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <div className="flex flex-wrap gap-2 my-2">
              <Badge variant="outline" className="flex items-center">
                {typeIcons[task.type]}
                {task.type.charAt(0).toUpperCase() + task.type.slice(1).replace('_', ' ')}
              </Badge>
              
              <Badge variant="outline" className={`${statusColors[task.status]}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
              </Badge>
              
              {task.due_date && (
                <Badge variant={isOverdue ? "destructive" : "outline"} className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.due_date), "MMM d, yyyy")}
                </Badge>
              )}
              
              {task.due_time && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.due_time}
                </Badge>
              )}
              
              {task.subject_name && (
                <Badge variant="secondary" className="flex items-center">
                  {task.subject_name}
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              {task.assigned_to_user_name && (
                <div className="flex items-center gap-1 mb-1">
                  <User className="h-3 w-3" /> 
                  Assigned to: {task.assigned_to_user_name}
                </div>
              )}
              {task.assigned_to_section_name && (
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-3 w-3" /> 
                  Section: {task.assigned_to_section_name}
                </div>
              )}
              {task.assigned_to_class_name && (
                <div className="flex items-center gap-1 mb-1">
                  <GraduationCap className="h-3 w-3" /> 
                  Class: {task.assigned_to_class_name}
                </div>
              )}
              {task.google_drive_link && (
                <a 
                  href={task.google_drive_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View attachment
                </a>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCreator ? (
              <>
                <Button variant="outline" size="icon" onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-xs text-muted-foreground">
                By: {task.creator_name}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-2 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Created: {format(new Date(task.created_at), "MMM d, yyyy")}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm mr-2">Status:</span>
          <Select 
            value={task.status} 
            onValueChange={(value: Task['status']) => onStatusChange(task.id, value)}
          >
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
}

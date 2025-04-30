
import { useState } from "react";
import { Task } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}

export function TaskList({ tasks, onDelete, onEdit, onStatusChange }: TaskListProps) {
  const { user } = useAuth();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No tasks found. Create a new task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem 
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
          currentUserId={user?.id}
        />
      ))}
    </div>
  );
}

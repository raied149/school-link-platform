
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/contexts/AuthContext";
import { Task } from "@/services/taskService";

interface TaskBasicFieldsProps {
  register: any;
  errors: any;
  taskType: Task['type'];
  setTaskType: (value: Task['type']) => void;
  selectedSubjectId?: string;
  setSelectedSubjectId: (value: string | undefined) => void;
  subjects: any[];
  userRole?: UserRole;
}

export function TaskBasicFields({ 
  register, 
  errors, 
  taskType,
  setTaskType,
  selectedSubjectId,
  setSelectedSubjectId,
  subjects,
  userRole
}: TaskBasicFieldsProps) {
  // Determine available task types based on user role
  const availableTaskTypes = userRole === 'admin' 
    ? ['admin_task']
    : userRole === 'teacher'
      ? ['personal', 'assignment']
      : ['personal'];
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Enter task title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description (optional)"
          {...register("description")}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taskType">Task Type <span className="text-red-500">*</span></Label>
          <Select value={taskType} onValueChange={(value: any) => setTaskType(value)}>
            <SelectTrigger id="taskType">
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {availableTaskTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'personal' ? 'Personal Task' : 
                  type === 'assignment' ? 'Assignment' : 'Administrative Task'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject (Optional)</Label>
          <Select 
            value={selectedSubjectId || undefined} 
            onValueChange={setSelectedSubjectId}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No subject</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

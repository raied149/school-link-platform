
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Task } from "@/services/taskService";

interface TaskFormHeaderProps {
  task?: Task;
}

export function TaskFormHeader({ task }: TaskFormHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
      <DialogDescription>
        {task 
          ? "Update task details below." 
          : "Create a new task or assignment by filling out the details below."}
      </DialogDescription>
    </DialogHeader>
  );
}

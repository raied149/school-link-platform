
import { Task, CreateTaskInput, UpdateTaskInput, DEFAULT_USER_ID } from "./types";
import { createTask } from "./createTask";
import { getTasksForUser } from "./getTasksForUser";
import { updateTask } from "./updateTask";
import { deleteTask } from "./deleteTask";

export { DEFAULT_USER_ID };
export type { Task, CreateTaskInput, UpdateTaskInput };

export const taskService = {
  createTask,
  getTasksForUser,
  updateTask,
  deleteTask
};

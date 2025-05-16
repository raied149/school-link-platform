
import { Task, CreateTaskInput, UpdateTaskInput, DEFAULT_USER_ID } from "./taskService/types";
import { createTask } from "./taskService/createTask";
import { getTasksForUser } from "./taskService/getTasksForUser";
import { updateTask } from "./taskService/updateTask";
import { deleteTask } from "./taskService/deleteTask";

export { DEFAULT_USER_ID };
export type { Task, CreateTaskInput, UpdateTaskInput };

export const taskService = {
  createTask,
  getTasksForUser,
  updateTask,
  deleteTask
};

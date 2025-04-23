
import { z } from "zod";
import { validateHour, validateMinute } from "@/utils/timeUtils";

export const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  type: z.enum(["meeting", "function", "holiday"] as const),
  date: z.string(),
  startHour: z.string().refine(validateHour, { message: "Invalid hour (1-12)" }),
  startMinute: z.string().refine(validateMinute, { message: "Invalid minute (0-59)" }),
  startPeriod: z.enum(['AM', 'PM']),
  endHour: z.string().refine(validateHour, { message: "Invalid hour (1-12)" }),
  endMinute: z.string().refine(validateMinute, { message: "Invalid minute (0-59)" }),
  endPeriod: z.enum(['AM', 'PM']),
  description: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
  reminderSet: z.boolean().default(false),
  reminderDates: z.array(z.string()).optional(),
});

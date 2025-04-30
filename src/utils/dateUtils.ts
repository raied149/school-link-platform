
import { format, parse } from 'date-fns';
import { WeekDay } from '@/types/timetable';

/**
 * Formats a time string to a more readable format
 * @param timeString Time string in the format "HH:MM"
 * @returns Formatted time string (e.g., "1:30 PM")
 */
export const formatTimeDisplay = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = parse(`${hours}:${minutes}`, 'HH:mm', new Date());
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Maps a day number (0-6, Sunday to Saturday) to a WeekDay type
 * @param dayNumber Day number (0-6)
 * @returns WeekDay string
 */
export const mapNumberToWeekDay = (dayNumber: number): WeekDay => {
  const days: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Monday';
};

/**
 * Maps a WeekDay to a day number (0-6, Sunday to Saturday)
 * @param day WeekDay string
 * @returns Day number (0-6)
 */
export const mapWeekDayToNumber = (day: WeekDay): number => {
  const days: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
};

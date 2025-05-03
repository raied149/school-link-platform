
import { WeekDay } from '@/types/timetable';

/**
 * Maps a day number (0-6, Sunday to Saturday) to a day name
 * @param dayNumber Day number (0-6)
 * @returns Day name
 */
export const mapNumberToDay = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Ensure the day number is between 0 and 6
  const normalizedDayNumber = ((dayNumber % 7) + 7) % 7;
  return days[normalizedDayNumber];
};

/**
 * Maps a day name to a day number (0-6, Sunday to Saturday)
 * @param day Day name
 * @returns Day number (0-6)
 */
export const mapDayToNumber = (day: string): number => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const index = days.findIndex(d => d === day);
  return index !== -1 ? index : 0; // Default to Sunday if not found
};

/**
 * Formats a time string to a more readable format
 * @param timeString Time string in the format "HH:MM"
 * @returns Formatted time string (e.g., "1:30 PM")
 */
export const formatTimeDisplay = (timeString: string): string => {
  try {
    if (!isValidTimeFormat(timeString)) {
      return 'Invalid Time';
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Validates if a string is in the HH:MM format
 * @param timeString Time string to validate
 * @returns Boolean indicating if the format is valid
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  if (!timeString || typeof timeString !== 'string') return false;
  
  // Check if the time string matches the HH:MM pattern
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
};

/**
 * Converts time string to minutes since midnight
 * @param timeString Time string in the format "HH:MM"
 * @returns Minutes since midnight
 */
export const timeToMinutes = (timeString: string): number => {
  if (!isValidTimeFormat(timeString)) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Normalizes a time string to HH:MM format
 * @param timeString Time string in various formats
 * @returns Normalized time string in HH:MM format, or null if invalid
 */
export const normalizeTimeString = (timeString: string): string | null => {
  try {
    if (!timeString) return null;
    
    // If already in correct format, return it
    if (isValidTimeFormat(timeString)) {
      return timeString;
    }
    
    // Try to parse different time formats
    let hours = 0;
    let minutes = 0;
    
    // Format: 1:30 PM, 1:30 pm, etc.
    const amPmMatch = timeString.match(/(\d+):(\d+)\s*(am|pm|AM|PM)/i);
    if (amPmMatch) {
      hours = parseInt(amPmMatch[1], 10);
      minutes = parseInt(amPmMatch[2], 10);
      const isPm = amPmMatch[3].toLowerCase() === 'pm';
      
      if (isPm && hours !== 12) {
        hours += 12;
      } else if (!isPm && hours === 12) {
        hours = 0;
      }
    } else {
      // Format: HH:MM (24-hour)
      const timeMatch = timeString.match(/(\d+):(\d+)/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      } else {
        return null;
      }
    }
    
    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    
    // Format to HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error normalizing time string:', error);
    return null;
  }
};

/**
 * Formats hour and minute parts into a time string
 * @param hour Hour part (0-23)
 * @param minute Minute part (0-59)
 * @returns Time string in HH:MM format, or null if invalid
 */
export const formatTimeFromParts = (hour: string, minute: string): string | null => {
  try {
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    
    if (isNaN(hourNum) || isNaN(minuteNum) || 
        hourNum < 0 || hourNum > 23 || 
        minuteNum < 0 || minuteNum > 59) {
      return null;
    }
    
    return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time from parts:', error);
    return null;
  }
};

/**
 * Calculates end time based on start time and duration
 * @param startHour Start hour (0-23)
 * @param startMinute Start minute (0-59)
 * @param durationMinutes Duration in minutes
 * @returns End time in HH:MM format, or null if invalid
 */
export const calculateEndTime = (startHour: string, startMinute: string, durationMinutes: number): string => {
  try {
    const hourNum = parseInt(startHour, 10);
    const minuteNum = parseInt(startMinute, 10);
    
    if (isNaN(hourNum) || isNaN(minuteNum) || isNaN(durationMinutes) ||
        hourNum < 0 || hourNum > 23 || 
        minuteNum < 0 || minuteNum > 59 ||
        durationMinutes <= 0) {
      return 'Invalid Time';
    }
    
    // Calculate total minutes
    let totalMinutes = hourNum * 60 + minuteNum + durationMinutes;
    
    // Calculate end hour and minute
    const endHour = Math.floor(totalMinutes / 60) % 24; // Wrap around 24 hours
    const endMinute = totalMinutes % 60;
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error calculating end time:', error);
    return 'Invalid Time';
  }
};

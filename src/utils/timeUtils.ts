
import { format, isValid, parse, addMinutes } from 'date-fns';

// Generate time options for dropdowns
export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 1; hour <= 12; hour++) {
    for (let minute of [0, 30]) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      times.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return times;
};

// Format time for display - consistently display in 12-hour format
export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') {
    return '';
  }
  
  try {
    // If already in HH:mm format, parse and format
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      if (isValid(date)) {
        return format(date, 'h:mm a');
      }
    }
  } catch (error) {
    console.error("Error formatting time:", error);
  }
  
  return timeString; // Return original if we can't format it
};

export const convertTo24Hour = (time: string, period: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const convertTo12Hour = (time: string) => {
  if (!time || typeof time !== 'string' || !time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return { time: '00:00', period: 'AM' };
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  let period = 'AM';
  let hour12 = hours;

  if (hours >= 12) {
    period = 'PM';
    hour12 = hours === 12 ? 12 : hours - 12;
  } else if (hours === 0) {
    hour12 = 12;
  }

  return {
    time: `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    period
  };
};

export const validateHour = (hour: string): boolean => {
  const hourNum = parseInt(hour);
  return !isNaN(hourNum) && hourNum >= 0 && hourNum <= 23;
};

export const validateMinute = (minute: string): boolean => {
  const minuteNum = parseInt(minute);
  return !isNaN(minuteNum) && minuteNum >= 0 && minuteNum <= 59;
};

export const formatTimeFromParts = (hour: string, minute: string): string => {
  if (!hour || !minute) return '';
  
  const hourNum = parseInt(hour);
  const minuteNum = parseInt(minute);
  
  if (isNaN(hourNum) || isNaN(minuteNum) || 
      hourNum < 0 || hourNum > 23 || 
      minuteNum < 0 || minuteNum > 59) {
    return '';
  }
  
  return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
};

export const isValidTimeFormat = (timeString: string): boolean => {
  if (!timeString || typeof timeString !== 'string') return false;
  return !!timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
};

// Normalize time strings to standard 24-hour format (HH:MM)
export const normalizeTimeString = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') return '';
  
  // Already in HH:MM format
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Handle "8 AM" or similar format
  const match = timeString.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/i);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const isPM = match[3].toLowerCase() === 'pm';
    
    let hour24 = hours;
    if (isPM && hours < 12) hour24 = hours + 12;
    if (!isPM && hours === 12) hour24 = 0;
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Try to parse with date-fns as a last resort
  try {
    // Try some common formats
    const formats = ['h:mm a', 'h:mm aa', 'H:mm'];
    
    for (const formatStr of formats) {
      try {
        const parsedDate = parse(timeString, formatStr, new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, 'HH:mm');
        }
      } catch (e) {
        // Continue to the next format
      }
    }
  } catch (error) {
    console.error("Error normalizing time:", error);
  }
  
  return '';
};

// Calculate end time based on start time and duration
export const calculateEndTime = (startHour: string, startMinute: string, durationMinutes: number): string => {
  try {
    const timeString = formatTimeFromParts(startHour, startMinute);
    if (!timeString) return '';
    
    const startDate = parse(timeString, 'HH:mm', new Date());
    if (!startDate || isNaN(startDate.getTime())) return '';
    
    const endDate = addMinutes(startDate, durationMinutes);
    return format(endDate, 'HH:mm');
  } catch (error) {
    console.error("Error calculating end time:", error);
    return '';
  }
};

// Check if a time slot overlaps with any existing time slots
export const hasTimeConflict = (
  newStartTime: string, 
  newEndTime: string, 
  dayOfWeek: string,
  existingSlots: Array<{id?: string; startTime: string, endTime: string, dayOfWeek: string}>,
  currentSlotId?: string
): boolean => {
  // Normalize the new times
  const normalizedStart = normalizeTimeString(newStartTime);
  const normalizedEnd = normalizeTimeString(newEndTime);
  
  if (!normalizedStart || !normalizedEnd) return false;
  
  // Convert times to minutes for easier comparison
  const newStart = timeToMinutes(normalizedStart);
  const newEnd = timeToMinutes(normalizedEnd);
  
  return existingSlots.some(slot => {
    // Skip comparing with itself when editing
    if (currentSlotId && slot.id === currentSlotId) {
      return false;
    }
    
    // Only check slots on the same day
    if (slot.dayOfWeek !== dayOfWeek) {
      return false;
    }
    
    const slotStart = timeToMinutes(normalizeTimeString(slot.startTime));
    const slotEnd = timeToMinutes(normalizeTimeString(slot.endTime));
    
    // Check for overlap
    return (
      (newStart >= slotStart && newStart < slotEnd) || // New slot starts during existing slot
      (newEnd > slotStart && newEnd <= slotEnd) || // New slot ends during existing slot
      (newStart <= slotStart && newEnd >= slotEnd) // New slot completely contains existing slot
    );
  });
};

// Helper to convert "HH:MM" to minutes since midnight
export const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;
  
  const [hours, minutes] = time.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

// Map day of week string to database number (0-6 for Sunday-Saturday)
export const mapDayToNumber = (day: string): number => {
  const dayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };
  
  return dayMap[day] ?? 0;
};

// Map day of week number (0-6 for Sunday-Saturday) to string
export const mapNumberToDay = (dayNumber: number): string => {
  const dayMap: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  
  return dayMap[dayNumber] ?? 'Monday';
};

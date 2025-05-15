export const normalizeTimeString = (timeString?: string): string | null => {
  if (!timeString) return null;

  // If it's already in HH:MM:SS format, return it
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  // If it's in HH:MM format, add seconds
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return `${timeString}:00`;
  }

  // Try to parse numeric hour value (e.g. 9 => 09:00:00)
  const hourMatch = String(timeString).match(/^(\d{1,2})$/);
  if (hourMatch) {
    const hour = hourMatch[1].padStart(2, '0');
    return `${hour}:00:00`;
  }

  // Return null for invalid formats
  console.error("Invalid time format:", timeString);
  return null;
};

// Format time from hours and minutes
export const formatTimeFromParts = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate end time based on start time and duration
export const calculateEndTime = (startHour: string, startMinute: string, durationMinutes: number): string => {
  const hours = parseInt(startHour, 10);
  const minutes = parseInt(startMinute, 10);
  
  let totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return formatTimeFromParts(newHours, newMinutes);
};

export const mapDayToNumber = (day: string): number => {
  const dayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  return dayMap[day] ?? 0;
};

export const mapNumberToDay = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  if (dayNumber >= 0 && dayNumber < 7) {
    return days[dayNumber];
  }
  return 'Monday'; // Default to Monday if invalid
};

// Check if a string is a valid time format
export const isValidTimeFormat = (time?: string): boolean => {
  if (!time) return false;
  
  // Check HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  return timeRegex.test(time);
};

// Convert time string to minutes
export const timeToMinutes = (time: string): number => {
  const [hourStr, minuteStr] = time.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);
  
  return hours * 60 + minutes;
};

// Format time for display with better error handling
export const formatTimeDisplay = (timeString: string): string => {
  try {
    if (!isValidTimeFormat(timeString)) {
      return 'Invalid Time';
    }
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Validate hours and minutes
    if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
      return 'Invalid Time';
    }
    
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

// Safe date formatter that handles invalid dates
export const formatDateSafe = (dateString: string, formatPattern: string = 'MMM d, yyyy'): string => {
  try {
    if (!dateString) return 'No date';
    
    // Try to create a valid date object
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date using the built-in toLocaleDateString
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

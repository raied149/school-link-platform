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

// Add missing formatTimeFromParts function
export const formatTimeFromParts = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Add missing calculateEndTime function
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
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

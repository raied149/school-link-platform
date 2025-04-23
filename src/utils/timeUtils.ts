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

// Format time for display - keep in 24-hour HH:MM format
export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString || typeof timeString !== 'string') {
    return '';
  }
  
  // If already in HH:mm format, return as is
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return timeString;
  }
  
  return '';
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
  const match = timeString.match(/^(\d{1,2})\s*(am|pm)$/i);
  if (match) {
    const hours = parseInt(match[1]);
    const isPM = match[2].toLowerCase() === 'pm';
    
    let hour24 = hours;
    if (isPM && hours < 12) hour24 = hours + 12;
    if (!isPM && hours === 12) hour24 = 0;
    
    return `${hour24.toString().padStart(2, '0')}:00`;
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
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

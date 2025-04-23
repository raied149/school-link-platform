
import { format, isValid } from 'date-fns';

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

export const formatTimeDisplay = (timeString: string): string => {
  try {
    // Validate the timeString format
    if (!timeString || typeof timeString !== 'string' || !timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return 'Invalid Time';
    }
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    // Double-check if the date is valid before formatting
    if (!isValid(date)) {
      return 'Invalid Time';
    }
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error("Error formatting time:", timeString, error);
    return 'Invalid Time';
  }
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
  return !isNaN(hourNum) && hourNum >= 1 && hourNum <= 12;
};

export const validateMinute = (minute: string): boolean => {
  const minuteNum = parseInt(minute);
  return !isNaN(minuteNum) && minuteNum >= 0 && minuteNum <= 59;
};

export const formatTimeFromParts = (hour: string, minute: string): string => {
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

export const isValidTimeFormat = (timeString: string): boolean => {
  return !!timeString && typeof timeString === 'string' && !!timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
};

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

export const formatTimeDisplay = (time: string) => {
  return time;
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

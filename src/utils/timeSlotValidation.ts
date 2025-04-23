
import { TimeSlot } from '@/types/timetable';

export const validateTimeSlotConflict = (
  startTime: string,
  endTime: string,
  dayOfWeek: string,
  sectionId: string,
  existingSlots: TimeSlot[],
  currentSlotId?: string
): boolean => {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  return existingSlots.some(slot => {
    // Skip comparing with itself when editing
    if (currentSlotId && slot.id === currentSlotId) {
      return false;
    }

    // Only check slots on the same day and section
    if (slot.dayOfWeek !== dayOfWeek || slot.sectionId !== sectionId) {
      return false;
    }

    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    return (
      (newStart >= slotStart && newStart < slotEnd) || // New slot starts during existing slot
      (newEnd > slotStart && newEnd <= slotEnd) || // New slot ends during existing slot
      (newStart <= slotStart && newEnd >= slotEnd) // New slot completely contains existing slot
    );
  });
};


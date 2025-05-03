
import { TimeSlot } from '@/types/timetable';
import { timeToMinutes, normalizeTimeString } from '@/utils/timeUtils';

export const validateTimeSlotConflict = (
  startTime: string,
  endTime: string,
  dayOfWeek: string,
  sectionId: string,
  existingSlots: TimeSlot[],
  currentSlotId?: string
): boolean => {
  // Normalize the time strings first
  const normalizedStart = normalizeTimeString(startTime);
  const normalizedEnd = normalizeTimeString(endTime);
  
  if (!normalizedStart || !normalizedEnd) {
    console.error("Invalid time format:", { startTime, endTime });
    return false;
  }

  const newStart = timeToMinutes(normalizedStart);
  const newEnd = timeToMinutes(normalizedEnd);

  return existingSlots.some(slot => {
    // Skip comparing with itself when editing
    if (currentSlotId && slot.id === currentSlotId) {
      return false;
    }

    // Only check slots on the same day and section
    if (slot.dayOfWeek !== dayOfWeek || slot.sectionId !== sectionId) {
      return false;
    }

    // Normalize the existing slot times
    const normalizedSlotStart = normalizeTimeString(slot.startTime);
    const normalizedSlotEnd = normalizeTimeString(slot.endTime);
    
    if (!normalizedSlotStart || !normalizedSlotEnd) {
      return false;
    }

    const slotStart = timeToMinutes(normalizedSlotStart);
    const slotEnd = timeToMinutes(normalizedSlotEnd);

    return (
      (newStart >= slotStart && newStart < slotEnd) || // New slot starts during existing slot
      (newEnd > slotStart && newEnd <= slotEnd) || // New slot ends during existing slot
      (newStart <= slotStart && newEnd >= slotEnd) // New slot completely contains existing slot
    );
  });
};

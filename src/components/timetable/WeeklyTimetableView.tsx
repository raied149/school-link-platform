
import { useState } from 'react';
import { TimeSlot, WeekDay } from '@/types/timetable';
import { WeeklyView } from '@/components/timetable/WeeklyView';
import { formatTimeDisplay } from '@/utils/timeUtils';

interface WeeklyTimetableViewProps {
  timeSlots: TimeSlot[];
  isLoading: boolean;
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
  user?: { role?: string };
}

export function WeeklyTimetableView({
  timeSlots,
  isLoading,
  onEdit,
  onDelete,
  user
}: WeeklyTimetableViewProps) {
  const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Enhanced helper functions with better error handling
  const getSubjectName = (subjectId?: string) => {
    try {
      if (!subjectId) return 'Unspecified Subject';
      const slot = timeSlots.find(s => s.subjectId === subjectId);
      return slot?.title || 'Unknown Subject';
    } catch (error) {
      console.error('Error getting subject name:', error);
      return 'Error loading subject';
    }
  };

  const getClassName = (classId: string) => {
    try {
      return classId || 'Unspecified Class';
    } catch (error) {
      console.error('Error getting class name:', error);
      return 'Error loading class';
    }
  };

  const getSectionName = (sectionId: string) => {
    try {
      return sectionId || 'Unspecified Section';
    } catch (error) {
      console.error('Error getting section name:', error);
      return 'Error loading section';
    }
  };

  const getTeacherName = (teacherId?: string) => {
    try {
      return teacherId || 'Unassigned Teacher';
    } catch (error) {
      console.error('Error getting teacher name:', error);
      return 'Error loading teacher';
    }
  };

  return (
    <div className="space-y-4">
      <WeeklyView
        timeSlots={timeSlots}
        weekDays={weekDays}
        isLoading={isLoading}
        formatTime={formatTimeDisplay}
        getSubjectName={getSubjectName}
        getClassName={getClassName}
        getSectionName={getSectionName}
        getTeacherName={getTeacherName}
        user={user}
        showTeacher={false}
      />
    </div>
  );
}

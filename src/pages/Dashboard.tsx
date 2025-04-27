import { Users, Calendar, ClipboardList, BellRing, MessageSquare, CalendarDays, CalendarCheck } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker';
import { DailyEvents } from '@/components/calendar/DailyEvents';
import { EventForm } from '@/components/calendar/EventForm';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SchoolEvent, EventType } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Render different dashboards based on user role
  switch(user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <div>Please log in to view your dashboard.</div>;
  }
};

// Common calendar hook to share calendar functionality
const useCalendarEvents = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select(`
            *,
            calendar_event_teachers (
              teacher_id
            )
          `);
        
        if (error) throw error;
        
        return data.map(event => ({
          id: event.id,
          name: event.name,
          type: event.type as EventType,
          date: event.date,
          startTime: event.start_time,
          endTime: event.end_time,
          description: event.description,
          createdAt: event.created_at,
          reminderSet: event.reminder_set,
          reminderTimes: event.reminder_times,
          teacherIds: event.calendar_event_teachers?.map(t => t.teacher_id) || []
        }));
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        return [];
      }
    }
  });

  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const filteredEvents = events.filter(event => {
    if (event.date === formattedSelectedDate) return true;
    if (event.reminderSet && event.reminderTimes && event.reminderTimes.includes(formattedSelectedDate)) {
      return true;
    }
    return false;
  });

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error: teacherError } = await supabase
        .from('calendar_event_teachers')
        .delete()
        .eq('event_id', eventId);

      if (teacherError) throw teacherError;

      const { error: eventError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (eventError) throw eventError;

      toast.success('Event deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleUpdateEvent = async (eventId: string, eventData: Partial<SchoolEvent>) => {
    try {
      const { error: eventError } = await supabase
        .from('calendar_events')
        .update({
          name: eventData.name,
          type: eventData.type,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          description: eventData.description,
          reminder_set: eventData.reminderSet,
          reminder_times: eventData.reminderTimes,
        })
        .eq('id', eventId);

      if (eventError) throw eventError;

      if (eventData.teacherIds) {
        const { error: deleteError } = await supabase
          .from('calendar_event_teachers')
          .delete()
          .eq('event_id', eventId);

        if (deleteError) throw deleteError;

        const teacherAssignments = eventData.teacherIds.map(teacherId => ({
          event_id: eventId,
          teacher_id: teacherId,
        }));

        const { error: teacherError } = await supabase
          .from('calendar_event_teachers')
          .insert(teacherAssignments);

        if (teacherError) throw teacherError;
      }

      toast.success('Event updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleAddEvent = async () => {
    refetch();
  };

  return {
    selectedDate,
    setSelectedDate,
    events: filteredEvents,
    isLoading,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddEvent
  };
};

// Admin Dashboard
const AdminDashboard = () => {
  const {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddEvent
  } = useCalendarEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Student Attendance"
          value="95%"
          description="Average attendance rate"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Teacher Attendance"
          value="98%"
          description="Average attendance rate"
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Academic Year"
          value="2024-2025"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Today's Events"
          value="2"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]}
              onSubmit={handleAddEvent}
            />
          </div>
          <div className="flex justify-center sm:justify-start">
            <CalendarDatePicker 
              onSelect={(date) => date && setSelectedDate(date)}
              selected={selectedDate}
            />
          </div>
        </Card>
        <Card className="p-6">
          <DailyEvents
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

// Teacher Dashboard
const TeacherDashboard = () => {
  const {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddEvent
  } = useCalendarEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Attendance"
          value="98%"
          description="Present days this month"
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Student Attendance"
          value="95%"
          description="Average for your classes"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Today's Events"
          value="3"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]}
              onSubmit={handleAddEvent}
            />
          </div>
          <div className="flex justify-center sm:justify-start">
            <CalendarDatePicker 
              onSelect={(date) => date && setSelectedDate(date)}
              selected={selectedDate}
            />
          </div>
        </Card>
        <Card className="p-6">
          <DailyEvents
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

// Student Dashboard
const StudentDashboard = () => {
  const {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddEvent
  } = useCalendarEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Attendance"
          value="95%"
          description="Present days this month"
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Assignments Due"
          value="3"
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Notifications"
          value="2 New"
          icon={<BellRing className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]}
              onSubmit={handleAddEvent}
            />
          </div>
          <div className="flex justify-center sm:justify-start">
            <CalendarDatePicker 
              onSelect={(date) => date && setSelectedDate(date)}
              selected={selectedDate}
            />
          </div>
        </Card>
        <Card className="p-6">
          <DailyEvents
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

// Parent Dashboard
const ParentDashboard = () => {
  const {
    selectedDate,
    setSelectedDate,
    events,
    isLoading,
    handleDeleteEvent,
    handleUpdateEvent,
    handleAddEvent
  } = useCalendarEvents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Child's Attendance"
          value="95%"
          description="Present days this month"
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Upcoming Events"
          value="2"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Messages"
          value="1 New"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]}
              onSubmit={handleAddEvent}
            />
          </div>
          <div className="flex justify-center sm:justify-start">
            <CalendarDatePicker 
              onSelect={(date) => date && setSelectedDate(date)}
              selected={selectedDate}
            />
          </div>
        </Card>
        <Card className="p-6">
          <DailyEvents
            date={selectedDate}
            events={events}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

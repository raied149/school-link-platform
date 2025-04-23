
import { Users, Calendar, ClipboardList, BellRing, MessageSquare, CalendarDays, CalendarCheck } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker';
import { DailyEvents } from '@/components/calendar/DailyEvents';
import { useState } from 'react';
import { SchoolEvent } from '@/types';

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

// Admin Dashboard
const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState<SchoolEvent[]>([]); // In a real app, this would fetch from an API

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDate.toISOString().split('T')[0]
  );

  const handleDeleteEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

  const handleUpdateEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="text-muted-foreground">Browse and view school calendar</p>
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
            events={eventsForSelectedDate}
            isLoading={false}
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState<SchoolEvent[]>([]); // In a real app, this would fetch from an API

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDate.toISOString().split('T')[0]
  );

  const handleDeleteEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

  const handleUpdateEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="text-muted-foreground">Browse and view school calendar</p>
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
            events={eventsForSelectedDate}
            isLoading={false}
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState<SchoolEvent[]>([]); // In a real app, this would fetch from an API

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDate.toISOString().split('T')[0]
  );

  const handleDeleteEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

  const handleUpdateEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="text-muted-foreground">Browse and view school calendar</p>
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
            events={eventsForSelectedDate}
            isLoading={false}
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState<SchoolEvent[]>([]); // In a real app, this would fetch from an API

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDate.toISOString().split('T')[0]
  );

  const handleDeleteEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

  const handleUpdateEvent = async () => {
    // Placeholder function
    return Promise.resolve();
  };

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
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <p className="text-muted-foreground">Browse and view school calendar</p>
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
            events={eventsForSelectedDate}
            isLoading={false}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
          />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

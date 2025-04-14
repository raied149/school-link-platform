
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Classes"
          value="24"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Subjects"
          value="42"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Academic Year"
          value="2024-2025"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

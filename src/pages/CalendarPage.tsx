
import { Card } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/calendar/CalendarDatePicker";

const CalendarPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Calendar View</h2>
          <p className="text-muted-foreground">Browse and view school calendar</p>
        </div>
        
        <div className="flex justify-center sm:justify-start">
          <CalendarDatePicker />
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;

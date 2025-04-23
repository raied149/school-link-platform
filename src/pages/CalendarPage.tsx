
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDatePicker } from "@/components/calendar/CalendarDatePicker";
import { EventForm } from "@/components/calendar/EventForm";
import { DailyEvents } from "@/components/calendar/DailyEvents";
import { SchoolEvent } from "@/types";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  const handleAddEvent = (eventData: Omit<SchoolEvent, "id">) => {
    const newEvent: SchoolEvent = {
      ...eventData,
      id: crypto.randomUUID(),
    };
    setEvents([...events, newEvent]);
  };

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <p className="text-muted-foreground">Browse and view school calendar</p>
            </div>
            <EventForm 
              date={selectedDate}
              teachers={[]} // Pass actual teachers data here
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
            events={eventsForSelectedDate}
            isLoading={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;


import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import { GalleryEvent } from "@/types/gallery";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface GalleryEventListProps {
  events: GalleryEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: GalleryEvent) => void;
  onDeleteEvent: (event: GalleryEvent) => void;
}

export function GalleryEventList({ events, onAddEvent, onEditEvent, onDeleteEvent }: GalleryEventListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  const handleViewEvent = (eventId: string) => {
    navigate(`/gallery/${eventId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">School Gallery</h2>
        {isTeacherOrAdmin && (
          <Button onClick={onAddEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        )}
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No gallery events found</p>
          {isTeacherOrAdmin && (
            <Button variant="link" onClick={onAddEvent} className="mt-2">
              Add your first gallery event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.event_date), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {event.description || 'No description available.'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="secondary" size="sm" onClick={() => handleViewEvent(event.id)}>
                  View Details
                </Button>
                {isTeacherOrAdmin && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEditEvent(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteEvent(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

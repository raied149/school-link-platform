
import { useState, useEffect } from "react";
import { GalleryEventList } from "@/components/gallery/GalleryEventList";
import { fetchGalleryEvents, createGalleryEvent, updateGalleryEvent, deleteGalleryEvent } from "@/services/galleryService";
import { GalleryEvent } from "@/types/gallery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GalleryEventForm } from "@/components/gallery/GalleryEventForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GalleryPage() {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<GalleryEvent | undefined>(undefined);
  const [eventToDelete, setEventToDelete] = useState<GalleryEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGalleryEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load gallery events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setCurrentEvent(undefined);
    setFormOpen(true);
  };

  const handleEditEvent = (event: GalleryEvent) => {
    setCurrentEvent(event);
    setFormOpen(true);
  };

  const handleDeleteEvent = (event: GalleryEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleSubmitEvent = async (formValues: any) => {
    setIsSubmitting(true);
    try {
      if (currentEvent) {
        // Update existing event
        const success = await updateGalleryEvent(currentEvent.id, {
          title: formValues.title,
          description: formValues.description || null,
          event_date: formValues.event_date.toISOString().split('T')[0],
        });
        
        if (success) {
          toast.success("Gallery event updated successfully");
          loadEvents();
          setFormOpen(false);
        }
      } else {
        // Create new event
        const eventId = await createGalleryEvent({
          title: formValues.title,
          description: formValues.description || null,
          event_date: formValues.event_date.toISOString().split('T')[0],
        });
        
        if (eventId) {
          toast.success("Gallery event created successfully");
          loadEvents();
          setFormOpen(false);
        }
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      toast.error(currentEvent ? "Failed to update event" : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const success = await deleteGalleryEvent(eventToDelete.id);
      if (success) {
        toast.success("Gallery event deleted successfully");
        loadEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <GalleryEventList
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{currentEvent ? "Edit Gallery Event" : "Add Gallery Event"}</DialogTitle>
          </DialogHeader>
          <GalleryEventForm
            event={currentEvent}
            onSubmit={handleSubmitEvent}
            onCancel={() => setFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the gallery event
              "{eventToDelete?.title}" and all associated media files.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

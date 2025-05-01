
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchGalleryEventById, fetchGalleryMediaByEventId } from "@/services/galleryService";
import { GalleryEventDetails } from "@/components/gallery/GalleryEventDetails";
import { GalleryEvent, GalleryMedia } from "@/types/gallery";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function GalleryEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<GalleryEvent | null>(null);
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadEventData(eventId);
    }
  }, [eventId]);

  const loadEventData = async (id: string) => {
    setIsLoading(true);
    try {
      const eventData = await fetchGalleryEventById(id);
      if (eventData) {
        setEvent(eventData);
        loadMediaData(id);
      } else {
        toast.error("Gallery event not found");
        navigate("/gallery", { replace: true });
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      toast.error("Failed to load gallery event");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMediaData = async (id: string) => {
    try {
      const mediaData = await fetchGalleryMediaByEventId(id);
      setMedia(mediaData);
    } catch (error) {
      console.error("Error loading media data:", error);
      toast.error("Failed to load gallery media");
    }
  };

  const handleMediaUpdate = () => {
    if (eventId) {
      loadMediaData(eventId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The gallery event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/gallery")}>
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/gallery")} 
        className="mb-6 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </Button>

      <GalleryEventDetails 
        event={event} 
        media={media}
        onMediaUpdate={handleMediaUpdate}
      />
    </div>
  );
}

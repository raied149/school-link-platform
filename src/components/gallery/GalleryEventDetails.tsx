
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Calendar, File, Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { GalleryEvent, GalleryMedia } from "@/types/gallery";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { uploadGalleryMedia, deleteGalleryMedia } from "@/services/galleryService";

interface GalleryEventDetailsProps {
  event: GalleryEvent;
  media: GalleryMedia[];
  onMediaUpdate: () => void;
}

export function GalleryEventDetails({ event, media, onMediaUpdate }: GalleryEventDetailsProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';
  
  const canManageMedia = isTeacherOrAdmin && (user?.id === event.created_by || user?.role === 'admin');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !event.id) return;

    setIsUploading(true);
    try {
      const result = await uploadGalleryMedia(event.id, selectedFile);
      if (result) {
        toast.success("File uploaded successfully");
        setSelectedFile(null);
        onMediaUpdate();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaItem: GalleryMedia) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        const success = await deleteGalleryMedia(mediaItem);
        if (success) {
          toast.success("File deleted successfully");
          onMediaUpdate();
        }
      } catch (error) {
        console.error("Error deleting media:", error);
        toast.error("Failed to delete file");
      }
    }
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      {event.description && (
        <div className="prose max-w-none">
          <p>{event.description}</p>
        </div>
      )}

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Gallery Media</h2>
          {canManageMedia && (
            <div className="flex items-center gap-3">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="max-w-[300px]"
              />
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {media.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/30">
            <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No media has been added to this event yet.</p>
            {canManageMedia && (
              <p className="text-sm text-muted-foreground mt-1">
                Upload files using the upload button above.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative border rounded-lg overflow-hidden">
                {isImage(item.file_type) ? (
                  <div className="aspect-square">
                    <img 
                      src={item.file_url} 
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <File className="h-16 w-16 text-muted-foreground" />
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2 text-center">
                      <a 
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {item.file_name}
                      </a>
                    </div>
                  </div>
                )}
                
                {canManageMedia && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMedia(item)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {isImage(item.file_type) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {item.file_name}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

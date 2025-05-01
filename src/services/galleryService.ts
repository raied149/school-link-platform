
import { supabase } from "@/integrations/supabase/client";
import { GalleryEvent, GalleryMedia } from "@/types/gallery";
import { toast } from "sonner";

// Fetch all gallery events
export const fetchGalleryEvents = async (): Promise<GalleryEvent[]> => {
  const { data, error } = await supabase
    .from("gallery_events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    console.error("Error fetching gallery events:", error);
    toast.error("Failed to load gallery events");
    return [];
  }

  return data || [];
};

// Fetch a specific gallery event by ID
export const fetchGalleryEventById = async (id: string): Promise<GalleryEvent | null> => {
  const { data, error } = await supabase
    .from("gallery_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching gallery event:", error);
    toast.error("Failed to load gallery event");
    return null;
  }

  return data;
};

// Fetch media for a specific event
export const fetchGalleryMediaByEventId = async (eventId: string): Promise<GalleryMedia[]> => {
  const { data, error } = await supabase
    .from("gallery_media")
    .select("*")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching gallery media:", error);
    toast.error("Failed to load gallery media");
    return [];
  }

  return data || [];
};

// Create a new gallery event
export const createGalleryEvent = async (event: Omit<GalleryEvent, "id" | "created_at" | "created_by">): Promise<string | null> => {
  // Get the current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  if (!userId) {
    toast.error("User authentication required");
    return null;
  }

  const { data, error } = await supabase
    .from("gallery_events")
    .insert({
      title: event.title, 
      description: event.description, 
      event_date: event.event_date,
      created_by: userId // Add the created_by field with the user's ID
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating gallery event:", error);
    toast.error("Failed to create gallery event");
    return null;
  }

  return data?.id || null;
};

// Update an existing gallery event
export const updateGalleryEvent = async (id: string, updates: Partial<GalleryEvent>): Promise<boolean> => {
  const { error } = await supabase
    .from("gallery_events")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating gallery event:", error);
    toast.error("Failed to update gallery event");
    return false;
  }

  return true;
};

// Delete a gallery event
export const deleteGalleryEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("gallery_events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gallery event:", error);
    toast.error("Failed to delete gallery event");
    return false;
  }

  return true;
};

// Upload media for an event
export const uploadGalleryMedia = async (
  eventId: string, 
  file: File
): Promise<GalleryMedia | null> => {
  // Generate a unique file name
  const fileExtension = file.name.split('.').pop();
  const fileName = `${eventId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  
  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('gallery_media')
    .upload(fileName, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    toast.error("Failed to upload file");
    return null;
  }

  // Get the public URL for the uploaded file
  const { data: publicURLData } = supabase
    .storage
    .from('gallery_media')
    .getPublicUrl(fileName);

  if (!publicURLData?.publicUrl) {
    toast.error("Failed to get public URL for uploaded file");
    return null;
  }

  // Create entry in gallery_media table
  const { data: mediaData, error: mediaError } = await supabase
    .from("gallery_media")
    .insert([
      {
        event_id: eventId,
        file_name: file.name,
        file_url: publicURLData.publicUrl,
        file_type: file.type,
      }
    ])
    .select()
    .single();

  if (mediaError) {
    console.error("Error creating media record:", mediaError);
    toast.error("Failed to create media record");
    
    // Clean up the uploaded file if the database record creation fails
    await supabase.storage.from('gallery_media').remove([fileName]);
    return null;
  }

  return mediaData;
};

// Delete a media file
export const deleteGalleryMedia = async (media: GalleryMedia): Promise<boolean> => {
  // Extract the file path from the URL
  const filePath = media.file_url.replace(
    `https://lafyktdjzskzwqfzciyr.supabase.co/storage/v1/object/public/gallery_media/`,
    ''
  );

  // Delete the file from storage
  const { error: storageError } = await supabase
    .storage
    .from('gallery_media')
    .remove([filePath]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    toast.error("Failed to delete file from storage");
    return false;
  }

  // Delete the record from the database
  const { error: dbError } = await supabase
    .from("gallery_media")
    .delete()
    .eq("id", media.id);

  if (dbError) {
    console.error("Error deleting media record:", dbError);
    toast.error("Failed to delete media record");
    return false;
  }

  return true;
};


export interface GalleryEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
  created_by: string;
}

export interface GalleryMedia {
  id: string;
  event_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

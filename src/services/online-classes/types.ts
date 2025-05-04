
import { UserRole } from "@/contexts/AuthContext";

export interface OnlineClass {
  id: string;
  created_at: string;
  created_by: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  google_meet_link: string;
  title?: string;
}

export interface OnlineClassWithDetails extends OnlineClass {
  class_name?: string;
  section_name?: string;
  subject_name?: string;
  teacher_name?: string;
}

export interface CreateOnlineClassParams {
  class_id: string;
  section_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  google_meet_link: string;
  title?: string;
  created_by: string;
}

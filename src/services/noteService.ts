
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteWithUser = Note & { creator: { first_name: string; last_name: string } };

export type CreateNoteInput = {
  title: string;
  description?: string;
  googleDriveLink: string;
  subjectId?: string;
  shareWithAllSections: boolean;
  selectedClassIds: string[];
  selectedSectionIds: string[];
};

export const noteService = {
  async createNote(data: CreateNoteInput) {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session.session) {
        throw new Error("User not authenticated");
      }
      
      const userId = session.session.user.id;
      
      // Insert the note
      const { data: note, error } = await supabase
        .from("notes")
        .insert({
          title: data.title,
          description: data.description,
          google_drive_link: data.googleDriveLink,
          created_by: userId,
          subject_id: data.subjectId === "none" ? null : data.subjectId,
          share_with_all_sections: data.shareWithAllSections,
        })
        .select("*")
        .single();

      if (error) throw error;
      if (!note) throw new Error("Failed to create note");

      // Insert class associations
      if (data.selectedClassIds.length > 0) {
        const classAssociations = data.selectedClassIds.map((classId) => ({
          note_id: note.id,
          class_id: classId,
        }));

        const { error: classError } = await supabase.from("note_classes").insert(classAssociations);
        if (classError) throw classError;
      }

      // Insert section associations if not sharing with all sections
      if (!data.shareWithAllSections && data.selectedSectionIds.length > 0) {
        const sectionAssociations = data.selectedSectionIds.map((sectionId) => ({
          note_id: note.id,
          section_id: sectionId,
        }));

        const { error: sectionError } = await supabase.from("note_sections").insert(sectionAssociations);
        if (sectionError) throw sectionError;
      }

      return note;
    } catch (error: any) {
      console.error("Failed to create note:", error);
      throw new Error(error.message || "Failed to create note");
    }
  },

  async getNotes() {
    try {
      const { data: notes, error } = await supabase
        .from("notes")
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return notes as NoteWithUser[];
    } catch (error: any) {
      toast.error("Failed to fetch notes: " + error.message);
      throw error;
    }
  },

  async getNotesForStudent(studentId: string) {
    try {
      // Get student's class and section
      const { data: student, error: studentError } = await supabase
        .from("student_details")
        .select("current_class_id, current_section_id")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;
      if (!student) throw new Error("Student details not found");

      // Get notes that are either:
      // 1. Shared with the student's specific class
      // 2. Shared with the student's specific section
      // 3. Or if the note is shared with all sections
      const { data: notes, error } = await supabase
        .from("notes")
        .select(`
          *,
          creator:profiles(first_name, last_name)
        `)
        .or(`share_with_all_sections.eq.true, note_classes.class_id.eq.${student.current_class_id}, note_sections.section_id.eq.${student.current_section_id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Remove duplicate notes
      const uniqueNotes = [...new Map(notes.map(note => [note.id, note])).values()];
      return uniqueNotes as NoteWithUser[];
    } catch (error: any) {
      toast.error("Failed to fetch notes: " + error.message);
      throw error;
    }
  },
};

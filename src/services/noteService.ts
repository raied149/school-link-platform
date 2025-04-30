
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteWithUser = Note & { creator: { first_name: string; last_name: string } };

export type CreateNoteInput = {
  title: string;
  description?: string;
  googleDriveLink: string;
  shareWithAllGrades: boolean;
  shareWithAllSectionsInGrades: boolean;
  selectedClassIds: string[];
  selectedSectionIds: string[];
};

export const noteService = {
  async createNote(data: CreateNoteInput) {
    try {
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) throw new Error("User not authenticated");

      // Insert the note
      const { data: note, error } = await supabase
        .from("notes")
        .insert({
          title: data.title,
          description: data.description,
          google_drive_link: data.googleDriveLink,
          created_by: user.id,
          share_with_all_grades: data.shareWithAllGrades,
          share_with_all_sections_in_grades: data.shareWithAllSectionsInGrades,
        })
        .select("*")
        .single();

      if (error) throw error;
      if (!note) throw new Error("Failed to create note");

      // Insert class associations if not sharing with all grades
      if (!data.shareWithAllGrades && data.selectedClassIds.length > 0) {
        const classAssociations = data.selectedClassIds.map((classId) => ({
          note_id: note.id,
          class_id: classId,
        }));

        const { error: classError } = await supabase.from("note_classes").insert(classAssociations);
        if (classError) throw classError;
      }

      // Insert section associations if not sharing with all sections in grades
      if (!data.shareWithAllSectionsInGrades && data.selectedSectionIds.length > 0) {
        const sectionAssociations = data.selectedSectionIds.map((sectionId) => ({
          note_id: note.id,
          section_id: sectionId,
        }));

        const { error: sectionError } = await supabase.from("note_sections").insert(sectionAssociations);
        if (sectionError) throw sectionError;
      }

      return note;
    } catch (error: any) {
      toast.error("Failed to create note: " + error.message);
      throw error;
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
      // 1. Shared with all grades
      // 2. Shared with the student's specific class
      // 3. Shared with the student's specific section
      // 4. Or if the note is shared with the student's class and all sections in that class
      const { data: notes, error } = await supabase
        .from("notes")
        .select(`
          *,
          creator:profiles(first_name, last_name),
          note_classes!inner(class_id),
          note_sections!inner(section_id)
        `)
        .or(`share_with_all_grades.eq.true, note_classes.class_id.eq.${student.current_class_id}, note_sections.section_id.eq.${student.current_section_id}`)
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

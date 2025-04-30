import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Note {
  id: string;
  title: string;
  description?: string;
  googleDriveLink: string;
  createdAt: string;
  createdBy: string;
  creatorName?: string;
  subjectName?: string;
  subjectId?: string;
  classNames?: string[];
  sectionNames?: string[];
}

export interface CreateNoteInput {
  title: string;
  description?: string;
  googleDriveLink: string;
  subjectId?: string;
  shareWithAllSections: boolean;
  selectedClassIds: string[];
  selectedSectionIds: string[];
}

export const noteService = {
  getNotes: async (): Promise<Note[]> => {
    try {
      console.log("Fetching all notes");
      
      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          *,
          profiles:created_by (first_name, last_name),
          subjects (name, id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const notesWithClasses = await Promise.all(
        (notes || []).map(async (note) => {
          // Get classes for this note
          const { data: classData } = await supabase
            .from('note_classes')
            .select('classes(name)')
            .eq('note_id', note.id);
            
          const classNames = classData?.map(c => c.classes.name) || [];
          
          // Get sections for this note
          const { data: sectionData } = await supabase
            .from('note_sections')
            .select('sections(name)')
            .eq('note_id', note.id);
            
          const sectionNames = sectionData?.map(s => s.sections.name) || [];
          
          // Get subject name and ID if available
          let subjectName = undefined;
          let subjectId = undefined;
          
          if (note.subjects) {
            subjectName = note.subjects.name;
            subjectId = note.subjects.id;
          }
          
          return {
            id: note.id,
            title: note.title,
            description: note.description,
            googleDriveLink: note.google_drive_link,
            createdAt: note.created_at,
            createdBy: note.created_by,
            creatorName: `${note.profiles?.first_name || ''} ${note.profiles?.last_name || ''}`.trim(),
            subjectId,
            subjectName,
            classNames,
            sectionNames
          };
        })
      );
      
      return notesWithClasses;
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  },

  getNotesForStudent: async (studentId: string): Promise<Note[]> => {
    try {
      console.log("Fetching notes for student:", studentId);
      
      // First get the student's section
      const { data: studentSections } = await supabase
        .from('student_sections')
        .select('section_id')
        .eq('student_id', studentId);
        
      if (!studentSections?.length) return [];
      
      const studentSectionIds = studentSections.map(s => s.section_id);
      
      // Get the class IDs for these sections
      const { data: sections } = await supabase
        .from('sections')
        .select('class_id')
        .in('id', studentSectionIds);
        
      const classIds = [...new Set(sections?.map(s => s.class_id) || [])];
      
      // Get notes that are either:
      // 1. Shared with all sections in classes the student belongs to
      // 2. Specifically shared with the student's section
      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          *,
          profiles:created_by (first_name, last_name),
          subjects (name, id)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Filter notes based on class and section
      const filteredNotes = await Promise.all(
        (notes || []).filter(async (note) => {
          // Check if note is shared with student's classes
          const { data: noteClasses } = await supabase
            .from('note_classes')
            .select('class_id')
            .eq('note_id', note.id);
            
          const noteClassIds = noteClasses?.map(nc => nc.class_id) || [];
          const sharedWithStudentClass = noteClassIds.some(cId => classIds.includes(cId));
          
          if (!sharedWithStudentClass) return false;
          
          // If shared with all sections, include it
          if (note.share_with_all_sections_in_grades) return true;
          
          // Otherwise check if shared with student's specific section
          const { data: noteSections } = await supabase
            .from('note_sections')
            .select('section_id')
            .eq('note_id', note.id);
            
          const noteSectionIds = noteSections?.map(ns => ns.section_id) || [];
          return noteSectionIds.some(sId => studentSectionIds.includes(sId));
        }).map(async (note) => {
          // Get classes for this note
          const { data: classData } = await supabase
            .from('note_classes')
            .select('classes(name)')
            .eq('note_id', note.id);
            
          const classNames = classData?.map(c => c.classes.name) || [];
          
          // Get sections for this note
          const { data: sectionData } = await supabase
            .from('note_sections')
            .select('sections(name)')
            .eq('note_id', note.id);
            
          const sectionNames = sectionData?.map(s => s.sections.name) || [];
          
          // Get subject name and ID if available
          let subjectName = undefined;
          let subjectId = undefined;
          
          if (note.subjects) {
            subjectName = note.subjects.name;
            subjectId = note.subjects.id;
          }
          
          return {
            id: note.id,
            title: note.title,
            description: note.description,
            googleDriveLink: note.google_drive_link,
            createdAt: note.created_at,
            createdBy: note.created_by,
            creatorName: `${note.profiles?.first_name || ''} ${note.profiles?.last_name || ''}`.trim(),
            subjectId,
            subjectName,
            classNames,
            sectionNames
          };
        })
      );
      
      return filteredNotes;
    } catch (error) {
      console.error("Error fetching notes for student:", error);
      throw error;
    }
  },

  createNote: async (input: CreateNoteInput): Promise<Note> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }
      
      const userId = session.user.id;
      
      // Create the note
      const { data: note, error } = await supabase
        .from('notes')
        .insert({
          title: input.title,
          description: input.description,
          google_drive_link: input.googleDriveLink,
          created_by: userId,
          subject_id: input.subjectId,
          share_with_all_sections_in_grades: input.shareWithAllSections
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add class associations
      const classPromises = input.selectedClassIds.map(classId =>
        supabase
          .from('note_classes')
          .insert({ note_id: note.id, class_id: classId })
      );
      
      await Promise.all(classPromises);
      
      // If not sharing with all sections, add specific section associations
      if (!input.shareWithAllSections && input.selectedSectionIds.length > 0) {
        const sectionPromises = input.selectedSectionIds.map(sectionId =>
          supabase
            .from('note_sections')
            .insert({ note_id: note.id, section_id: sectionId })
        );
        
        await Promise.all(sectionPromises);
      }
      
      return {
        id: note.id,
        title: note.title,
        description: note.description,
        googleDriveLink: note.google_drive_link,
        createdAt: note.created_at,
        createdBy: note.created_by,
        subjectId: input.subjectId,
        classNames: [],  // These will be populated by the frontend when needed
        sectionNames: []
      };
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }
};

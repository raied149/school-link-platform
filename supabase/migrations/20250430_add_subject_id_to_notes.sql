
-- Add subject_id column to the notes table
ALTER TABLE public.notes 
ADD COLUMN subject_id UUID REFERENCES public.subjects(id);

-- Replace share_with_all_grades with share_with_all_sections
ALTER TABLE public.notes 
DROP COLUMN share_with_all_grades;

ALTER TABLE public.notes 
ADD COLUMN share_with_all_sections BOOLEAN DEFAULT false;

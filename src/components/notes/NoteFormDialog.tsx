
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateNoteInput, noteService } from "@/services/noteService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicYearService } from "@/services/academicYearService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteFormDialog({ open, onOpenChange }: NoteFormDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [shareWithAllSections, setShareWithAllSections] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    title: string;
    description: string;
    googleDriveLink: string;
  }>();

  // Get the current active academic year
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicYearService.getAcademicYears(),
  });

  const activeYear = academicYears.find(year => year.isActive);
  // Ensure activeYearId is a valid UUID or null
  const activeYearId = activeYear?.id || null;

  // Fetch real classes from Supabase for the active academic year
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["real-classes", activeYearId],
    queryFn: async () => {
      console.log("Fetching real classes for yearId:", activeYearId);
      if (!activeYearId) {
        console.log("No active year ID found");
        toast.error("No active academic year found");
        return [];
      }
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('year_id', activeYearId)
        .order('name');
      
      if (error) {
        console.error("Error fetching classes:", error);
        toast.error("Failed to load classes");
        return [];
      }
      
      console.log("Fetched real classes:", data);
      return data || [];
    },
    enabled: !!activeYearId
  });

  // Fetch real sections based on selected class from Supabase
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["real-sections", selectedClassId, activeYearId],
    queryFn: async () => {
      console.log("Fetching real sections for classId:", selectedClassId);
      if (!selectedClassId) return [];
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('name');
      
      if (error) {
        console.error("Error fetching sections:", error);
        toast.error("Failed to load sections");
        return [];
      }
      
      console.log("Fetched real sections:", data);
      return data || [];
    },
    enabled: !!selectedClassId
  });

  // Fetch real subjects for the selected class from Supabase
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["real-subjects", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];
      
      // First get subject IDs associated with the class
      const { data: subjectClasses, error: subjectClassesError } = await supabase
        .from('subject_classes')
        .select('subject_id')
        .eq('class_id', selectedClassId);
      
      if (subjectClassesError) {
        console.error("Error fetching subject classes:", subjectClassesError);
        return [];
      }
      
      if (!subjectClasses || subjectClasses.length === 0) {
        // If no subjects are specifically assigned to this class, get all subjects
        const { data: allSubjects, error: allSubjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('name');
        
        if (allSubjectsError) {
          console.error("Error fetching all subjects:", allSubjectsError);
          return [];
        }
        
        return allSubjects || [];
      }
      
      const subjectIds = subjectClasses.map(sc => sc.subject_id);
      
      // Get the actual subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds)
        .order('name');
      
      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        return [];
      }
      
      return subjectsData || [];
    },
    enabled: !!selectedClassId
  });

  // Reset selections when dialog opens or closes
  useEffect(() => {
    if (!open) {
      reset();
      setShareWithAllSections(false);
      setSelectedClassId("");
      setSelectedSectionId("");
      setSelectedSubject("none");
    }
  }, [open, reset]);

  const createNoteMutation = useMutation({
    mutationFn: noteService.createNote,
    onSuccess: () => {
      toast.success("Note created successfully");
      reset();
      setShareWithAllSections(false);
      setSelectedClassId("");
      setSelectedSectionId("");
      setSelectedSubject("none");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create note: ${error.message}`);
    }
  });

  const onSubmit = handleSubmit((data) => {
    // Check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to create a note");
      return;
    }

    // Validate URL format
    if (!isValidURL(data.googleDriveLink)) {
      toast.error("Please enter a valid URL for the Google Drive link");
      return;
    }

    if (!selectedClassId) {
      toast.error("Please select a grade");
      return;
    }

    if (!shareWithAllSections && !selectedSectionId) {
      toast.error("Please select a section or enable 'Share with all sections'");
      return;
    }

    const noteData: CreateNoteInput = {
      title: data.title,
      description: data.description,
      googleDriveLink: data.googleDriveLink,
      subjectId: selectedSubject === "none" ? undefined : selectedSubject,
      shareWithAllSections,
      selectedClassIds: [selectedClassId], 
      selectedSectionIds: shareWithAllSections ? [] : [selectedSectionId],
    };

    createNoteMutation.mutate(noteData);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Share a New Note</DialogTitle>
          <DialogDescription>
            Create a new note with a Google Drive link to share with a specific grade and section.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Enter note title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="googleDriveLink">Google Drive Link <span className="text-red-500">*</span></Label>
              <Input
                id="googleDriveLink"
                placeholder="https://drive.google.com/..."
                {...register("googleDriveLink", { required: "Google Drive link is required" })}
              />
              {errors.googleDriveLink && (
                <p className="text-sm text-red-500">{errors.googleDriveLink.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description (optional)"
              {...register("description")}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No subject</SelectItem>
                  {!selectedClassId ? (
                    <SelectItem value="select-class" disabled>Select a grade first</SelectItem>
                  ) : subjectsLoading ? (
                    <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                  ) : subjects.length === 0 ? (
                    <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Single Grade Selection */}
            <div className="space-y-2">
              <Label htmlFor="class">Select Grade <span className="text-red-500">*</span></Label>
              <Select 
                value={selectedClassId} 
                onValueChange={setSelectedClassId}
                disabled={classesLoading}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  {classesLoading ? (
                    <SelectItem value="loading" disabled>Loading grades...</SelectItem>
                  ) : classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>No grades available</SelectItem>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Share with all sections toggle */}
          {selectedClassId && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="shareWithAllSections" className="flex-grow">
                Share with all sections in selected grade
              </Label>
              <Switch
                id="shareWithAllSections"
                checked={shareWithAllSections}
                onCheckedChange={setShareWithAllSections}
              />
            </div>
          )}
          
          {/* Single Section Selection */}
          {!shareWithAllSections && selectedClassId && (
            <div className="space-y-2">
              <Label htmlFor="section">Select Section <span className="text-red-500">*</span></Label>
              <Select 
                value={selectedSectionId} 
                onValueChange={setSelectedSectionId}
                disabled={sectionsLoading}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sectionsLoading ? (
                    <SelectItem value="loading" disabled>Loading sections...</SelectItem>
                  ) : sections.length === 0 ? (
                    <SelectItem value="no-sections" disabled>No sections available</SelectItem>
                  ) : (
                    sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to validate URLs
function isValidURL(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

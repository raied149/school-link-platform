
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { classService } from "@/services/classService";
import { sectionService } from "@/services/sectionService";
import { subjectService } from "@/services/subjectService";
import { toast } from "sonner";
import { CreateNoteInput, noteService } from "@/services/noteService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteFormDialog({ open, onOpenChange }: NoteFormDialogProps) {
  const queryClient = useQueryClient();
  const [shareWithAllSections, setShareWithAllSections] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    title: string;
    description: string;
    googleDriveLink: string;
  }>();

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: classService.getClasses
  });

  // Fetch sections based on selected class
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", selectedClassId],
    queryFn: () => selectedClassId ? sectionService.getSectionsByClassAndYear(selectedClassId, "default") : [],
    enabled: !!selectedClassId
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects
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
      selectedClassIds: [selectedClassId], // Now only allowing a single class ID
      selectedSectionIds: shareWithAllSections ? [] : [selectedSectionId], // Now only allowing a single section ID
    };

    createNoteMutation.mutate(noteData);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Share a New Note</DialogTitle>
          <DialogDescription>
            Create a new note with a Google Drive link to share with a specific grade and section.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description (optional)"
                  {...register("description")}
                />
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

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="none">No subject</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
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
                  <SelectContent className="max-h-[200px]">
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>Loading grades...</SelectItem>
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
                    <SelectContent className="max-h-[200px]">
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
            </div>
            
            <DialogFooter className="pt-2">
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
        </ScrollArea>
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

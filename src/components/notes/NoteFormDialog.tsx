
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { classService } from "@/services/classService";
import { sectionService } from "@/services/sectionService";
import { subjectService } from "@/services/subjectService";
import { toast } from "sonner";
import { CreateNoteInput, noteService } from "@/services/noteService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteFormDialog({ open, onOpenChange }: NoteFormDialogProps) {
  const queryClient = useQueryClient();
  const [shareWithAllSections, setShareWithAllSections] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    title: string;
    description: string;
    googleDriveLink: string;
  }>();

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      return classService.getClasses();
    }
  });

  // Fetch sections
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      // Only get sections for selected classes
      if (selectedClasses.length === 0) {
        return [];
      }
      
      return sectionService.getSections();
    },
    enabled: selectedClasses.length > 0
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: subjectService.getSubjects
  });

  const createNoteMutation = useMutation({
    mutationFn: noteService.createNote,
    onSuccess: () => {
      toast.success("Note created successfully");
      reset();
      setShareWithAllSections(false);
      setSelectedClasses([]);
      setSelectedSections([]);
      setSelectedSubject("");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onOpenChange(false);
    },
  });

  const onSubmit = handleSubmit((data) => {
    // Validate URL format
    if (!isValidURL(data.googleDriveLink)) {
      toast.error("Please enter a valid URL for the Google Drive link");
      return;
    }

    const noteData: CreateNoteInput = {
      title: data.title,
      description: data.description,
      googleDriveLink: data.googleDriveLink,
      subjectId: selectedSubject || undefined,
      shareWithAllSections,
      selectedClassIds: selectedClasses,
      selectedSectionIds: shareWithAllSections ? [] : selectedSections,
    };

    createNoteMutation.mutate(noteData);
  });

  const handleClassChange = (classId: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, classId]);
    } else {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
      // Remove any sections that belong to this class
      const classSections = sections.filter(section => section.classId === classId).map(s => s.id);
      setSelectedSections(selectedSections.filter(id => !classSections.includes(id)));
    }
  };

  const handleSectionChange = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections([...selectedSections, sectionId]);
    } else {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share a New Note</DialogTitle>
          <DialogDescription>
            Create a new note with a Google Drive link to share with specific grades and sections.
          </DialogDescription>
        </DialogHeader>
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
                <SelectContent>
                  <SelectItem value="none">No subject</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Grades</Label>
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls.id}`}
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={(checked) => handleClassChange(cls.id, checked === true)}
                    />
                    <Label htmlFor={`class-${cls.id}`} className="cursor-pointer">
                      {cls.name}
                    </Label>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">No grades available</p>
                )}
              </div>
            </div>
            
            {selectedClasses.length > 0 && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="shareWithAllSections" className="flex-grow">
                  Share with all sections in selected grades
                </Label>
                <Switch
                  id="shareWithAllSections"
                  checked={shareWithAllSections}
                  onCheckedChange={(checked) => {
                    setShareWithAllSections(checked);
                    if (checked) {
                      setSelectedSections([]);
                    }
                  }}
                />
              </div>
            )}
            
            {!shareWithAllSections && selectedClasses.length > 0 && (
              <div className="space-y-2">
                <Label>Select Sections</Label>
                <div className="border rounded-md p-4 max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
                  {sections
                    .filter(section => selectedClasses.includes(section.classId))
                    .map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`section-${section.id}`}
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={(checked) => handleSectionChange(section.id, checked === true)}
                        />
                        <Label htmlFor={`section-${section.id}`} className="cursor-pointer">
                          {section.name}
                        </Label>
                      </div>
                    ))}
                  {sections.filter(section => selectedClasses.includes(section.classId)).length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2">No sections available</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
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

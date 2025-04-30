
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteFormDialog({ open, onOpenChange }: NoteFormDialogProps) {
  const queryClient = useQueryClient();
  const [shareWithAllSections, setShareWithAllSections] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    title: string;
    description: string;
    googleDriveLink: string;
  }>();

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: classService.getClasses
  });

  // Fetch sections based on selected classes
  const { data: allSections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: sectionService.getSections,
    enabled: selectedClasses.length > 0
  });

  // Filter sections based on selected classes
  const availableSections = allSections.filter(section => 
    selectedClasses.includes(section.classId)
  );

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
      setSelectedClasses([]);
      setSelectedSections([]);
      setSelectedSubject("none");
    }
  }, [open, reset]);

  const createNoteMutation = useMutation({
    mutationFn: noteService.createNote,
    onSuccess: () => {
      toast.success("Note created successfully");
      reset();
      setShareWithAllSections(false);
      setSelectedClasses([]);
      setSelectedSections([]);
      setSelectedSubject("none");
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

    if (selectedClasses.length === 0) {
      toast.error("Please select at least one grade");
      return;
    }

    if (!shareWithAllSections && selectedSections.length === 0) {
      toast.error("Please select at least one section or enable 'Share with all sections'");
      return;
    }

    const noteData: CreateNoteInput = {
      title: data.title,
      description: data.description,
      googleDriveLink: data.googleDriveLink,
      subjectId: selectedSubject,
      shareWithAllSections,
      selectedClassIds: selectedClasses,
      selectedSectionIds: shareWithAllSections ? [] : selectedSections,
    };

    createNoteMutation.mutate(noteData);
  });

  // Toggle class selection
  const toggleClass = (classId: string) => {
    setSelectedClasses(current => {
      if (current.includes(classId)) {
        const newSelectedClasses = current.filter(id => id !== classId);
        // Remove any sections that belong to this class
        setSelectedSections(prev => prev.filter(sectionId => {
          const section = allSections.find(s => s.id === sectionId);
          return section && newSelectedClasses.includes(section.classId);
        }));
        return newSelectedClasses;
      } else {
        return [...current, classId];
      }
    });
  };

  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setSelectedSections(current => {
      if (current.includes(sectionId)) {
        return current.filter(id => id !== sectionId);
      } else {
        return [...current, sectionId];
      }
    });
  };

  // Select all available sections
  const selectAllSections = () => {
    if (selectedSections.length === availableSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(availableSections.map(section => section.id));
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
            
            {/* Grades Dropdown */}
            <div className="space-y-2">
              <Label>Select Grades</Label>
              <DropdownMenu open={classDropdownOpen} onOpenChange={setClassDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedClasses.length > 0 
                      ? `${selectedClasses.length} grade(s) selected` 
                      : "Select grades"}
                    <Filter className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
                  {classes.map((cls) => (
                    <DropdownMenuCheckboxItem
                      key={cls.id}
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    >
                      {cls.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedClasses.length === 0 && (
                <p className="text-xs text-muted-foreground">Please select at least one grade</p>
              )}
            </div>
            
            {/* Share with all sections toggle */}
            {selectedClasses.length > 0 && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="shareWithAllSections" className="flex-grow">
                  Share with all sections in selected grades
                </Label>
                <Switch
                  id="shareWithAllSections"
                  checked={shareWithAllSections}
                  onCheckedChange={setShareWithAllSections}
                />
              </div>
            )}
            
            {/* Sections Dropdown */}
            {!shareWithAllSections && selectedClasses.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Sections</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={selectAllSections}
                    disabled={availableSections.length === 0}
                  >
                    {selectedSections.length === availableSections.length && availableSections.length > 0
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                <DropdownMenu open={sectionDropdownOpen} onOpenChange={setSectionDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedSections.length > 0 
                        ? `${selectedSections.length} section(s) selected` 
                        : "Select sections"}
                      <Filter className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
                    {availableSections.map((section) => (
                      <DropdownMenuCheckboxItem
                        key={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                      >
                        {section.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {availableSections.length === 0 && (
                      <div className="px-2 py-1 text-sm text-muted-foreground">
                        No sections available
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {!shareWithAllSections && selectedClasses.length > 0 && selectedSections.length === 0 && (
                  <p className="text-xs text-muted-foreground">Please select at least one section</p>
                )}
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

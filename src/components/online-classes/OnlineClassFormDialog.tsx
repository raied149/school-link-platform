
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { academicYearService } from "@/services/academicYearService";
import { CreateOnlineClassParams, onlineClassService } from "@/services/onlineClassService";
import { toast } from "sonner";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface OnlineClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, success?: boolean) => void;
}

export function OnlineClassFormDialog({ open, onOpenChange }: OnlineClassFormDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const form = useForm({
    defaultValues: {
      title: "",
      googleMeetLink: "",
      startTime: "",
      endTime: "",
    },
  });

  // Get the current active academic year
  const { data: activeYear, isLoading: activeYearLoading } = useQuery({
    queryKey: ['active-academic-year'],
    queryFn: () => academicYearService.getActiveAcademicYear(),
  });

  // Log active year for debugging
  useEffect(() => {
    if (activeYear) {
      console.log("Active academic year:", activeYear);
    } else if (!activeYearLoading) {
      console.log("No active academic year found");
    }
  }, [activeYear, activeYearLoading]);
  
  // Ensure activeYearId is a valid UUID or null
  const activeYearId = activeYear?.id || null;

  // Fetch real classes from Supabase for the active academic year
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["real-classes", activeYearId],
    queryFn: async () => {
      console.log("Fetching real classes for yearId:", activeYearId);
      if (!activeYearId) {
        console.log("No active year ID found");
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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedClassId("");
      setSelectedSectionId("");
      setSelectedSubjectId("");
      setSelectedDate(new Date());
    }
  }, [open, form]);

  const createOnlineClassMutation = useMutation({
    mutationFn: async (data: CreateOnlineClassParams) => {
      return onlineClassService.createOnlineClass(data);
    },
    onSuccess: (data) => {
      if (data) {
        console.log("Class created successfully:", data);
        toast.success("Online class created successfully");
        queryClient.invalidateQueries({ queryKey: ["online-classes"] });
        onOpenChange(false, true); // Pass true to indicate success
      } else {
        console.error("Failed to create online class: returned null");
        toast.error("Failed to create online class");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(`Failed to create online class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user) {
      toast.error("You must be logged in to schedule a class");
      return;
    }

    if (!selectedClassId) {
      toast.error("Please select a grade");
      return;
    }

    if (!selectedSectionId) {
      toast.error("Please select a section");
      return;
    }

    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const onlineClassData: CreateOnlineClassParams = {
      title: values.title,
      class_id: selectedClassId,
      section_id: selectedSectionId,
      subject_id: selectedSubjectId,
      date: format(selectedDate, "yyyy-MM-dd"),
      start_time: values.startTime,
      end_time: values.endTime || undefined,
      google_meet_link: values.googleMeetLink,
      created_by: user.id,
    };

    console.log("Creating online class with data:", onlineClassData);
    createOnlineClassMutation.mutate(onlineClassData);
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange(isOpen, false)}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Schedule an Online Class</DialogTitle>
          <DialogDescription>Fill out the form to schedule an online class session.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter class title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="googleMeetLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Meet Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Grade</FormLabel>
                <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={classesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>Loading grades...</SelectItem>
                    ) : activeYearLoading ? (
                      <SelectItem value="loading" disabled>Loading academic year...</SelectItem>
                    ) : !activeYear ? (
                      <SelectItem value="no-year" disabled>No active academic year available</SelectItem>
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
              
              <div className="space-y-2">
                <FormLabel>Section</FormLabel>
                <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={sectionsLoading}>
                  <SelectTrigger>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Subject</FormLabel>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={subjectsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsLoading ? (
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
              
              <div className="space-y-2">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false, false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOnlineClassMutation.isPending}>
                {createOnlineClassMutation.isPending ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

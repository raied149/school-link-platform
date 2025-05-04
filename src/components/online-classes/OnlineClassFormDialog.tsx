
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarIcon, Clock } from "lucide-react";
import { CreateOnlineClassParams, onlineClassService } from "@/services/onlineClassService";
import { useAuth } from "@/contexts/AuthContext";
import { academicYearService } from "@/services/academicYearService";
import { classService } from "@/services/classService";
import { sectionService } from "@/services/sectionService";
import { subjectService } from "@/services/subjectService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnlineClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, success?: boolean) => void;
}

export function OnlineClassFormDialog({ open, onOpenChange }: OnlineClassFormDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      class_id: "",
      section_id: "",
      subject_id: "",
      date: new Date(),
      start_time: "09:00",
      end_time: "10:00",
      google_meet_link: "",
    }
  });

  // Form fields watch
  const selectedClassId = watch("class_id");
  const [date, setDate] = useState<Date>(new Date());

  // Get the current active academic year
  const { data: activeYear, isLoading: activeYearLoading } = useQuery({
    queryKey: ['active-academic-year'],
    queryFn: () => academicYearService.getActiveAcademicYear(),
  });

  // Fetch real classes from Supabase
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["classes", activeYear?.id],
    queryFn: () => {
      console.log("Fetching classes for active year:", activeYear?.id);
      if (activeYear?.id) {
        return classService.getClassesByYear(activeYear.id);
      }
      return classService.getClasses();
    },
    enabled: !!user,
  });

  // Fetch real sections based on selected class
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ["sections", selectedClassId],
    queryFn: () => {
      console.log("Fetching sections for class:", selectedClassId);
      if (selectedClassId && activeYear?.id) {
        return sectionService.getSectionsByClassAndYear(selectedClassId, activeYear.id);
      }
      return [];
    },
    enabled: !!selectedClassId && !!activeYear?.id,
  });

  // Fetch real subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", selectedClassId],
    queryFn: () => {
      console.log("Fetching subjects for class:", selectedClassId);
      if (selectedClassId) {
        return subjectService.getSubjectsByClass(selectedClassId);
      }
      return subjectService.getSubjects();
    },
    enabled: !!user,
  });

  // Update the form value when date changes
  useEffect(() => {
    setValue("date", date);
  }, [date, setValue]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        title: "",
        class_id: "",
        section_id: "",
        subject_id: "",
        date: new Date(),
        start_time: "09:00",
        end_time: "10:00",
        google_meet_link: "",
      });
      setDate(new Date());
    }
  }, [open, reset]);

  const createOnlineClassMutation = useMutation({
    mutationFn: async (data: CreateOnlineClassParams) => {
      return onlineClassService.createOnlineClass(data);
    },
    onSuccess: (data) => {
      if (data) {
        console.log("Class created successfully:", data);
        toast.success("Online class scheduled successfully");
        queryClient.invalidateQueries({ queryKey: ["online-classes"] });
        onOpenChange(false, true); // Pass true to indicate success
      } else {
        // Handle null result as an error
        console.error("Failed to create online class: returned null");
        toast.error("Failed to schedule online class");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(`Failed to schedule online class: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  const onSubmit = (formData: any) => {
    if (!user) {
      toast.error("You must be logged in to schedule a class");
      return;
    }

    const onlineClassData: CreateOnlineClassParams = {
      title: formData.title,
      class_id: formData.class_id,
      section_id: formData.section_id,
      subject_id: formData.subject_id,
      date: format(formData.date, "yyyy-MM-dd"),
      start_time: formData.start_time,
      end_time: formData.end_time,
      google_meet_link: formData.google_meet_link,
      created_by: user.id,
    };

    console.log("Submitting form data:", onlineClassData);
    createOnlineClassMutation.mutate(onlineClassData);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange(isOpen, false)}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Schedule an Online Class</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new online class.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                placeholder="Enter class title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <span className="text-sm text-red-500">{errors.title.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class_id">Class</Label>
                <Select
                  onValueChange={(value) => {
                    setValue("class_id", value);
                    setValue("section_id", ""); // Reset section when class changes
                  }}
                  defaultValue=""
                  disabled={classesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={classesLoading ? "Loading..." : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classesLoading ? (
                      <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                    ) : classes.length === 0 ? (
                      <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.class_id && (
                  <span className="text-sm text-red-500">
                    {errors.class_id.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="section_id">Section</Label>
                <Select
                  onValueChange={(value) => setValue("section_id", value)}
                  defaultValue=""
                  disabled={!selectedClassId || sectionsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={!selectedClassId ? "Select class first" : sectionsLoading ? "Loading..." : "Select section"} />
                  </SelectTrigger>
                  <SelectContent>
                    {!selectedClassId ? (
                      <SelectItem value="select-class" disabled>Select a class first</SelectItem>
                    ) : sectionsLoading ? (
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
                {errors.section_id && (
                  <span className="text-sm text-red-500">
                    {errors.section_id.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject_id">Subject</Label>
              <Select
                onValueChange={(value) => setValue("subject_id", value)}
                defaultValue=""
                disabled={subjectsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={subjectsLoading ? "Loading..." : "Select subject"} />
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
              {errors.subject_id && (
                <span className="text-sm text-red-500">
                  {errors.subject_id.message}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <span className="text-sm text-red-500">{errors.date.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_time"
                    type="time"
                    {...register("start_time", { required: "Start time is required" })}
                  />
                </div>
                {errors.start_time && (
                  <span className="text-sm text-red-500">
                    {errors.start_time.message}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_time"
                    type="time"
                    {...register("end_time", { required: "End time is required" })}
                  />
                </div>
                {errors.end_time && (
                  <span className="text-sm text-red-500">
                    {errors.end_time.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="google_meet_link">Google Meet Link</Label>
              <Input
                id="google_meet_link"
                placeholder="Enter Google Meet link"
                {...register("google_meet_link", {
                  required: "Google Meet link is required",
                  pattern: {
                    value: /^https:\/\/meet\.google\.com\/.+/i,
                    message: "Please enter a valid Google Meet link",
                  },
                })}
              />
              {errors.google_meet_link && (
                <span className="text-sm text-red-500">
                  {errors.google_meet_link.message}
                </span>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false, false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createOnlineClassMutation.isPending}>
                {createOnlineClassMutation.isPending ? "Scheduling..." : "Schedule Class"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

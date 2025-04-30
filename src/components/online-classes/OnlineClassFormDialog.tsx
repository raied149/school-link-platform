
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Video, X, Calendar, Clock, Link } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateSelector } from '@/components/attendance/DateSelector';
import { onlineClassService } from '@/services/onlineClassService';
import { classService } from '@/services/classService';
import { sectionService } from '@/services/sectionService';
import { subjectService } from '@/services/subjectService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { academicYearService } from '@/services/academicYearService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  section_id: z.string().min(1, "Section is required"),
  subject_id: z.string().min(1, "Subject is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  google_meet_link: z.string().url("Please enter a valid URL").min(1, "Google Meet link is required"),
  title: z.string().optional(),
});

type OnlineClassFormValues = z.infer<typeof formSchema>;

interface OnlineClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnlineClassFormDialog({ open, onOpenChange }: OnlineClassFormDialogProps) {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<OnlineClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      start_time: "",
      end_time: "",
      google_meet_link: "",
      title: "",
    },
  });

  // Get the current active academic year
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => academicYearService.getAcademicYears(),
  });

  const activeYearId = academicYears.find(year => year.isActive)?.id || "";

  // Fetch real classes from Supabase for the active academic year
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["real-classes", activeYearId],
    queryFn: async () => {
      console.log("Fetching real classes for yearId:", activeYearId);
      if (!activeYearId) return [];
      
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

  // Mutation for creating an online class
  const createMutation = useMutation({
    mutationFn: onlineClassService.createOnlineClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-classes'] });
      onOpenChange(false);
      form.reset();
    },
  });

  // Watch for class selection changes
  useEffect(() => {
    const classId = form.watch("class_id");
    if (classId) {
      setSelectedClassId(classId);
      // Reset section selection when class changes
      form.setValue("section_id", "");
      // Reset subject selection when class changes
      form.setValue("subject_id", "");
    }
  }, [form.watch("class_id")]);

  function onSubmit(values: OnlineClassFormValues) {
    if (!user) return;

    const formattedDate = format(values.date, "yyyy-MM-dd");
    
    createMutation.mutate({
      class_id: values.class_id,
      section_id: values.section_id,
      subject_id: values.subject_id,
      date: formattedDate,
      start_time: values.start_time,
      end_time: values.end_time || '',
      google_meet_link: values.google_meet_link,
      title: values.title,
      created_by: user.id,
    });
  }

  function generateMeetLink() {
    const googleMeetUrl = "https://meet.google.com/" + Math.random().toString(36).substring(2, 10);
    form.setValue("google_meet_link", googleMeetUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Schedule Online Class
          </DialogTitle>
          <DialogDescription>
            Fill out this form to schedule a new online class session.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Selection */}
              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class/Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classesLoading ? (
                          <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                        ) : classes.length === 0 ? (
                          <SelectItem value="no-classes" disabled>No classes found</SelectItem>
                        ) : (
                          classes.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section Selection */}
              <FormField
                control={form.control}
                name="section_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!selectedClassId ? (
                          <SelectItem value="select-class" disabled>Select a class first</SelectItem>
                        ) : sectionsLoading ? (
                          <SelectItem value="loading" disabled>Loading sections...</SelectItem>
                        ) : sections.length === 0 ? (
                          <SelectItem value="no-sections" disabled>No sections found</SelectItem>
                        ) : (
                          sections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Selection */}
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!selectedClassId ? (
                          <SelectItem value="select-class" disabled>Select a class first</SelectItem>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Class title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to auto-generate from subject and section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Date</FormLabel>
                    <DateSelector 
                      date={field.value} 
                      onDateChange={field.onChange} 
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time (Optional) */}
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Google Meet Link */}
            <FormField
              control={form.control}
              name="google_meet_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Meet Link</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="flex flex-1 items-center">
                        <Link className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://meet.google.com/..." {...field} />
                      </div>
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateMeetLink}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                <Video className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Scheduling..." : "Schedule Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

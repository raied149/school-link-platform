
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

  // Query for fetching classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses(),
  });

  // Query for fetching sections based on selected class
  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', selectedClassId],
    queryFn: () => selectedClassId ? sectionService.getSectionsByClassAndYear(selectedClassId, "default") : [],
    enabled: !!selectedClassId,
  });

  // Query for fetching subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects(),
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
    }
  }, [form.watch("class_id")]);

  function onSubmit(values: OnlineClassFormValues) {
    if (!user) return;

    const formattedDate = format(values.date, "yyyy-MM-dd");
    
    createMutation.mutate({
      ...values,
      date: formattedDate,
      created_by: user.id,
    });
  }

  function generateMeetLink() {
    const googleMeetUrl = "https://meet.google.com/" + Math.random().toString(36).substring(2, 10);
    form.setValue("google_meet_link", googleMeetUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
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
                        ) : (
                          classes?.map((classItem) => (
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
                        ) : sections?.length === 0 ? (
                          <SelectItem value="no-sections" disabled>No sections found</SelectItem>
                        ) : (
                          sections?.map((section) => (
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
                        {subjectsLoading ? (
                          <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                        ) : subjects?.length === 0 ? (
                          <SelectItem value="no-subjects" disabled>No subjects found</SelectItem>
                        ) : (
                          subjects?.map((subject) => (
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

              <div className="grid grid-cols-2 gap-4">
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
            </div>

            <DialogFooter>
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

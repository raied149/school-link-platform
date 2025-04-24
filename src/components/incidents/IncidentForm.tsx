
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Incident, IncidentSeverity, IncidentStatus, IncidentType, User } from "@/types";
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  subType: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  severity: z.string().min(1, "Severity is required"),
  status: z.string().min(1, "Status is required"),
  assignedTo: z.string().optional(),
  investigationNotes: z.string().optional(),
  resolutionDetails: z.string().optional(),
  resolutionDate: z.string().optional(),
});

interface IncidentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Incident, "id" | "createdAt" | "updatedAt" | "reportedBy" | "involvedPersons">) => void;
  incident: Incident | null;
  availableUsers: User[];
  currentUserId: string;
  mode: "create" | "edit";
}

export function IncidentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  incident,
  availableUsers,
  currentUserId,
  mode,
}: IncidentFormDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      location: "",
      type: "disciplinary",
      subType: "",
      description: "",
      severity: "medium",
      status: "reported",
      assignedTo: "",
      investigationNotes: "",
      resolutionDetails: "",
      resolutionDate: "",
    },
  });

  useEffect(() => {
    if (incident && mode === "edit") {
      form.reset({
        title: incident.title,
        date: incident.date,
        time: incident.time,
        location: incident.location,
        type: incident.type,
        subType: incident.subType || "",
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        assignedTo: incident.assignedTo || "",
        investigationNotes: incident.investigationNotes || "",
        resolutionDetails: incident.resolutionDetails || "",
        resolutionDate: incident.resolutionDate || "",
      });
    } else {
      form.reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        location: "",
        type: "disciplinary",
        subType: "",
        description: "",
        severity: "medium",
        status: "reported",
        assignedTo: "",
        investigationNotes: "",
        resolutionDetails: "",
        resolutionDate: "",
      });
    }
  }, [incident, mode, open, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      title: values.title,
      date: values.date,
      time: values.time,
      location: values.location,
      type: values.type as IncidentType,
      subType: values.subType || undefined,
      description: values.description,
      severity: values.severity as IncidentSeverity,
      status: values.status as IncidentStatus,
      assignedTo: values.assignedTo || undefined,
      investigationNotes: values.investigationNotes || undefined,
      resolutionDetails: values.resolutionDetails || undefined,
      resolutionDate: values.resolutionDate || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Report New Incident" : "Edit Incident"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Incident</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Incident</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Where did the incident occur?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Incident</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disciplinary">Disciplinary</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="bullying">Bullying</SelectItem>
                        <SelectItem value="it_issue">IT Issue</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Type (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Specific sub-category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about the incident"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="under_investigation">Under Investigation</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person to handle this incident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {availableUsers
                        .filter((user) => user.role === "admin" || user.role === "teacher")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("status") === "under_investigation" || 
              form.watch("status") === "resolved" || 
              form.watch("status") === "closed") && (
              <FormField
                control={form.control}
                name="investigationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investigation Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter investigation details"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(form.watch("status") === "resolved" || form.watch("status") === "closed") && (
              <>
                <FormField
                  control={form.control}
                  name="resolutionDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how the incident was resolved"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resolutionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="submit">
                {mode === "create" ? "Report Incident" : "Update Incident"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

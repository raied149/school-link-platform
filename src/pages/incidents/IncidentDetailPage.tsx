
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  MapPin,
  User as UserIcon,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IncidentFormDialog } from "@/components/incidents/IncidentForm";
import { InvolvedPersonSelector } from "@/components/incidents/InvolvedPersonSelector";
import { useToast } from "@/components/ui/use-toast";
import {
  getIncidentById,
  updateIncident,
  getIncidentSeverityInfo,
  getIncidentStatusLabel,
  getIncidentTypeLabel,
} from "@/services/incidentService";
import { Incident } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Mock users - in a real app, would come from a user service
const mockUsers = [
  { id: "t1", name: "John Smith", email: "john.smith@school.edu", role: "admin" },
  { id: "t2", name: "Maria Johnson", email: "maria.johnson@school.edu", role: "teacher" },
  { id: "t3", name: "Robert Brown", email: "robert.brown@school.edu", role: "teacher" },
  { id: "s1", name: "Alice Cooper", email: "alice.cooper@school.edu", role: "student" },
  { id: "s2", name: "Bob Davis", email: "bob.davis@school.edu", role: "student" },
  { id: "s3", name: "Charlie Evans", email: "charlie.evans@school.edu", role: "student" },
  { id: "s4", name: "Diana Foster", email: "diana.foster@school.edu", role: "student" },
];

export default function IncidentDetailPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openInvolvedPersons, setOpenInvolvedPersons] = useState(false);

  // Fetch incident details
  const { data: incident, refetch } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => {
      if (!incidentId) return null;
      return getIncidentById(incidentId);
    },
    enabled: !!incidentId,
  });

  // Update incident mutation
  const updateIncidentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Incident, "id" | "createdAt" | "updatedAt">> }) => 
      updateIncident(id, data),
    onSuccess: () => {
      toast({
        title: "Incident updated",
        description: "The incident has been successfully updated.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle editing an incident
  const handleIncidentSubmit = (data: Omit<Incident, "id" | "createdAt" | "updatedAt" | "reportedBy" | "involvedPersons">) => {
    if (incident && incidentId) {
      updateIncidentMutation.mutate({
        id: incidentId,
        data: {
          ...data,
          involvedPersons: incident.involvedPersons,
        },
      });
      setOpenEditForm(false);
    }
  };

  // Handle updating involved persons
  const handleUpdateInvolvedPersons = (persons: { userId: string; role: 'student' | 'teacher' | 'staff' | 'visitor' | 'other' }[]) => {
    if (incident && incidentId) {
      updateIncidentMutation.mutate({
        id: incidentId,
        data: {
          involvedPersons: persons,
        },
      });
    }
  };

  // Helper to get user name by ID
  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : "Unknown";
  };

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-72">
        <h2 className="text-xl font-semibold mb-2">Incident not found</h2>
        <p className="text-muted-foreground mb-4">The incident you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/incidents")}>Go to Incidents</Button>
      </div>
    );
  }

  const severityInfo = getIncidentSeverityInfo(incident.severity);
  const statusColor = 
    incident.status === "resolved" || incident.status === "closed"
      ? "bg-green-100 text-green-800"
      : incident.status === "under_investigation"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Button variant="ghost" onClick={() => navigate("/incidents")} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Incidents
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{incident.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={statusColor}>
                {getIncidentStatusLabel(incident.status)}
              </Badge>
              <Badge variant="outline" className={severityInfo.color}>
                {severityInfo.label} Severity
              </Badge>
              <Badge variant="outline">{getIncidentTypeLabel(incident.type)}</Badge>
              {incident.subType && <Badge variant="outline">{incident.subType}</Badge>}
            </div>
          </div>
          <Button onClick={() => setOpenEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Incident
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main incident details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Date of Incident</h4>
                    <p>{incident.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Time of Incident</h4>
                    <p>{incident.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p>{incident.location}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{incident.description}</p>
                </div>
              </div>

              {incident.investigationNotes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Investigation Notes</h4>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="whitespace-pre-wrap">{incident.investigationNotes}</p>
                    </div>
                  </div>
                </>
              )}

              {incident.resolutionDetails && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Resolution</h4>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="whitespace-pre-wrap">{incident.resolutionDetails}</p>
                      {incident.resolutionDate && (
                        <p className="text-sm text-muted-foreground mt-2">Resolved on: {incident.resolutionDate}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Involved Persons</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setOpenInvolvedPersons(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Manage
              </Button>
            </CardHeader>
            <CardContent>
              {incident.involvedPersons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No individuals have been added to this incident</p>
                  <Button variant="link" onClick={() => setOpenInvolvedPersons(true)}>
                    Add involved persons
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {incident.involvedPersons.map((person) => (
                    <Card key={person.userId} className="bg-muted/25 border-muted-foreground/20">
                      <CardContent className="p-4 flex items-start gap-3">
                        <UserIcon className="h-9 w-9 text-muted-foreground bg-muted p-1.5 rounded-full" />
                        <div>
                          <h4 className="font-medium">{getUserName(person.userId)}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{person.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with status and assignees */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-sm text-muted-foreground">Reported By</h4>
                  <p>{getUserName(incident.reportedBy)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-sm text-muted-foreground">Assigned To</h4>
                  <p>{incident.assignedTo ? getUserName(incident.assignedTo) : "Unassigned"}</p>
                </div>
              </div>

              {incident.status === "under_investigation" && (
                <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-blue-700">This incident is currently under investigation</p>
                </div>
              )}
              
              {(incident.status === "resolved" || incident.status === "closed") && (
                <div className="mt-4 p-3 rounded-md bg-green-50 border border-green-200 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-700">
                    This incident has been {incident.status === "resolved" ? "resolved" : "closed"}
                    {incident.resolutionDate && ` on ${incident.resolutionDate}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-l-2 border-muted pl-4 pb-1">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(incident.createdAt).toLocaleString()}</p>
              </div>
              {incident.createdAt !== incident.updatedAt && (
                <div className="border-l-2 border-muted pl-4 pb-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(incident.updatedAt).toLocaleString()}</p>
                </div>
              )}
              {incident.resolutionDate && (
                <div className="border-l-2 border-muted pl-4 pb-1">
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="font-medium">{incident.resolutionDate}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit incident dialog */}
      <IncidentFormDialog
        open={openEditForm}
        onOpenChange={setOpenEditForm}
        onSubmit={handleIncidentSubmit}
        incident={incident}
        availableUsers={mockUsers}
        currentUserId={user?.id || "t1"}
        mode="edit"
      />

      {/* Involved persons selector */}
      <InvolvedPersonSelector
        open={openInvolvedPersons}
        onOpenChange={setOpenInvolvedPersons}
        onSubmit={handleUpdateInvolvedPersons}
        availableUsers={mockUsers}
        existingPersons={incident.involvedPersons}
      />
    </div>
  );
}

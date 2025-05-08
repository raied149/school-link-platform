
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { IncidentFormDialog } from "@/components/incidents/IncidentForm";
import { IncidentDetail } from "@/components/incidents/IncidentDetail";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { 
  getIncidents, 
  createIncident, 
  updateIncident, 
  deleteIncident,
} from "@/services/incidentService";
import { Incident, User, IncidentStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// Mock users with valid UUIDs
const mockUsers: User[] = [
  { id: "123e4567-e89b-12d3-a456-426614174000", name: "John Smith", email: "john.smith@school.edu", role: "admin" },
  { id: "223e4567-e89b-12d3-a456-426614174001", name: "Maria Johnson", email: "maria.johnson@school.edu", role: "teacher" },
  { id: "323e4567-e89b-12d3-a456-426614174002", name: "Robert Brown", email: "robert.brown@school.edu", role: "teacher" },
  { id: "423e4567-e89b-12d3-a456-426614174003", name: "Alice Cooper", email: "alice.cooper@school.edu", role: "student" },
  { id: "523e4567-e89b-12d3-a456-426614174004", name: "Bob Davis", email: "bob.davis@school.edu", role: "student" },
  { id: "623e4567-e89b-12d3-a456-426614174005", name: "Charlie Evans", email: "charlie.evans@school.edu", role: "student" },
  { id: "723e4567-e89b-12d3-a456-426614174006", name: "Diana Foster", email: "diana.foster@school.edu", role: "student" },
];

export default function IncidentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [openIncidentForm, setOpenIncidentForm] = useState(false);
  const [openIncidentDetail, setOpenIncidentDetail] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | IncidentStatus>("all");
  const [deleteIncidentId, setDeleteIncidentId] = useState<string | null>(null);

  // Fetch incidents
  const { data: incidents = [], refetch } = useQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: (newIncident: Omit<Incident, "id" | "createdAt" | "updatedAt">) => 
      createIncident({
        ...newIncident,
        reportedBy: user?.id || "123e4567-e89b-12d3-a456-426614174000", // Use logged-in user or fallback to admin UUID
        involvedPersons: [], // In a real app, this would be selected
      }),
    onSuccess: () => {
      toast({
        title: "Incident reported",
        description: "The incident has been successfully reported.",
      });
      refetch();
      setOpenIncidentForm(false);
    },
    onError: (error) => {
      console.error("Error creating incident:", error);
      toast({
        title: "Error",
        description: "Failed to report incident. Please try again.",
        variant: "destructive",
      });
    },
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
      setOpenIncidentForm(false);
      setOpenIncidentDetail(false);
    },
    onError: (error) => {
      console.error("Error updating incident:", error);
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete incident mutation
  const deleteIncidentMutation = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      toast({
        title: "Incident deleted",
        description: "The incident has been successfully deleted.",
      });
      refetch();
      setOpenDeleteConfirm(false);
      setDeleteIncidentId(null);
    },
    onError: (error) => {
      console.error("Error deleting incident:", error);
      toast({
        title: "Error",
        description: "Failed to delete incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle creating/editing an incident
  const handleIncidentSubmit = (data: Omit<Incident, "id" | "createdAt" | "updatedAt" | "reportedBy" | "involvedPersons">) => {
    if (selectedIncident && selectedIncident.id) {
      updateIncidentMutation.mutate({
        id: selectedIncident.id,
        data: {
          ...data,
          involvedPersons: selectedIncident.involvedPersons,
        },
      });
    } else {
      console.log("Creating new incident with data:", data);
      createIncidentMutation.mutate({
        ...data,
        reportedBy: user?.id || "123e4567-e89b-12d3-a456-426614174000", // Use valid UUID here
        involvedPersons: [], // In a real app, this would be selected
      });
    }
  };

  // Filter incidents based on selected tab
  const filteredIncidents = selectedTab === "all" 
    ? incidents
    : incidents.filter(incident => incident.status === selectedTab);

  // Counts for tabs
  const incidentCounts = {
    all: incidents.length,
    reported: incidents.filter(i => i.status === "reported").length,
    under_investigation: incidents.filter(i => i.status === "under_investigation").length,
    resolved: incidents.filter(i => i.status === "resolved").length,
    closed: incidents.filter(i => i.status === "closed").length,
  };

  // Handle view incident details
  const handleViewIncident = (id: string) => {
    const incident = incidents.find(i => i.id === id);
    if (incident) {
      setSelectedIncident(incident);
      setOpenIncidentDetail(true);
    }
  };

  // Handle edit incident
  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setOpenIncidentForm(true);
    setOpenIncidentDetail(false);
  };

  // Handle delete incident
  const handleDeleteIncident = (id: string) => {
    setDeleteIncidentId(id);
    setOpenDeleteConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deleteIncidentId) {
      deleteIncidentMutation.mutate(deleteIncidentId);
    }
  };

  // Add new incident
  const handleAddIncident = () => {
    setSelectedIncident(null);
    setOpenIncidentForm(true);
  };

  // Update incident partial data
  const handleUpdateIncidentPartial = (id: string, data: Partial<Incident>) => {
    updateIncidentMutation.mutate({ id, data });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incident Management</h2>
          <p className="text-muted-foreground">
            Report, track, and manage school incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddIncident}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({incidentCounts.all})
          </TabsTrigger>
          <TabsTrigger value="reported">
            Reported ({incidentCounts.reported})
          </TabsTrigger>
          <TabsTrigger value="under_investigation">
            Investigating ({incidentCounts.under_investigation})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({incidentCounts.resolved})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({incidentCounts.closed})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="pt-4">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  <CardTitle className="text-xl">No incidents found</CardTitle>
                  <CardDescription>
                    {selectedTab === "all"
                      ? "There are no incidents reported in the system. Click 'Report Incident' to add a new one."
                      : `There are no incidents with '${selectedTab.replace('_', ' ')}' status.`}
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    {selectedTab === "all" && (
                      <Button onClick={handleAddIncident}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Report Incident
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <IncidentTable 
              incidents={filteredIncidents}
              onEdit={handleEditIncident}
              onDelete={handleDeleteIncident}
              onView={handleViewIncident}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Incident form dialog */}
      <IncidentFormDialog
        open={openIncidentForm}
        onOpenChange={setOpenIncidentForm}
        onSubmit={handleIncidentSubmit}
        incident={selectedIncident}
        availableUsers={mockUsers}
        currentUserId={user?.id || "123e4567-e89b-12d3-a456-426614174000"}
        mode={selectedIncident ? "edit" : "create"}
      />

      {/* Incident detail dialog */}
      <IncidentDetail
        open={openIncidentDetail}
        onOpenChange={setOpenIncidentDetail}
        incident={selectedIncident}
        availableUsers={mockUsers}
        onUpdate={handleUpdateIncidentPartial}
        onEdit={handleEditIncident}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
        title="Delete Incident"
        description="Are you sure you want to delete this incident? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isProcessing={deleteIncidentMutation.isPending}
      />
    </div>
  );
}


import { useState } from "react";
import { Incident, User } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getIncidentSeverityInfo, 
  getIncidentStatusLabel, 
  getIncidentTypeLabel 
} from "@/services/incidentService";

interface IncidentDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
  availableUsers: User[];
  onUpdate: (id: string, data: Partial<Incident>) => void;
  onEdit: (incident: Incident) => void;
}

export function IncidentDetail({
  open,
  onOpenChange,
  incident,
  availableUsers,
  onUpdate,
  onEdit,
}: IncidentDetailProps) {
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string | null>(null);
  
  if (!incident) return null;

  const severityInfo = getIncidentSeverityInfo(incident.severity);
  const statusColor = 
    incident.status === "resolved" || incident.status === "closed"
      ? "bg-green-100 text-green-800"
      : incident.status === "under_investigation"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  const handleUpdateStatus = () => {
    if (!newStatus && !notes.trim()) return;
    
    const updates: Partial<Incident> = {};
    
    if (newStatus) {
      updates.status = newStatus as any;
    }
    
    if (notes.trim()) {
      // Append new notes to existing notes if any
      const updatedNotes = incident.investigationNotes 
        ? `${incident.investigationNotes}\n\n${new Date().toLocaleString()}: ${notes}`
        : `${new Date().toLocaleString()}: ${notes}`;
      
      updates.investigationNotes = updatedNotes;
    }
    
    onUpdate(incident.id, updates);
    setNotes("");
    setNewStatus(null);
  };

  const reportedByUser = availableUsers.find(user => user.id === incident.reportedBy);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {incident.title}
            <Badge variant="outline" className={`ml-2 ${statusColor}`}>
              {getIncidentStatusLabel(incident.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Incident details */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                <p>{incident.date} at {incident.time}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p>{incident.location}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p>{getIncidentTypeLabel(incident.type)}</p>
                {incident.subType && <p className="text-sm text-muted-foreground">({incident.subType})</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Severity</h4>
                <Badge variant="outline" className={severityInfo.color}>{severityInfo.label}</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="whitespace-pre-wrap">{incident.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Reported By</h4>
              <p>{reportedByUser?.name || "Unknown"}</p>
            </div>
          </div>
          
          {/* Investigation notes */}
          {incident.investigationNotes && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Investigation Notes</h4>
              <div className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                {incident.investigationNotes}
              </div>
            </div>
          )}
          
          {/* Resolution details */}
          {incident.resolutionDetails && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Resolution</h4>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="whitespace-pre-wrap">{incident.resolutionDetails}</p>
                {incident.resolutionDate && (
                  <p className="text-sm text-muted-foreground mt-1">Resolved on: {incident.resolutionDate}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Update section */}
          {incident.status !== "closed" && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Update Incident</h4>
              
              <div>
                <label className="text-sm font-medium">Change Status</label>
                <Select
                  value={newStatus || incident.status}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Add Notes</label>
                <Textarea
                  placeholder="Enter new investigation notes or updates"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button onClick={handleUpdateStatus} disabled={!newStatus && !notes.trim()}>
                Save Updates
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(incident)}>
            Edit Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Incident } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  getIncidentSeverityInfo, 
  getIncidentStatusLabel, 
  getIncidentTypeLabel 
} from "@/services/incidentService";
import { FileEdit, MoreHorizontal, Search } from "lucide-react";

interface IncidentTableProps {
  incidents: Incident[];
  onEdit: (incident: Incident) => void;
  onDelete: (incidentId: string) => void;
  onView: (incidentId: string) => void;
}

export function IncidentTable({ incidents, onEdit, onDelete, onView }: IncidentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredIncidents = incidents.filter(incident => 
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getIncidentTypeLabel(incident.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No incidents found
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => {
                const severityInfo = getIncidentSeverityInfo(incident.severity);
                
                return (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => onView(incident.id)}
                      >
                        {incident.title}
                      </Button>
                    </TableCell>
                    <TableCell>{incident.date}</TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>{getIncidentTypeLabel(incident.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityInfo.color}>
                        {severityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        incident.status === "resolved" || incident.status === "closed"
                          ? "bg-green-100 text-green-800"
                          : incident.status === "under_investigation"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }>
                        {getIncidentStatusLabel(incident.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(incident.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(incident)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(incident.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

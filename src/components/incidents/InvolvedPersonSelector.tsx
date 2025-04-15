
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface InvolvedPerson {
  userId: string;
  role: 'student' | 'teacher' | 'staff' | 'visitor' | 'other';
}

interface InvolvedPersonSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (persons: InvolvedPerson[]) => void;
  availableUsers: User[];
  existingPersons?: InvolvedPerson[];
}

export function InvolvedPersonSelector({
  open,
  onOpenChange,
  onSubmit,
  availableUsers,
  existingPersons = [],
}: InvolvedPersonSelectorProps) {
  const [persons, setPersons] = useState<InvolvedPerson[]>(existingPersons);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPersonRole, setNewPersonRole] = useState<'student' | 'teacher' | 'staff' | 'visitor' | 'other'>('student');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const filteredUsers = availableUsers.filter(user => 
    !persons.some(person => person.userId === user.id) &&
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPerson = () => {
    if (selectedUserId) {
      const newPerson: InvolvedPerson = {
        userId: selectedUserId,
        role: newPersonRole,
      };
      setPersons([...persons, newPerson]);
      setSelectedUserId(null);
      setSearchTerm("");
    }
  };

  const handleRemovePerson = (userId: string) => {
    setPersons(persons.filter(person => person.userId !== userId));
  };

  const handleSave = () => {
    onSubmit(persons);
    onOpenChange(false);
  };

  const getUserName = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    return user ? user.name : "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Involved Persons</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search and add section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={selectedUserId || ""}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.length === 0 ? (
                    <SelectItem value="" disabled>No users found</SelectItem>
                  ) : (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Select
                value={newPersonRole}
                onValueChange={(value) => setNewPersonRole(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleAddPerson} disabled={!selectedUserId} className="w-full">
              Add Person
            </Button>
          </div>
          
          {/* Currently selected persons */}
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Persons</h4>
            {persons.length === 0 ? (
              <p className="text-muted-foreground text-sm">No persons added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {persons.map((person) => (
                  <Badge key={person.userId} variant="secondary" className="flex items-center gap-1">
                    {getUserName(person.userId)} ({person.role})
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemovePerson(person.userId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Users, ArrowRight } from 'lucide-react';
import { Class } from '@/types';
import { ClassFormDialog } from './ClassFormDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ClassesListProps {
  classes: Class[];
  yearId: string;
  isLoading: boolean;
  onCreateClass: (classData: Partial<Class>) => Promise<void>;
  onUpdateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
}

export function ClassesList({
  classes,
  yearId,
  isLoading,
  onCreateClass,
  onUpdateClass,
  onDeleteClass
}: ClassesListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSections = (classItem: Class) => {
    navigate(`/sections/${classItem.id}`);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveClass = async (classData: Partial<Class>) => {
    if (selectedClass) {
      await onUpdateClass(selectedClass.id, classData);
      setIsEditDialogOpen(false);
    } else {
      await onCreateClass(classData);
      setIsCreateDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedClass) {
      await onDeleteClass(selectedClass.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Classes</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            setSelectedClass(null);
            setIsCreateDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="border rounded-lg p-4 space-y-3 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{classItem.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Level: {classItem.level || "Not set"}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClass(classItem)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleViewSections(classItem)}
              >
                <Users className="mr-2 h-4 w-4" />
                View Sections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No classes found. Create your first class!</p>
        </div>
      )}

      <ClassFormDialog 
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
        onSave={handleSaveClass}
        classData={selectedClass}
        mode={selectedClass ? 'edit' : 'create'}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete ${selectedClass?.name}? This will also delete all sections and student assignments.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

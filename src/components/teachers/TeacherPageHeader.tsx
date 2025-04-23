
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Import } from 'lucide-react';
import { AddTeacherDialog } from '@/components/users/AddTeacherDialog';
import { ImportTeachersDialog } from '@/components/users/ImportTeachersDialog';

export const TeacherPageHeader = () => {
  const [showAddTeacherDialog, setShowAddTeacherDialog] = React.useState(false);
  const [isImportTeachersOpen, setIsImportTeachersOpen] = React.useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
        <p className="text-muted-foreground">
          Manage and view teacher information
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => setIsImportTeachersOpen(true)}
        >
          <Import className="mr-2 h-4 w-4" />
          Import from Excel
        </Button>
        <Button 
          onClick={() => setShowAddTeacherDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add Teacher
        </Button>
      </div>
      
      <AddTeacherDialog 
        open={showAddTeacherDialog} 
        onOpenChange={setShowAddTeacherDialog} 
      />
      <ImportTeachersDialog
        open={isImportTeachersOpen}
        onOpenChange={setIsImportTeachersOpen}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddTeacherDialog } from '@/components/users/AddTeacherDialog';

export const TeacherPageHeader = () => {
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Teacher Management</h1>
      <Button 
        onClick={() => setShowAddTeacherDialog(true)}
        className="flex items-center gap-2"
      >
        <UserPlus size={18} />
        Add Teacher
      </Button>
      
      <AddTeacherDialog 
        open={showAddTeacherDialog} 
        onOpenChange={setShowAddTeacherDialog} 
      />
    </div>
  );
};


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Class } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const gradeOptions = [
  'LKG',
  'UKG',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12'
];

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (classData: Partial<Class>) => Promise<void>;
  isSubmitting?: boolean;
  existingClass?: Class;
  mode?: 'create' | 'edit'; // Added mode prop
  classData?: Class; // Added classData prop for compatibility
}

export function ClassFormDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  isSubmitting = false, 
  existingClass, 
  mode: propMode,
  classData 
}: ClassFormDialogProps) {
  // Use either explicitly provided class data or existingClass
  const classToEdit = classData || existingClass;
  
  const [formData, setFormData] = useState<Partial<Class>>(
    classToEdit || { name: '', level: 1 }
  );
  const { toast } = useToast();
  
  // Determine mode from props or based on whether we have existing data
  const mode = propMode || (classToEdit ? 'edit' : 'create');

  const handleGradeChange = (value: string) => {
    const level = value === 'LKG' ? 0 : value === 'UKG' ? 0.5 : parseInt(value);
    const name = `Grade ${value}`;
    setFormData(prev => ({
      ...prev,
      level,
      name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Class name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onSave(formData);
      toast({
        title: `Class ${mode === 'create' ? 'Created' : 'Updated'}`,
        description: `${formData.name} has been ${mode === 'create' ? 'added' : 'updated'} successfully.`
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} class. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Class' : 'Edit Class'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Grade *</Label>
            <Select
              value={formData.level === 0 ? 'LKG' : formData.level === 0.5 ? 'UKG' : formData.level?.toString()}
              onValueChange={handleGradeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Class' : 'Update Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

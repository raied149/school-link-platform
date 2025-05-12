
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AcademicYear } from "@/types/academic-year";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface AcademicYearFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (yearData: Partial<AcademicYear>) => Promise<void>;
  yearData?: AcademicYear;
  mode?: 'create' | 'edit';
  existingYears?: AcademicYear[];
}

export function AcademicYearFormDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  yearData, 
  mode = 'create',
  existingYears = []
}: AcademicYearFormDialogProps) {
  const [formData, setFormData] = useState<Partial<AcademicYear>>(
    yearData || { 
      name: '', 
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
      isActive: false 
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or yearData changes
  useEffect(() => {
    if (open && yearData && mode === 'edit') {
      setFormData({
        ...yearData,
        startDate: yearData.startDate.substring(0, 10),
        endDate: yearData.endDate.substring(0, 10)
      });
    } else if (open && mode === 'create') {
      setFormData({ 
        name: '', 
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
        isActive: false 
      });
    }
  }, [open, yearData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Academic year name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.endDate) {
      toast({
        title: "Validation Error",
        description: "End date is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Validation Error",
        description: "Start date must be before end date",
        variant: "destructive"
      });
      return false;
    }
    
    // Check for name collision
    const nameExists = existingYears.some(
      year => year.name === formData.name && year.id !== (yearData?.id ?? '')
    );
    
    if (nameExists) {
      toast({
        title: "Validation Error",
        description: "An academic year with this name already exists",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await onSave(formData);
      toast({
        title: `Academic Year ${mode === 'create' ? 'Created' : 'Updated'}`,
        description: `${formData.name} has been ${mode === 'create' ? 'added' : 'updated'} successfully.`
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} academic year. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Academic Year' : 'Edit Academic Year'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Academic Year Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., 2023-2024"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive" 
              checked={formData.isActive} 
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="isActive">Set as Active Academic Year</Label>
          </div>
          
          {formData.isActive && existingYears.some(y => y.isActive && y.id !== (yearData?.id ?? '')) && (
            <p className="text-sm text-amber-500">
              Note: Setting this as active will deactivate the current active academic year.
            </p>
          )}
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Year' : 'Update Year'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

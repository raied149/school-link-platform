
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, Search, CalendarDays, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AcademicYear } from "@/types/academic-year";
import { academicYearService } from "@/services/academicYearService";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, isValid, parseISO } from 'date-fns';

const AcademicYearsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  
  // Fetch academic years
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearService.getAcademicYears
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (yearData: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>) => {
      return academicYearService.createAcademicYear(yearData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicYear> }) => {
      return academicYearService.updateAcademicYear(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return academicYearService.deleteAcademicYear(id);
    },
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      }
    }
  });
  
  // Filter academic years based on search term
  const filteredYears = academicYears.filter(y => 
    y.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handlers
  const handleCreateYear = async (yearData: Partial<AcademicYear>) => {
    await createMutation.mutateAsync(yearData as Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>);
  };
  
  const handleUpdateYear = async (yearData: Partial<AcademicYear>) => {
    if (selectedYear) {
      await updateMutation.mutateAsync({ id: selectedYear.id, data: yearData });
    }
  };
  
  const handleDeleteYear = async () => {
    if (selectedYear) {
      try {
        const result = await deleteMutation.mutateAsync(selectedYear.id);
        if (result) {
          toast({
            title: "Academic Year Deleted",
            description: `${selectedYear.name} has been deleted successfully.`
          });
        } else {
          toast({
            title: "Cannot Delete Active Year",
            description: "You cannot delete the active academic year.",
            variant: "destructive"
          });
        }
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete academic year. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleSetActive = async (year: AcademicYear) => {
    if (!year.isActive) {
      await updateMutation.mutateAsync({ 
        id: year.id, 
        data: { isActive: true } 
      });
      toast({
        title: "Active Year Updated",
        description: `${year.name} is now the active academic year.`
      });
    }
  };
  
  const openEditDialog = (year: AcademicYear) => {
    setSelectedYear(year);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (year: AcademicYear) => {
    setSelectedYear(year);
    setIsDeleteDialogOpen(true);
  };
  
  // Safely format dates with validation
  const formatDate = (dateString: string): string => {
    try {
      // Try to parse the date string
      const date = parseISO(dateString);
      
      // Validate the date is actually valid
      if (!isValid(date)) {
        return 'Invalid date';
      }
      
      // Format the valid date
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Academic Years</h2>
            <p className="text-muted-foreground">Manage all academic years in the system</p>
          </div>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search academic years..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : filteredYears.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredYears.map((year) => (
                  <tr key={year.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {year.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {formatDate(year.startDate)} - {formatDate(year.endDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {year.isActive ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="hover:bg-primary/10">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!year.isActive && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetActive(year)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Set Active
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(year)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(year)}
                          disabled={year.isActive}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No academic years found. Create your first academic year!</p>
          </div>
        )}
      </Card>
      
      {/* Create Dialog */}
      <AcademicYearFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateYear}
        mode="create"
        existingYears={academicYears}
      />
      
      {/* Edit Dialog */}
      {selectedYear && (
        <AcademicYearFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleUpdateYear}
          yearData={selectedYear}
          mode="edit"
          existingYears={academicYears}
        />
      )}
      
      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Academic Year"
        description={`Are you sure you want to delete ${selectedYear?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteYear}
        isProcessing={deleteMutation.isPending}
      />
    </div>
  );
};

export default AcademicYearsPage;

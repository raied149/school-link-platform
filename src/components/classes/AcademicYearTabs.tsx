
import { useNavigate } from "react-router-dom";
import { AcademicYear } from "@/types/academic-year";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Fragment, useState } from "react";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";

interface AcademicYearTabsProps {
  academicYears: AcademicYear[];
  selectedYearId?: string;
  onYearCreate: (year: Partial<AcademicYear>) => Promise<void>;
  isTeacherView?: boolean;
}

export function AcademicYearTabs({
  academicYears,
  selectedYearId,
  onYearCreate,
  isTeacherView = false,
}: AcademicYearTabsProps) {
  const navigate = useNavigate();
  const [isCreatingYear, setIsCreatingYear] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  
  const currentYear = academicYears.find(year => year.isActive);
  const selectedYear = selectedYearId 
    ? academicYears.find(year => year.id === selectedYearId) 
    : currentYear;

  const handleYearChange = (yearId: string) => {
    navigate(`/class-years/${yearId}`);
  };

  const gradeOptions = [
    { label: "LKG", value: "LKG" },
    { label: "UKG", value: "UKG" },
    { label: "Grade 1", value: "Grade 1" },
    { label: "Grade 2", value: "Grade 2" },
    { label: "Grade 3", value: "Grade 3" },
    { label: "Grade 4", value: "Grade 4" },
    { label: "Grade 5", value: "Grade 5" },
    { label: "Grade 6", value: "Grade 6" },
    { label: "Grade 7", value: "Grade 7" },
    { label: "Grade 8", value: "Grade 8" },
    { label: "Grade 9", value: "Grade 9" },
    { label: "Grade 10", value: "Grade 10" },
    { label: "Grade 11", value: "Grade 11" },
    { label: "Grade 12", value: "Grade 12" },
  ];

  const handleCreateClass = (gradeName: string) => {
    if (selectedYearId) {
      // Here you would call the createClass function with the selected grade
      const classData = {
        name: gradeName,
        academicYearId: selectedYearId
      };
      
      // Close the dialog
      setIsGradeDialogOpen(false);
      
      // You would implement this in the parent component and pass it as a prop
      // For now, we'll assume the parent has a function to create classes
      if (window.classService && window.classService.createClass) {
        window.classService.createClass(classData);
      } else {
        console.log("Creating class:", classData);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center justify-between mb-8">
      <h1 className="text-2xl font-bold tracking-tight">Class Years</h1>
      
      <div className="flex items-center space-x-2">
        {academicYears.length > 0 && (
          <Tabs value={selectedYearId || (currentYear?.id ?? "")} onValueChange={handleYearChange}>
            <TabsList>
              {academicYears.map((year) => (
                <TabsTrigger key={year.id} value={year.id} className="relative">
                  {year.name}
                  {year.isActive && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        {!isTeacherView && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingYear(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Year
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGradeDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Grade
            </Button>
          </>
        )}
      </div>

      {!isTeacherView && (
        <>
          <AcademicYearFormDialog
            open={isCreatingYear}
            onOpenChange={setIsCreatingYear}
            onSave={onYearCreate}
            existingYears={academicYears}
          />
          
          <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Grade</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {gradeOptions.map((grade) => (
                  <Button
                    key={grade.value}
                    variant="outline"
                    className="justify-center w-full"
                    onClick={() => handleCreateClass(grade.value)}
                  >
                    {grade.label}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}


import { useNavigate } from "react-router-dom";
import { AcademicYear } from "@/types/academic-year";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Fragment, useState } from "react";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";

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
  
  const currentYear = academicYears.find(year => year.isActive);
  const selectedYear = selectedYearId 
    ? academicYears.find(year => year.id === selectedYearId) 
    : currentYear;

  const handleYearChange = (yearId: string) => {
    navigate(`/class-years/${yearId}`);
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingYear(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Year
          </Button>
        )}
      </div>

      {!isTeacherView && (
        <AcademicYearFormDialog
          open={isCreatingYear}
          onOpenChange={setIsCreatingYear}
          onSave={onYearCreate}
          existingYears={academicYears}
        />
      )}
    </div>
  );
}


import { useNavigate } from "react-router-dom";
import { AcademicYear } from "@/types/academic-year";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Fragment, useState } from "react";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Get index of selected year to enable navigation buttons
  const selectedIndex = selectedYear 
    ? academicYears.findIndex(year => year.id === selectedYear.id)
    : -1;
  
  const handlePreviousYear = () => {
    if (selectedIndex > 0) {
      navigate(`/class-years/${academicYears[selectedIndex - 1].id}`);
    }
  };

  const handleNextYear = () => {
    if (selectedIndex < academicYears.length - 1) {
      navigate(`/class-years/${academicYears[selectedIndex + 1].id}`);
    }
  };

  const handleYearChange = (yearId: string) => {
    navigate(`/class-years/${yearId}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="hidden sm:inline h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Academic Years</h2>
      </div>

      <div className="flex items-center justify-end gap-4 w-full md:w-auto">
        {academicYears.length > 0 ? (
          <div className="flex items-center bg-muted rounded-md overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={handlePreviousYear}
              disabled={selectedIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center border-x border-border px-2 h-9">
              {selectedYear && (
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      selectedYear.isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : ''
                    }`}
                  >
                    {selectedYear.name}
                    {selectedYear.isActive && (
                      <span className="ml-1 text-[0.65rem] bg-blue-700 text-white rounded-full px-1.5 py-0.5">
                        Current
                      </span>
                    )}
                  </span>
                  
                  <Select value={selectedYear.id} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[120px] border-0 bg-transparent h-7">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                          {year.isActive && " (Current)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={handleNextYear}
              disabled={selectedIndex >= academicYears.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm italic">No academic years available</div>
        )}

        {!isTeacherView && (
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap ml-2"
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

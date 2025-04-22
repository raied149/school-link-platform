
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicYear } from "@/types/academic-year";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";

interface AcademicYearTabsProps {
  academicYears: AcademicYear[];
  selectedYearId?: string;
  onYearCreate: (yearData: Partial<AcademicYear>) => Promise<void>;
}

export function AcademicYearTabs({ academicYears, selectedYearId, onYearCreate }: AcademicYearTabsProps) {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Class Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>
      
      <Tabs
        value={selectedYearId || ""}
        className="w-full"
        onValueChange={value => navigate(`/classes/${value}`)}
      >
        <TabsList className="w-full flex gap-2 justify-start">
          {academicYears.map((year) => (
            <TabsTrigger
              key={year.id}
              value={year.id}
              className="min-w-[150px]"
            >
              {year.name}
              {year.isActive && (
                <span className="ml-1 text-xs text-green-600">(Active)</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <AcademicYearFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={onYearCreate}
        mode="create"
        existingYears={academicYears}
      />
    </div>
  );
}

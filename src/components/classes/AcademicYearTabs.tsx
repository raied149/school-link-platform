
import { useNavigate } from "react-router-dom";
import { AcademicYear } from "@/types/academic-year";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
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

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="hidden sm:inline h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Academic Years</h2>
      </div>

      <div className="flex items-center gap-4">
        <Tabs value={selectedYearId} className="w-full">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap max-w-2xl">
            {academicYears.length === 0 ? (
              <TabsTrigger
                value="no-years"
                className="flex-1 opacity-50 cursor-not-allowed"
                disabled
              >
                No Academic Years
              </TabsTrigger>
            ) : (
              <Fragment>
                {academicYears.map((year) => (
                  <TabsTrigger
                    key={year.id}
                    value={year.id}
                    onClick={() => navigate(`/class-years/${year.id}`)}
                    className={
                      year.isActive
                        ? "border-2 border-primary text-primary font-medium"
                        : ""
                    }
                  >
                    {year.name}
                    {year.isActive && (
                      <span className="ml-1 text-[0.65rem] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                        Current
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </Fragment>
            )}
          </TabsList>
        </Tabs>

        {!isTeacherView && (
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
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

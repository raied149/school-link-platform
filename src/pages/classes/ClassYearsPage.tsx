
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { academicYearService } from "@/services/academicYearService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassesPage from "./ClassesPage";

export default function ClassYearsPage() {
  const navigate = useNavigate();
  const { yearId } = useParams<{ yearId: string }>();
  
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearService.getAcademicYears
  });
  
  // Find the active academic year
  const activeYear = academicYears.find(year => year.isActive);
  
  // If no yearId is provided in URL but we have years, redirect to the active year or first year
  const defaultYearId = activeYear?.id || academicYears[0]?.id;
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </Card>
      </div>
    );
  }

  if (!yearId && defaultYearId) {
    navigate(`/classes/${defaultYearId}`);
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs 
        value={yearId || defaultYearId}
        className="w-full"
        onValueChange={(value) => navigate(`/classes/${value}`)}
      >
        <TabsList className="w-full justify-start">
          {academicYears.map((year) => (
            <TabsTrigger 
              key={year.id} 
              value={year.id}
              className="min-w-[150px]"
            >
              {year.name}
              {year.isActive && " (Active)"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {yearId && <ClassesPage />}
    </div>
  );
}

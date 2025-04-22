
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { academicYearService } from "@/services/academicYearService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassesPage from "./ClassesPage";

export default function ClassYearsPage() {
  const navigate = useNavigate();
  
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearService.getAcademicYears
  });
  
  // Find the active academic year
  const activeYear = academicYears.find(year => year.isActive);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs 
        defaultValue={activeYear?.id} 
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
      
      <ClassesPage />
    </div>
  );
}

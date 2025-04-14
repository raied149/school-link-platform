
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { academicYearService } from "@/services/academicYearService";
import { AcademicYearFormDialog } from "@/components/academic/AcademicYearFormDialog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const ClassYearsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch academic years
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: academicYearService.getAcademicYears
  });

  // Filter academic years based on search term
  const filteredYears = academicYears.filter(y => 
    y.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateYear = async (yearData: any) => {
    // This will be handled by the AcademicYearFormDialog
    setIsCreateDialogOpen(false);
  };

  const navigateToClasses = (yearId: string) => {
    navigate(`/classes/${yearId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Academic Year
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Select an Academic Year</h2>
            <p className="text-muted-foreground">View and manage classes for a specific academic year</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredYears.map((year) => (
              <Card 
                key={year.id} 
                className="p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => navigateToClasses(year.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">{year.name}</h3>
                  </div>
                  {year.isActive && (
                    <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {formatDate(year.startDate)} - {formatDate(year.endDate)}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToClasses(year.id);
                  }}
                >
                  View Classes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            ))}
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
    </div>
  );
};

export default ClassYearsPage;

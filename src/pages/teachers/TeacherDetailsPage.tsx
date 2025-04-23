
import { Card } from "@/components/ui/card";
import { TeacherPageHeader } from "@/components/teachers/TeacherPageHeader";
import { TeacherTable } from "@/components/users/TeacherTable";
import { useState } from "react";
import { TeacherSearch } from "@/components/users/TeacherSearch";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { ImportTeachersDialog } from "@/components/users/ImportTeachersDialog";

const TeacherDetailsPage = () => {
  const [searchFilters, setSearchFilters] = useState({
    idSearch: "",
    nameSearch: "",
    globalSearch: ""
  });
  
  const [isImportTeachersOpen, setIsImportTeachersOpen] = useState(false);
  
  const handleSearch = (filters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  }) => {
    setSearchFilters(filters);
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader />

      <Card className="p-6">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => setIsImportTeachersOpen(true)}>
            <Import className="mr-2 h-4 w-4" />
            Import from Excel
          </Button>
        </div>
        
        <div className="space-y-4">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherTable searchFilters={searchFilters} />
        </div>
      </Card>
      
      <ImportTeachersDialog
        open={isImportTeachersOpen}
        onOpenChange={setIsImportTeachersOpen}
      />
    </div>
  );
};

export default TeacherDetailsPage;

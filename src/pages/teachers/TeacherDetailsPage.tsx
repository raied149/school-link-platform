
import { Card } from "@/components/ui/card";
import { TeacherPageHeader } from "@/components/teachers/TeacherPageHeader";
import { TeacherTable } from "@/components/users/TeacherTable";
import { useState } from "react";
import { TeacherSearch } from "@/components/users/TeacherSearch";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddTeacherDialog } from "@/components/users/AddTeacherDialog";

const TeacherDetailsPage = () => {
  const [searchFilters, setSearchFilters] = useState({
    idSearch: "",
    nameSearch: "",
    globalSearch: ""
  });
  
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Teacher Details</h2>
            <p className="text-muted-foreground">
              Manage and view teacher information
            </p>
          </div>
          <Button onClick={() => setIsAddTeacherOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>
        
        <div className="space-y-4">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherTable searchFilters={searchFilters} />
        </div>
      </Card>
      
      <AddTeacherDialog
        open={isAddTeacherOpen}
        onOpenChange={setIsAddTeacherOpen}
      />
    </div>
  );
};

export default TeacherDetailsPage;

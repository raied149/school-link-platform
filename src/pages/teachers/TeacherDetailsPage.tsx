
import { Card } from "@/components/ui/card";
import { TeacherPageHeader } from "@/components/teachers/TeacherPageHeader";
import { TeacherTable } from "@/components/users/TeacherTable";
import { useState } from "react";
import { TeacherSearch } from "@/components/users/TeacherSearch";

const TeacherDetailsPage = () => {
  const [searchFilters, setSearchFilters] = useState({
    idSearch: "",
    nameSearch: "",
    globalSearch: ""
  });
  
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
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Teacher Details</h2>
          <p className="text-muted-foreground">
            Manage and view teacher information
          </p>
        </div>
        
        <div className="space-y-4">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherTable searchFilters={searchFilters} />
        </div>
      </Card>
    </div>
  );
};

export default TeacherDetailsPage;

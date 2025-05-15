
import { Card } from "@/components/ui/card";
import { TeacherPageHeader } from "@/components/teachers/TeacherPageHeader";
import TeacherTable from "@/components/users/TeacherTable";
import { useState } from "react";
import { TeacherSearch } from "@/components/users/TeacherSearch";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDetailsPage = () => {
  const [searchFilters, setSearchFilters] = useState({
    idSearch: "",
    nameSearch: "",
    globalSearch: ""
  });
  
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const handleSearch = (filters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  }) => {
    setSearchFilters(filters);
  };

  return (
    <div className="space-y-6">
      {!isTeacher && <TeacherPageHeader />}
      {isTeacher && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Information</h1>
          <p className="text-muted-foreground">
            View teacher information
          </p>
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherTable 
            searchFilters={searchFilters} 
            isTeacherView={isTeacher}
          />
        </div>
      </Card>
    </div>
  );
};

export default TeacherDetailsPage;

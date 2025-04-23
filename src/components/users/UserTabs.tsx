
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { StudentTable } from "./StudentTable";
import { TeacherTable } from "./TeacherTable";
import { StudentSearch } from "./StudentSearch";
import { TeacherSearch } from "./TeacherSearch";

interface UserTabsProps {
  defaultTab: "students" | "teachers";
  showStudentsOnly?: boolean;
  showTeachersOnly?: boolean;
}

export function UserTabs({ 
  defaultTab = "students",
  showStudentsOnly = false,
  showTeachersOnly = false 
}: UserTabsProps) {
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
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-4">
        {!showTeachersOnly && (
          <TabsTrigger value="students" className="flex-1">
            Students
          </TabsTrigger>
        )}
        {!showStudentsOnly && (
          <TabsTrigger value="teachers" className="flex-1">
            Teachers
          </TabsTrigger>
        )}
      </TabsList>
      
      {!showTeachersOnly && (
        <TabsContent value="students" className="space-y-4">
          <StudentSearch onSearch={handleSearch} />
          <StudentTable searchFilters={searchFilters} />
        </TabsContent>
      )}
      
      {!showStudentsOnly && (
        <TabsContent value="teachers">
          <TeacherSearch onSearch={handleSearch} />
          <TeacherTable searchFilters={searchFilters} />
        </TabsContent>
      )}
    </Tabs>
  );
}

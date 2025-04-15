
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "./StudentTable";
import { StudentSearch } from "./StudentSearch";
import { TeacherTable } from "./TeacherTable";
import { useState } from "react";

export function UserTabs() {
  const [searchFilters, setSearchFilters] = useState({
    idSearch: "",
    nameSearch: "",
    globalSearch: "",
  });

  return (
    <Tabs defaultValue="students" className="w-full">
      <TabsList>
        <TabsTrigger value="students">Student Details</TabsTrigger>
        <TabsTrigger value="teachers">Teacher Details</TabsTrigger>
      </TabsList>
      <TabsContent value="students">
        <StudentSearch onSearch={setSearchFilters} />
        <StudentTable searchFilters={searchFilters} />
      </TabsContent>
      <TabsContent value="teachers">
        <TeacherTable />
      </TabsContent>
    </Tabs>
  );
}

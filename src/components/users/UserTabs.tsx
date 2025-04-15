
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "./StudentTable";
import { StudentSearch } from "./StudentSearch";
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
      </TabsList>
      <TabsContent value="students">
        <StudentSearch onSearch={setSearchFilters} />
        <StudentTable searchFilters={searchFilters} />
      </TabsContent>
    </Tabs>
  );
}

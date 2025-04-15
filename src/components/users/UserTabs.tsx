
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { StudentTable } from "./StudentTable";
import { TeacherTable } from "./TeacherTable";
import { Input } from "@/components/ui/input";

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
  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  
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
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search by ID"
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              className="max-w-[200px]"
            />
            <Input
              placeholder="Search by Name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="max-w-[200px]"
            />
            <Input
              placeholder="Global Search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
          </div>
          <StudentTable
            searchFilters={{ idSearch, nameSearch, globalSearch }}
          />
        </TabsContent>
      )}
      
      {!showStudentsOnly && (
        <TabsContent value="teachers">
          <TeacherTable />
        </TabsContent>
      )}
    </Tabs>
  );
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "./StudentTable";
import { StudentSearch } from "./StudentSearch";

export function UserTabs() {
  return (
    <Tabs defaultValue="students" className="w-full">
      <TabsList>
        <TabsTrigger value="students">Student Details</TabsTrigger>
      </TabsList>
      <TabsContent value="students">
        <StudentSearch />
        <StudentTable />
      </TabsContent>
    </Tabs>
  );
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "./StudentTable";

export function UserTabs() {
  return (
    <Tabs defaultValue="students" className="w-full">
      <TabsList>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
      </TabsList>
      <TabsContent value="students">
        <StudentTable />
      </TabsContent>
      <TabsContent value="teachers">
        <div className="text-muted-foreground">Teacher management coming soon...</div>
      </TabsContent>
    </Tabs>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, Calendar, Filter } from "lucide-react";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data
const mockExams = [
  {
    id: "e1",
    name: "Mid-term Examination",
    type: "exam",
    classes: ["class1", "class2"],
    sections: ["sec1", "sec2"],
    subjects: ["sub1", "sub2"],
    maxMarks: 100,
    date: new Date("2025-06-15").toISOString(),
    status: "upcoming",
    createdAt: new Date("2025-04-01").toISOString(),
    updatedAt: new Date("2025-04-01").toISOString(),
  },
  {
    id: "t1",
    name: "Unit Test 1",
    type: "test",
    classes: ["class1"],
    sections: ["sec1"],
    subjects: ["sub1"],
    maxMarks: 50,
    date: new Date("2025-05-05").toISOString(),
    status: "upcoming",
    createdAt: new Date("2025-04-01").toISOString(),
    updatedAt: new Date("2025-04-01").toISOString(),
  },
  {
    id: "t2",
    name: "Unit Test 2",
    type: "test",
    classes: ["class3"],
    sections: ["sec3"],
    subjects: ["sub3"],
    maxMarks: 30,
    date: new Date("2025-04-20").toISOString(),
    status: "completed",
    createdAt: new Date("2025-03-15").toISOString(),
    updatedAt: new Date("2025-04-20").toISOString(),
  },
];

const ExamsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Filter exams based on tab and status
  const filteredExams = mockExams.filter(exam => {
    const matchesTab = activeTab === "all" || exam.type === activeTab;
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesTab && matchesStatus;
  });

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case 'ongoing':
        return <Badge className="bg-amber-500">Ongoing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tests & Exams</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <TestExamFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
              <TabsTrigger value="exam">Exams</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length > 0 ? (
                  filteredExams.map(exam => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell className="capitalize">{exam.type}</TableCell>
                      <TableCell>{format(new Date(exam.date), "PPP")}</TableCell>
                      <TableCell>{exam.maxMarks}</TableCell>
                      <TableCell>{renderStatusBadge(exam.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/exams/${exam.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No {activeTab === "all" ? "tests or exams" : activeTab === "test" ? "tests" : "exams"} found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="test" className="m-0">
            {/* Same table structure as "all" but filtered for tests */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length > 0 ? (
                  filteredExams.map(test => (
                    <TableRow key={test.id}>
                      <TableCell>{test.name}</TableCell>
                      <TableCell>{format(new Date(test.date), "PPP")}</TableCell>
                      <TableCell>{test.maxMarks}</TableCell>
                      <TableCell>{renderStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/exams/${test.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No tests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="exam" className="m-0">
            {/* Same table structure as "all" but filtered for exams */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length > 0 ? (
                  filteredExams.map(exam => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{format(new Date(exam.date), "PPP")}</TableCell>
                      <TableCell>{exam.maxMarks}</TableCell>
                      <TableCell>{renderStatusBadge(exam.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/exams/${exam.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No exams found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ExamsPage;

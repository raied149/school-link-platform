
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download } from "lucide-react";
import { mockStudents } from "@/mocks/data";

const StudentAttendancePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track student attendance records
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>April 15th, 2025</span>
            </div>
            <Select defaultValue="grade-1">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-grades">All Grades</SelectItem>
                <SelectItem value="grade-1">Grade 1</SelectItem>
                <SelectItem value="grade-2">Grade 2</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="section-a">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sections">All Sections</SelectItem>
                <SelectItem value="section-a">Section A</SelectItem>
                <SelectItem value="section-b">Section B</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-[300px]"
              placeholder="Search students..."
              type="search"
            />
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium">Student ID</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Grade</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Section</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="p-4">{student.id}</td>
                  <td className="p-4">{student.name}</td>
                  <td className="p-4">Grade 1</td>
                  <td className="p-4">Section A</td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-gray-50 text-gray-600">Not marked</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700">Present</Button>
                      <Button size="sm" variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">Absent</Button>
                      <Button size="sm" variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700">Late</Button>
                      <Button size="sm" variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700">Leave</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentAttendancePage;

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
import { CalendarIcon, Download, LogIn } from "lucide-react";

const TeacherAttendancePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Attendance</h1>
          <p className="text-muted-foreground">
            Manage and track teacher attendance records
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
              placeholder="Search teachers..."
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
                <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Check In</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Check Out</th>
                <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b">
                  <td className="p-4">{teacher.name}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-green-50 text-green-600">present</Badge>
                  </td>
                  <td className="p-4">23:58</td>
                  <td className="p-4">-</td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" className="text-purple-600 hover:text-purple-700">
                      <LogIn className="mr-2 h-4 w-4" />
                      Check Out
                    </Button>
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

export default TeacherAttendancePage;

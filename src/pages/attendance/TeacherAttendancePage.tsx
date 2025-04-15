
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
import { mockTeachers } from "@/mocks/data";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const TeacherAttendancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  const [teacherAttendance, setTeacherAttendance] = useState<Record<string, {
    status: 'present' | 'absent' | 'not-marked',
    checkIn: string | null,
    checkOut: string | null
  }>>(() => {
    const initialAttendance: Record<string, any> = {};
    mockTeachers.forEach(teacher => {
      initialAttendance[teacher.id] = {
        status: 'not-marked',
        checkIn: null,
        checkOut: null
      };
    });
    return initialAttendance;
  });

  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        teacher.professionalDetails.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "present" && teacherAttendance[teacher.id].status === "present") ||
                         (statusFilter === "absent" && teacherAttendance[teacher.id].status === "absent");
    
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (teacherId: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status: 'present',
        checkIn: formattedTime
      }
    }));
    
    toast({
      title: "Check-in recorded",
      description: `Teacher checked in at ${formattedTime}`,
    });
  };

  const handleCheckOut = (teacherId: string) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        checkOut: formattedTime
      }
    }));
    
    toast({
      title: "Check-out recorded",
      description: `Teacher checked out at ${formattedTime}`,
    });
  };

  const handleMarkAbsent = (teacherId: string) => {
    setTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: {
        status: 'absent',
        checkIn: null,
        checkOut: null
      }
    }));
    
    toast({
      title: "Attendance updated",
      description: "Teacher marked as absent for today",
    });
  };

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
            <Select defaultValue="all" onValueChange={setStatusFilter}>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-b">
                  <td className="p-4">{teacher.name}</td>
                  <td className="p-4">
                    {teacherAttendance[teacher.id].status === 'present' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600">Present</Badge>
                    ) : teacherAttendance[teacher.id].status === 'absent' ? (
                      <Badge variant="outline" className="bg-red-50 text-red-600">Absent</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">Not marked</Badge>
                    )}
                  </td>
                  <td className="p-4">{teacherAttendance[teacher.id].checkIn || "-"}</td>
                  <td className="p-4">{teacherAttendance[teacher.id].checkOut || "-"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {teacherAttendance[teacher.id].status !== 'present' ? (
                        <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleCheckIn(teacher.id)}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      ) : !teacherAttendance[teacher.id].checkOut ? (
                        <Button size="sm" variant="outline" className="text-purple-600 hover:text-purple-700" onClick={() => handleCheckOut(teacher.id)}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Check Out
                        </Button>
                      ) : null}
                      {teacherAttendance[teacher.id].status !== 'absent' && (
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleMarkAbsent(teacher.id)}>
                          Absent
                        </Button>
                      )}
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

export default TeacherAttendancePage;

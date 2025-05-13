import React from 'react';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Eye } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherTableProps {
  searchFilters: {
    idSearch: string;
    nameSearch: string;
    globalSearch: string;
  };
  isTeacherView?: boolean;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  searchFilters,
  isTeacherView = false
}) => {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  const teachers = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      status: "active",
      role: "teacher",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "inactive",
      role: "teacher",
    },
    {
      id: "3",
      name: "David Johnson",
      email: "david.johnson@example.com",
      status: "active",
      role: "teacher",
    },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const idMatches = teacher.id.toLowerCase().includes(searchFilters.idSearch.toLowerCase());
    const nameMatches = teacher.name.toLowerCase().includes(searchFilters.nameSearch.toLowerCase());
    const globalMatches =
      teacher.name.toLowerCase().includes(searchFilters.globalSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchFilters.globalSearch.toLowerCase());

    return idMatches && nameMatches && globalMatches;
  });

  const handleEditTeacher = (teacher: any) => {
    navigate(`/teachers/${teacher.id}/edit`);
  };

  const handleDeleteClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // deleteTeacher(selectedTeacher.id);
    setDeleteDialogOpen(false);
  };

  const handleViewTeacher = (teacherId: string) => {
    navigate(`/teachers/${teacherId}`);
  };

  const isCurrentUser = (teacherId: string) => {
    return user?.id === teacherId;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            {!isTeacherView && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.id}</TableCell>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.email}</TableCell>
              <TableCell>
                <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                  {teacher.status}
                </Badge>
              </TableCell>
            {!isTeacherView && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewTeacher(teacher.id)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  
                  {!isTeacherView && !isCurrentUser(teacher.id) && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTeacher(teacher)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(teacher)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default TeacherTable;

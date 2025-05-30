
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, CalendarDays, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Link, useNavigate } from "react-router-dom";
import { TestExamFormDialog } from "@/components/exams/TestExamFormDialog";
import { getAllExams } from "@/services/exam/examApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const ExamsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isStudent = user?.role === 'student';

  // Fetch exams
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: getAllExams
  });

  // Filter exams based on search term
  const filteredExams = exams && Array.isArray(exams) ? exams.filter((exam: any) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleDialogOpenChange = (success: boolean) => {
    setExamDialogOpen(false);
    
    // Show success message if exam was created successfully
    if (success) {
      toast({
        title: "Success",
        description: "Exam was created successfully",
      });
    }
  };

  const handleExamClick = (examId: string) => {
    navigate(`/exams/${examId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        {!isStudent && (
          <Button onClick={() => setExamDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Exam
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Exams</h2>
            <p className="text-muted-foreground">Manage all exams in the system</p>
          </div>
          <div className="w-72">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : filteredExams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Subject</th>
                  <th className="text-left py-3 px-4">Max Score</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr 
                    key={exam.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleExamClick(exam.id)}
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {exam.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {formatDate(exam.date)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {exam.subjects?.name}
                    </td>
                    <td className="py-3 px-4">
                      {exam.max_score}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExamClick(exam.id);
                        }}
                      >
                        <Edit size={16} className="mr-1" />
                        View / Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exams found. Create your first exam!</p>
          </div>
        )}
      </Card>
      
      {/* Form Dialogs - Only render if user is not a student */}
      {!isStudent && (
        <TestExamFormDialog
          open={examDialogOpen}
          onOpenChange={(success) => handleDialogOpenChange(success)}
        />
      )}
    </div>
  );
};

export default ExamsPage;

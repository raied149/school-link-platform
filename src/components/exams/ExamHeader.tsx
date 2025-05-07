
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Users, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ExamHeaderProps {
  exam: any;
  assignments: any[];
  className: string | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const ExamHeader = ({ 
  exam, 
  assignments, 
  className, 
  onEditClick, 
  onDeleteClick 
}: ExamHeaderProps) => {
  // Helper function to determine exam status based on date
  const getExamStatus = () => {
    const today = new Date();
    const examDate = new Date(exam.date);
    
    if (examDate > today) return 'upcoming';
    if (examDate < today) return 'completed';
    return 'ongoing';
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button variant="destructive" onClick={onDeleteClick}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <Badge className="mr-3">
              {exam.subjects?.name || 'No Subject'}
            </Badge>
            <Badge className={`
              ${getExamStatus() === 'upcoming' ? 'bg-blue-500' : 
                getExamStatus() === 'ongoing' ? 'bg-amber-500' : 
                'bg-green-500'}
            `}>
              {getExamStatus().charAt(0).toUpperCase() + getExamStatus().slice(1)}
            </Badge>
            {className && (
              <Badge className="ml-2 bg-purple-500">
                Class: {className}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>Date: {format(new Date(exam.date), "PPP")}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span>Max Marks: {exam.max_score}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {assignments && assignments.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                Assigned to {assignments.length} section(s)
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>
              Created: {format(new Date(exam.created_at), "PPP")}
            </span>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
    </>
  );
};

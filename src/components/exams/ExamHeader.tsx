
import { Button } from "@/components/ui/button";
import { format, isPast, isFuture, isToday } from "date-fns";
import { BookOpen, CalendarDays, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExamHeaderProps {
  exam: {
    id: string;
    name: string;
    date: string;
    max_score: number;
    subject_id?: string;
    subjects?: {
      name: string;
      code: string;
    };
  };
  onEditClick: () => void;
  isStudentView?: boolean;
}

export function ExamHeader({ exam, onEditClick, isStudentView = false }: ExamHeaderProps) {
  const examDate = new Date(exam.date);
  const isPastExam = isPast(examDate);
  const isFutureExam = isFuture(examDate);
  const isTodayExam = isToday(examDate);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">{exam.name}</h1>
          {isPastExam ? (
            <Badge variant="outline" className="bg-muted text-muted-foreground">Completed</Badge>
          ) : isFutureExam ? (
            <Badge variant="outline" className="bg-primary/10 text-primary">Upcoming</Badge>
          ) : isTodayExam ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">Today</Badge>
          ) : null}
        </div>
        <div className="mt-1 flex flex-col sm:flex-row gap-1 sm:gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>{format(examDate, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Subject:</span>
            <span className="font-medium">{exam.subjects?.name || "No Subject"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Max Score:</span>
            <span className="font-medium">{exam.max_score}</span>
          </div>
        </div>
      </div>
      
      {!isStudentView && (
        <Button variant="outline" onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Exam
        </Button>
      )}
    </div>
  );
}

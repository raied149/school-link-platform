
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Create a simpler student type with just the properties we need
interface SimpleStudentInfo {
  name: string;
  admissionNumber: string;
}

interface TestResultFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: SimpleStudentInfo;
  maxMarks: number;
  testName: string;
  onSave: (marks: number, feedback: string) => void;
  initialMarks?: number;
  initialFeedback?: string;
}

export function TestResultFormDialog({ 
  open, 
  onOpenChange, 
  student, 
  maxMarks, 
  testName,
  onSave,
  initialMarks = 0,
  initialFeedback = ""
}: TestResultFormDialogProps) {
  const { toast } = useToast();
  const [marks, setMarks] = useState(initialMarks);
  const [feedback, setFeedback] = useState(initialFeedback);

  const handleSubmit = () => {
    if (marks < 0 || marks > maxMarks) {
      toast({
        title: "Invalid marks",
        description: `Please enter marks between 0 and ${maxMarks}.`,
        variant: "destructive",
      });
      return;
    }

    onSave(marks, feedback);
    toast({
      title: "Marks updated",
      description: `Marks for ${student.name} have been updated successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Marks for {testName}</DialogTitle>
          <DialogDescription>
            Student: {student.name} (ID: {student.admissionNumber})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="marks" className="text-right">
              Marks (out of {maxMarks})
            </Label>
            <Input
              id="marks"
              type="number"
              min={0}
              max={maxMarks}
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback" className="text-right">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback for the student"
              className="col-span-3"
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

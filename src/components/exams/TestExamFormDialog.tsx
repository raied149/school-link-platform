
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for grades
const grades = [
  { id: "lkg", name: "LKG" },
  { id: "ukg", name: "UKG" },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `grade${i + 1}`,
    name: `${i + 1}${getOrdinalSuffix(i + 1)} Grade`
  }))
];

function getOrdinalSuffix(i: number) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

// Mock data for sections
const sections = [
  { id: "secA", name: "Section A" },
  { id: "secB", name: "Section B" },
  { id: "secC", name: "Section C" }
];

// Mock data for subjects based on class and section
const subjectsMap = {
  "lkg": ["English", "Mathematics", "Environmental Science"],
  "ukg": ["English", "Mathematics", "Environmental Science"],
  "grade1": ["English", "Mathematics", "Science", "Social Studies"],
  // ... add more subjects for other grades
};

interface TestExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestExamFormDialog({ open, onOpenChange }: TestExamFormDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const [testType, setTestType] = useState<'test' | 'exam'>('test');
  const [name, setName] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (selectedGrade) {
      setAvailableSubjects(subjectsMap[selectedGrade as keyof typeof subjectsMap] || []);
    }
  }, [selectedGrade]);

  const handleSubmit = () => {
    if (!name || !date || !selectedGrade || selectedSections.length === 0 || selectedSubjects.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newTestExam = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      type: testType,
      grade: selectedGrade,
      sections: selectedSections,
      subjects: selectedSubjects,
      maxMarks,
      date: date.toISOString(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("New Test/Exam:", newTestExam);
    
    toast({
      title: `${testType === 'test' ? 'Test' : 'Exam'} added successfully`,
      description: `${name} has been scheduled for ${format(date, "PPP")}`,
    });
    
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setTestType('test');
    setDate(undefined);
    setMaxMarks(100);
    setSelectedGrade("");
    setSelectedSections([]);
    setSelectedSubjects([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New {testType === 'test' ? 'Test' : 'Exam'}</DialogTitle>
          <DialogDescription>
            Create a new {testType === 'test' ? 'test' : 'exam'} by filling out the information below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Test Type Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="test-type" className="text-right">Type</Label>
            <Select
              value={testType}
              onValueChange={(value) => setTestType(value as 'test' | 'exam')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Name Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder={`${testType === 'test' ? 'Unit Test 1' : 'Final Exam'}`}
            />
          </div>
          
          {/* Date Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Grade Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Grade</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sections Selection */}
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Sections</Label>
            <ScrollArea className="h-[100px] w-full col-span-3 border rounded-md p-4">
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSections(prev =>
                          checked
                            ? [...prev, section.id]
                            : prev.filter(id => id !== section.id)
                        );
                      }}
                    />
                    <Label htmlFor={`section-${section.id}`}>{section.name}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Subjects Selection */}
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Subjects</Label>
            <ScrollArea className="h-[100px] w-full col-span-3 border rounded-md p-4">
              <div className="space-y-2">
                {availableSubjects.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        setSelectedSubjects(prev =>
                          checked
                            ? [...prev, subject]
                            : prev.filter(s => s !== subject)
                        );
                      }}
                    />
                    <Label htmlFor={`subject-${subject}`}>{subject}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Max Marks Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max-marks" className="text-right">Max Marks</Label>
            <Input
              id="max-marks"
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(parseInt(e.target.value))}
              className="col-span-3"
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

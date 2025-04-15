
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

  // Mock data for selections
  const classes = [
    { id: "class1", name: "Class 1" },
    { id: "class2", name: "Class 2" },
    { id: "class3", name: "Class 3" },
  ];
  
  const sections = [
    { id: "sec1", name: "Section A" },
    { id: "sec2", name: "Section B" },
    { id: "sec3", name: "Section C" },
  ];
  
  const subjects = [
    { id: "sub1", name: "Mathematics" },
    { id: "sub2", name: "Science" },
    { id: "sub3", name: "English" },
  ];

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!name || !date || selectedClasses.length === 0 || selectedSections.length === 0 || selectedSubjects.length === 0) {
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
      classes: selectedClasses,
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
    // Reset form
    setName('');
    setTestType('test');
    setDate(undefined);
    setMaxMarks(100);
    setSelectedClasses([]);
    setSelectedSections([]);
    setSelectedSubjects([]);
  };

  const toggleClass = (id: string) => {
    setSelectedClasses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
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
          
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Classes</Label>
            <div className="col-span-3 flex flex-col gap-2">
              {classes.map((cls) => (
                <div key={cls.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`class-${cls.id}`}
                    checked={selectedClasses.includes(cls.id)}
                    onCheckedChange={() => toggleClass(cls.id)}
                  />
                  <Label htmlFor={`class-${cls.id}`}>{cls.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Sections</Label>
            <div className="col-span-3 flex flex-col gap-2">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`section-${section.id}`}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label htmlFor={`section-${section.id}`}>{section.name}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <Label className="text-right pt-2">Subjects</Label>
            <div className="col-span-3 flex flex-col gap-2">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`subject-${subject.id}`}
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => toggleSubject(subject.id)}
                  />
                  <Label htmlFor={`subject-${subject.id}`}>{subject.name}</Label>
                </div>
              ))}
            </div>
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

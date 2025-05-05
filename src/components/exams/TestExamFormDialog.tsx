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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createExam, assignExamToSections, updateExam, getExamAssignments } from "@/services/examService";

interface TestExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examToEdit?: any; // The exam to edit, if any
  onExamUpdated?: () => void; // Callback for when an exam is updated
}

export function TestExamFormDialog({ open, onOpenChange, examToEdit, onExamUpdated }: TestExamFormDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const [testType, setTestType] = useState<'test' | 'exam'>('test');
  const [name, setName] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch academic years, classes, sections, subjects
  const { data: academicYears = [], isLoading: isLoadingYears } = useQuery({
    queryKey: ['academicYears'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('is_active', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', selectedGrade],
    queryFn: async () => {
      let query = supabase.from('sections').select('*');
      
      if (selectedGrade) {
        query = query.eq('class_id', selectedGrade);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedGrade
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get current active academic year
  const activeAcademicYear = academicYears?.find(year => year.is_active) || academicYears?.[0];

  // If in edit mode, fetch the exam's existing assignments
  const { data: existingAssignments = [] } = useQuery({
    queryKey: ['examAssignmentsForEdit', examToEdit?.id],
    queryFn: () => getExamAssignments(examToEdit.id),
    enabled: !!examToEdit?.id
  });

  // Set up form for editing if examToEdit is provided
  useEffect(() => {
    if (examToEdit) {
      setIsEditMode(true);
      setName(examToEdit.name);
      setDate(examToEdit.date ? new Date(examToEdit.date) : undefined);
      setMaxMarks(examToEdit.max_score || 100);
      setSelectedSubject(examToEdit.subject_id || "");
      
      // For test type, we would need a field in the database to determine this
      // For now, we'll just default to 'exam'
      setTestType('exam');
    } else {
      setIsEditMode(false);
      resetForm();
    }
  }, [examToEdit]);

  // When existing assignments are loaded, set the selected sections
  useEffect(() => {
    if (isEditMode && existingAssignments.length > 0) {
      // Extract section IDs and unique class ID
      const sectionIds = existingAssignments.map(assignment => assignment.section_id);
      const classId = existingAssignments[0]?.sections?.class_id;
      
      setSelectedSections(sectionIds);
      if (classId) {
        setSelectedGrade(classId);
      }
    }
  }, [isEditMode, existingAssignments]);

  // Reset sections when grade changes
  useEffect(() => {
    if (!isEditMode) {
      setSelectedSections([]);
    }
  }, [selectedGrade, isEditMode]);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSubmit = async () => {
    if (!name || !date || !selectedSubject) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditMode && (!selectedGrade || selectedSections.length === 0)) {
      toast({
        title: "Missing sections",
        description: "Please select a grade and at least one section.",
        variant: "destructive",
      });
      return;
    }

    if (!activeAcademicYear?.id) {
      toast({
        title: "No active academic year",
        description: "There is no active academic year. Please create one first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const examData = {
        name,
        date: date.toISOString().split('T')[0],
        max_score: maxMarks,
        subject_id: selectedSubject
      };

      if (isEditMode) {
        // Update existing exam
        await updateExam(examToEdit.id, examData);
        
        toast({
          title: "Exam updated",
          description: `${name} has been updated successfully.`,
        });
        
        if (onExamUpdated) {
          onExamUpdated();
        }
      } else {
        // Create new exam
        const newExam = await createExam(examData);
        
        if (!newExam?.id) {
          throw new Error("Failed to create exam record");
        }
        
        // Assign to sections
        await assignExamToSections(
          newExam.id,
          selectedSections,
          activeAcademicYear.id
        );
        
        toast({
          title: `${testType === 'test' ? 'Test' : 'Exam'} created`,
          description: `${name} has been scheduled for ${format(date, "PPP")}`,
        });
      }
      
      onOpenChange(false);
      if (!isEditMode) {
        resetForm();
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} exam. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setTestType('test');
    setDate(undefined);
    setMaxMarks(100);
    setSelectedGrade("");
    setSelectedSections([]);
    setSelectedSubject("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? `Edit ${testType === 'test' ? 'Test' : 'Exam'}` : `Add New ${testType === 'test' ? 'Test' : 'Exam'}`}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? `Edit the ${testType === 'test' ? 'test' : 'exam'} details below.`
              : `Create a new ${testType === 'test' ? 'test' : 'exam'} by filling out the information below.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Test Type Selection - only show in create mode */}
          {!isEditMode && (
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
          )}
          
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
          
          {/* Subject Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {isLoadingSubjects ? (
                    <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                  ) : subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No subjects available</SelectItem>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          {/* Only show section selection in create mode */}
          {!isEditMode && (
            <>
              {/* Grade Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Grade/Class</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {isLoadingClasses ? (
                        <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                      ) : classes.length > 0 ? (
                        classes.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No classes available</SelectItem>
                      )}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sections Selection */}
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">Sections</Label>
                <ScrollArea className="h-[100px] w-full col-span-3 border rounded-md p-4">
                  <div className="space-y-2">
                    {isLoadingSections ? (
                      <div className="text-muted-foreground text-sm py-2">
                        Loading sections...
                      </div>
                    ) : sections.length > 0 ? (
                      sections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`section-${section.id}`}
                            checked={selectedSections.includes(section.id)}
                            onCheckedChange={() => handleSectionToggle(section.id)}
                          />
                          <Label htmlFor={`section-${section.id}`}>{section.name}</Label>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-2">
                        {selectedGrade ? "No sections available for this class" : "Select a class first"}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
          
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

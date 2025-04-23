
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Users, ListCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Teacher, Subject } from "@/types";

interface SubjectRow extends Subject {
  assignedTeacherIds?: string[];
  assignedClassIds?: string[];
}

const fetchSubjects = async () => {
  // Fetch subjects with teacher assignments and class assignments
  const { data, error } = await supabase
    .from("subjects")
    .select(`
      *,
      teacher_subjects (
        teacher_id,
        profiles:teacher_id (first_name, last_name)
      ),
      subject_classes (
        class_id,
        classes:class_id (name)
      )
    `);
    
  if (error) throw error;
  
  // Transform to fit our interface
  return (data || []).map((subject: any) => ({
    ...subject,
    assignedTeacherIds: subject.teacher_subjects?.map((rel: any) => rel.teacher_id) ?? [],
    assignedTeachers: subject.teacher_subjects?.map((rel: any) => ({
      id: rel.teacher_id,
      name: rel.profiles ? `${rel.profiles.first_name} ${rel.profiles.last_name}` : 'Unknown'
    })) ?? [],
    assignedClassIds: subject.subject_classes?.map((c: any) => c.class_id) ?? [],
    assignedClasses: subject.subject_classes?.map((c: any) => ({
      id: c.class_id,
      name: c.classes?.name || 'Unknown'
    })) ?? []
  }));
};

const fetchTeachers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "teacher");
    
  if (error) throw error;
  
  return data || [];
};

const fetchGrades = async () => {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name");
    
  if (error) throw error;
  
  return data || [];
};

export default function SubjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects-full"],
    queryFn: fetchSubjects,
  });
  
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: fetchTeachers,
  });
  
  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: fetchGrades,
  });

  const createMutation = useMutation({
    mutationFn: async (subjectData: any) => {
      const { name, code, assignedClassIds, assignedTeacherIds } = subjectData;
      let subjectId = editingSubject?.id;
      
      try {
        // Begin transaction
        if (subjectId) {
          // Update existing subject
          const { error } = await supabase
            .from("subjects")
            .update({ name, code })
            .eq("id", subjectId);
            
          if (error) throw error;
        } else {
          // Create new subject
          const { data, error } = await supabase
            .from("subjects")
            .insert({ name, code })
            .select();
            
          if (error) throw error;
          
          subjectId = data[0].id;
        }
        
        // Handle class assignments
        if (subjectId && assignedClassIds && assignedClassIds.length > 0) {
          // Remove existing assignments
          const { error: deleteError } = await supabase
            .from("subject_classes")
            .delete()
            .eq("subject_id", subjectId);
            
          if (deleteError) throw deleteError;
          
          // Create new assignments
          const classAssignments = assignedClassIds.map((classId: string) => ({
            subject_id: subjectId,
            class_id: classId
          }));
          
          const { error: insertError } = await supabase
            .from("subject_classes")
            .insert(classAssignments);
            
          if (insertError) throw insertError;
        }
        
        // Handle teacher assignments
        if (subjectId) {
          // Remove existing assignments
          const { error: deleteError } = await supabase
            .from("teacher_subjects")
            .delete()
            .eq("subject_id", subjectId);
            
          if (deleteError) throw deleteError;
          
          if (assignedTeacherIds && assignedTeacherIds.length > 0) {
            // Create new assignments
            const teacherAssignments = assignedTeacherIds.map((teacherId: string) => ({
              subject_id: subjectId,
              teacher_id: teacherId
            }));
            
            const { error: insertError } = await supabase
              .from("teacher_subjects")
              .insert(teacherAssignments);
              
            if (insertError) throw insertError;
          }
        }
        
        return true;
      } catch (error) {
        console.error("Error saving subject:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-full"] });
      toast({ title: "Subject Saved", description: "The subject has been saved." });
      setFormOpen(false);
      setEditingSubject(null);
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to save subject: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Remove teacher assignments
        const { error: teacherError } = await supabase
          .from("teacher_subjects")
          .delete()
          .eq("subject_id", id);
          
        if (teacherError) throw teacherError;
        
        // Remove class assignments
        const { error: classError } = await supabase
          .from("subject_classes")
          .delete()
          .eq("subject_id", id);
          
        if (classError) throw classError;
        
        // Delete subject
        const { error } = await supabase
          .from("subjects")
          .delete()
          .eq("id", id);
          
        if (error) throw error;
        
        return true;
      } catch (error) {
        console.error("Error deleting subject:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-full"] });
      toast({ title: "Subject Removed", description: "Subject deleted successfully." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete subject: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const filteredSubjects = subjects.filter((subj: any) =>
    subj.name.toLowerCase().includes(search.toLowerCase()) ||
    subj.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold">Subjects</h1>
            <p className="text-muted-foreground">School-wide subject management</p>
          </div>
          <Button onClick={() => { setFormOpen(true); setEditingSubject(null); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
        <div className="flex mb-4">
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-1/3"
          />
        </div>
        {loadingSubjects ? (
          <div>Loading subjects...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Subject Code</TableHead>
                <TableHead>Grades</TableHead>
                <TableHead>Assigned Teachers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject: SubjectRow) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>
                    {(subject.assignedClasses || [])
                      .map((grade: any) => grade.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    {(subject.assignedTeachers || [])
                      .map((teacher: any) => teacher.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setFormOpen(true); setEditingSubject(subject); }}
                      className="mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(subject.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Subject Form Dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <Card className="p-8 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingSubject ? "Edit Subject" : "Add Subject"}
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const name = formData.get("name") as string;
                const code = formData.get("code") as string;
                const assignedTeacherIds = formData.getAll("teacherIds") as string[];
                const assignedClassIds = formData.getAll("classIds") as string[];
                createMutation.mutate({ name, code, assignedTeacherIds, assignedClassIds });
              }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <Input name="name" required defaultValue={editingSubject?.name || ""} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Code</label>
                  <Input name="code" required defaultValue={editingSubject?.code || ""} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Assign to Grades</label>
                  <div className="flex flex-wrap gap-2">
                    {grades.map((c: any) => (
                      <label key={c.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="classIds"
                          value={c.id}
                          defaultChecked={editingSubject?.assignedClassIds?.includes(c.id)}
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Assign Teachers</label>
                  <div className="flex flex-wrap gap-2">
                    {teachers.map((t: any) => (
                      <label key={t.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="teacherIds"
                          value={t.id}
                          defaultChecked={editingSubject?.assignedTeacherIds?.includes(t.id)}
                        />
                        <span>{t.first_name} {t.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="outline" type="button" onClick={() => { setFormOpen(false); setEditingSubject(null); }}>Cancel</Button>
                  <Button type="submit">{editingSubject ? "Save" : "Add"}</Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}


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
  const { data, error } = await supabase
    .from("subjects")
    .select("*, teacher_subjects(*), classes(*)");
  if (error) throw error;
  // Transform to fit our interface
  return (data || []).map((subject: any) => ({
    ...subject,
    assignedTeacherIds: subject.teacher_subjects?.map((rel: any) => rel.teacher_id) ?? [],
    assignedClassIds: subject.classes?.map((c: any) => c.id) ?? [],
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
      // Create subject, assign to grades, assign to teachers
      const { name, code, assignedClassIds, assignedTeacherIds } = subjectData;
      // 1. Create or update subject
      let subjectId = editingSubject?.id;
      let response;
      if (subjectId) {
        response = await supabase
          .from("subjects")
          .update({ name, code })
          .eq("id", subjectId)
          .select();
      } else {
        response = await supabase
          .from("subjects")
          .insert([{ name, code }])
          .select();
        subjectId = response.data?.[0]?.id;
      }
      // 2. Update grade assignments (subjects/classes join table) by connecting to all class ids
      if (subjectId && assignedClassIds) {
        // Remove existing section_subjects and add current (cleanup would be more robust in prod)
        // Skipping code for join table (classes/subjects join) if not present -- or implement as needed
      }
      // 3. Update teacher assignments (teacher_subjects)
      if (subjectId) {
        // Remove all existing
        await supabase.from("teacher_subjects").delete().eq("subject_id", subjectId);
        // Add all assigned
        for (const teacherId of assignedTeacherIds || []) {
          await supabase.from("teacher_subjects").insert([{ subject_id: subjectId, teacher_id: teacherId }]);
        }
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-full"] });
      toast({ title: "Subject Saved", description: "The subject has been saved." });
      setFormOpen(false);
      setEditingSubject(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("subjects").delete().eq("id", id);
      await supabase.from("teacher_subjects").delete().eq("subject_id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects-full"] });
      toast({ title: "Subject Removed", description: "Subject deleted." });
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
          <div>Loading...</div>
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
                    {(subject.assignedClassIds || [])
                      .map((classId) => (grades.find((g: any) => g.id === classId)?.name || ""))
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    {(subject.assignedTeacherIds || [])
                      .map(tid => {
                        const teacher = teachers.find((t: any) => t.id === tid);
                        return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Unknown";
                      })
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setFormOpen(true); setEditingSubject(subject); }}
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

      {/* Form Dialog (create/edit) */}
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

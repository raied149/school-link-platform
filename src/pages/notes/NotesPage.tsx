
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteFormDialog } from "@/components/notes/NoteFormDialog";
import { noteService } from "@/services/noteService";
import { useAuth } from "@/contexts/AuthContext";

export default function NotesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const isTeacherOrAdmin = user && ["teacher", "admin"].includes(user.role);

  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      if (user?.role === "student") {
        return noteService.getNotesForStudent(user.id);
      }
      return noteService.getNotes();
    },
    enabled: !!user
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            Access shared documents and resources
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button onClick={() => setIsDialogOpen(true)}>Create Note</Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">Failed to load notes</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">No notes available</h2>
          <p className="text-muted-foreground">
            {isTeacherOrAdmin 
              ? "Create a note to share with students"
              : "No notes have been shared with you yet"}
          </p>
          {isTeacherOrAdmin && (
            <Button
              className="mt-4"
              onClick={() => setIsDialogOpen(true)}
            >
              Create Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {isTeacherOrAdmin && (
        <NoteFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}

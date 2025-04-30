
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { NoteWithUser } from "@/services/noteService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: NoteWithUser & { subject_name?: string };
  className?: string;
}

export function NoteCard({ note, className }: NoteCardProps) {
  const formattedDate = formatDistanceToNow(new Date(note.created_at), { addSuffix: true });
  
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">{note.title}</CardTitle>
          {note.subject_name && (
            <Badge variant="outline" className="ml-2">{note.subject_name}</Badge>
          )}
        </div>
        <CardDescription className="flex flex-col gap-1">
          <span>By {note.creator.first_name} {note.creator.last_name}</span>
          <span>Shared {formattedDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {note.description ? (
          <p className="text-sm text-muted-foreground line-clamp-4">{note.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <a 
            href={note.google_drive_link} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Open in Google Drive
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

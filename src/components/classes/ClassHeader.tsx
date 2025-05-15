
import { Skeleton } from "@/components/ui/skeleton";

export interface ClassHeaderProps {
  className: string;
  academicYear: string;
  loading?: boolean;
}

export function ClassHeader({ className, academicYear, loading = false }: ClassHeaderProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{className}</h1>
      <p className="text-muted-foreground">{academicYear}</p>
    </div>
  );
}


import { Skeleton } from "@/components/ui/skeleton";

export interface ClassHeaderProps {
  className: string;
  academicYear: string;
  loading?: boolean;
  title?: string;   // Add this optional prop
  subtitle?: string; // Add this optional prop
}

export function ClassHeader({ 
  className, 
  academicYear, 
  loading = false,
  title,
  subtitle
}: ClassHeaderProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }
  
  // Use title and subtitle props if provided, otherwise use className and academicYear
  const displayTitle = title || className;
  const displaySubtitle = subtitle || academicYear;
  
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
      <p className="text-muted-foreground">{displaySubtitle}</p>
    </div>
  );
}

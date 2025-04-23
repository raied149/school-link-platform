
import React from "react";

interface ClassHeaderProps {
  className?: string;
  section?: string;
  academicYear?: string;
}

export function ClassHeader({ className, section, academicYear }: ClassHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {className || 'Loading...'} - {section || 'Loading...'}
      </h1>
      <p className="text-muted-foreground">
        Academic Year: {academicYear || 'Loading...'}
      </p>
    </div>
  );
}

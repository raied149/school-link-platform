
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EventDescriptionProps {
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function EventDescription({ description, isExpanded, onToggle }: EventDescriptionProps) {
  return (
    <div className="mt-2">
      <div className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {description}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={onToggle}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            <span>Show Less</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            <span>Show More</span>
          </>
        )}
      </Button>
    </div>
  );
}

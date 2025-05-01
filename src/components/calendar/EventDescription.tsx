import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "./schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface EventDescriptionProps {
  description?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  form?: UseFormReturn<z.infer<typeof formSchema>>;
}

export function EventDescription({ description, isExpanded, onToggle, form }: EventDescriptionProps) {
  const [expanded, setExpanded] = useState(!!isExpanded);
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(!expanded);
    }
  };
  
  // If form is provided, render form fields
  if (form) {
    return (
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add event description..." 
                className="resize-none" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
  
  // Otherwise render read-only description with toggle
  return (
    <div className="mt-2">
      <div className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
        {description}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={handleToggle}
      >
        {expanded ? (
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

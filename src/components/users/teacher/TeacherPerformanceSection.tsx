
import { Teacher } from "@/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TeacherPerformanceSectionProps {
  teacher: Teacher;
}

export function TeacherPerformanceSection({ teacher }: TeacherPerformanceSectionProps) {
  return (
    <AccordionItem value="performance">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span>Performance & Awards</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Last Review Date</p>
              <p className="text-sm text-muted-foreground">{teacher.performance.lastReviewDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Rating</p>
              <p className="text-sm text-muted-foreground">{teacher.performance.rating}/5</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Feedback</p>
            <p className="text-sm text-muted-foreground">{teacher.performance.feedback}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Awards & Recognition</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {teacher.performance.awards.map((award: string, index: number) => (
                <li key={index}>{award}</li>
              ))}
            </ul>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

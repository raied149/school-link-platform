
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedIncidentData } from "@/services/incidentService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function SeedDataButton() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedIncidentData();
      toast({
        title: "Success",
        description: "Sample incident data has been added to the database.",
      });
    } catch (error) {
      console.error("Error seeding data:", error);
      toast({
        title: "Error",
        description: "Failed to seed sample data. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeed} 
      variant="outline" 
      size="sm" 
      disabled={isSeeding}
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Seeding...
        </>
      ) : (
        "Seed Sample Data"
      )}
    </Button>
  );
}

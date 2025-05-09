
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TaskFormFooterProps {
  onCancel: () => void;
  isPending: boolean;
  isEdit: boolean;
}

export function TaskFormFooter({
  onCancel,
  isPending,
  isEdit
}: TaskFormFooterProps) {
  return (
    <DialogFooter className="pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isPending}
      >
        {isPending 
          ? "Saving..." 
          : isEdit ? "Update Task" : "Create Task"}
      </Button>
    </DialogFooter>
  );
}

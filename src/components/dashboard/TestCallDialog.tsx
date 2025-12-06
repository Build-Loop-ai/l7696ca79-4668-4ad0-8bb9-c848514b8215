import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestCallButton } from "@/components/TestCallButton";

interface TestCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId?: string;
  onCallComplete?: () => void;
}

export function TestCallDialog({
  open,
  onOpenChange,
  assistantId,
  onCallComplete,
}: TestCallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif">
            Test Your AI Receptionist
          </DialogTitle>
          <DialogDescription className="text-center">
            Have a conversation with your AI to hear exactly how callers will experience it
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <TestCallButton
            assistantId={assistantId}
            onCallEnd={onCallComplete}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>🎤 Allow microphone access when prompted</p>
          <p>💬 Speak naturally as if you're a customer calling your business</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TestCallDialog;

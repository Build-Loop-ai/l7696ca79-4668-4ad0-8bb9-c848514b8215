import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TestCallButton } from "@/components/TestCallButton";
import { CheckCircle2, Headphones, Mic, Volume2 } from "lucide-react";

interface TestCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId?: string;
  phoneNumber?: string;
  onCallComplete?: () => void;
}

export function TestCallDialog({
  open,
  onOpenChange,
  assistantId,
  phoneNumber,
  onCallComplete,
}: TestCallDialogProps) {
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleCallEnd = () => {
    setHasCompleted(true);
    onCallComplete?.();
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => setHasCompleted(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {hasCompleted ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <DialogTitle className="text-2xl font-serif mb-2">
              Test Complete! 🎉
            </DialogTitle>
            <DialogDescription className="mb-6 text-base">
              You've experienced your AI receptionist firsthand
            </DialogDescription>

            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>💡 You can adjust voice and language in Settings</p>
              <p>💡 Your AI uses the same script for real callers</p>
            </div>

            <Button onClick={handleClose} size="lg" className="w-full">
              Continue
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-serif">
                Test Your AI Receptionist
              </DialogTitle>
              <DialogDescription className="text-base">
                Have a real conversation to hear what customers experience
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</span>
              <span>of 3 steps</span>
            </div>

            <div className="py-6">
              <TestCallButton
                assistantId={assistantId}
                phoneNumber={phoneNumber}
                onCallEnd={handleCallEnd}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/50">
              <p className="font-medium text-sm text-foreground">How it works:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4 text-primary" />
                  </div>
                  <span>Click the button and allow microphone access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-primary" />
                  </div>
                  <span>Speak naturally like you're a customer calling</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span>End the call when you're done testing</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-muted-foreground mt-2"
            >
              Skip for now
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TestCallDialog;

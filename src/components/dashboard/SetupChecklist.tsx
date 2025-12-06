import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Phone,
  Mic,
  TestTube,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface SetupChecklistProps {
  hasAssistant: boolean;
  hasPhoneNumber: boolean;
  hasTestCall: boolean;
  onGetPhoneNumber: () => void;
  onTestCall: () => void;
}

export function SetupChecklist({
  hasAssistant,
  hasPhoneNumber,
  hasTestCall,
  onGetPhoneNumber,
  onTestCall,
}: SetupChecklistProps) {
  const steps: SetupStep[] = [
    {
      id: "assistant",
      title: "AI Receptionist Configured",
      description: "Your AI assistant is set up and ready",
      icon: Mic,
      completed: hasAssistant,
    },
    {
      id: "phone",
      title: "Phone Number Activated",
      description: "Get a number for callers to reach your AI",
      icon: Phone,
      completed: hasPhoneNumber,
      action: onGetPhoneNumber,
      actionLabel: "Get Number",
    },
    {
      id: "test",
      title: "First Test Call",
      description: "Try your AI to hear how it sounds",
      icon: TestTube,
      completed: hasTestCall,
      action: onTestCall,
      actionLabel: "Test Now",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const isComplete = completedCount === steps.length;

  if (isComplete) {
    return null; // Hide when setup is complete
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-serif">Getting Started</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {steps.length} complete
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext = !step.completed && steps.slice(0, index).every((s) => s.completed);

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all",
                step.completed && "bg-green-50 dark:bg-green-950/20",
                isNext && "bg-muted/50 ring-1 ring-primary/20",
                !step.completed && !isNext && "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    step.completed
                      ? "bg-green-500 text-white"
                      : isNext
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div
                    className={cn(
                      "font-medium text-sm",
                      step.completed && "text-green-700 dark:text-green-400"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>

              {!step.completed && step.action && isNext && (
                <Button
                  size="sm"
                  onClick={step.action}
                  className="gap-1"
                >
                  {step.actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default SetupChecklist;

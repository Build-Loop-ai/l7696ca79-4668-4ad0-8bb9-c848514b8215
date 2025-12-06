import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Phone,
  Mic,
  TestTube,
  ArrowRight,
  Sparkles,
  PartyPopper,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  helpText: string;
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
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: "assistant",
      title: "AI Receptionist Created",
      description: "Your AI is configured and ready to go",
      helpText: "✓ Completed during onboarding",
      icon: Mic,
      completed: hasAssistant,
    },
    {
      id: "phone",
      title: "Get Your Phone Number",
      description: "Give your AI a number customers can call",
      helpText: "Takes less than 30 seconds",
      icon: Phone,
      completed: hasPhoneNumber,
      action: onGetPhoneNumber,
      actionLabel: "Get Number",
    },
    {
      id: "test",
      title: "Test Your AI",
      description: "Have a test conversation with your AI",
      helpText: "Hear exactly what your customers will experience",
      icon: Headphones,
      completed: hasTestCall,
      action: onTestCall,
      actionLabel: "Start Test Call",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const isComplete = completedCount === steps.length;

  // Don't hide when complete - show celebration instead
  if (isComplete) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center animate-bounce">
              <PartyPopper className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-green-800 dark:text-green-300 mb-2">
              You're All Set! 🎉
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-1">
              Your AI receptionist is live and ready to take calls
            </p>
            <p className="text-sm text-green-600/80 dark:text-green-500">
              Customers can now call your AI number 24/7
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the next incomplete step
  const nextStep = steps.find((s) => !s.completed);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-serif">Get Started</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {completedCount === 0 
                  ? "3 quick steps to go live"
                  : `${steps.length - completedCount} step${steps.length - completedCount > 1 ? 's' : ''} remaining`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-serif font-bold text-primary">{progress}%</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-3 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext = step.id === nextStep?.id;
          const isClickable = !step.completed && step.action;
          const isHovered = hoveredStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "relative rounded-xl transition-all duration-200",
                isClickable && "cursor-pointer",
                isNext && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
              )}
              onMouseEnter={() => isClickable && setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => isClickable && step.action?.()}
            >
              <div
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                  step.completed && "bg-green-50 dark:bg-green-950/30",
                  isNext && !isHovered && "bg-primary/5",
                  isNext && isHovered && "bg-primary/10",
                  !step.completed && !isNext && "bg-muted/30 opacity-50"
                )}
              >
                {/* Step Number / Check */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                    step.completed 
                      ? "bg-green-500 text-white" 
                      : isNext
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      step.completed ? "text-green-600 dark:text-green-400" : isNext ? "text-primary" : "text-muted-foreground"
                    )} />
                    <h4
                      className={cn(
                        "font-semibold",
                        step.completed && "text-green-700 dark:text-green-400",
                        isNext && "text-foreground",
                        !step.completed && !isNext && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </h4>
                  </div>
                  <p className={cn(
                    "text-sm mt-0.5",
                    step.completed ? "text-green-600/80 dark:text-green-500" : "text-muted-foreground"
                  )}>
                    {step.completed ? "✓ " + step.description : step.description}
                  </p>
                  {isNext && (
                    <p className="text-xs text-primary/80 mt-1 font-medium">
                      💡 {step.helpText}
                    </p>
                  )}
                </div>

                {/* Action */}
                {isClickable && (
                  <div className="shrink-0">
                    {isNext ? (
                      <Button
                        size="sm"
                        className={cn(
                          "gap-2 transition-all duration-200",
                          isHovered && "translate-x-1"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          step.action?.();
                        }}
                      >
                        {step.actionLabel}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                )}

                {step.completed && (
                  <div className="shrink-0">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                      Done
                    </span>
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-10 top-16 w-0.5 h-3 bg-border" />
              )}
            </div>
          );
        })}

        {/* Bottom encouragement */}
        <div className="pt-4 border-t border-border/50 mt-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground">
                {completedCount === 1 && "Great start! Just 2 more steps to go live."}
                {completedCount === 2 && "Almost there! One final step to launch."}
                {completedCount === 0 && "Complete all steps to launch your AI receptionist."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SetupChecklist;

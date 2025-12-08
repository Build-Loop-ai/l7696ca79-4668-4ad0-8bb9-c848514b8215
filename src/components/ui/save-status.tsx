import { Check, Cloud, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SaveStatus } from "@/hooks/useAutoSave";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  syncStatus?: SaveStatus;
  className?: string;
}

export function SaveStatusIndicator({ 
  status, 
  syncStatus = "idle",
  className 
}: SaveStatusIndicatorProps) {
  // Determine what to show based on combined status
  const showSaving = status === "saving" || syncStatus === "saving";
  const showSaved = !showSaving && (status === "saved" || syncStatus === "saved");
  const showError = status === "error" || syncStatus === "error";
  const showIdle = status === "idle" && syncStatus === "idle";

  if (showIdle) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-all duration-300",
        showSaving && "text-muted-foreground",
        showSaved && "text-green-600 dark:text-green-500",
        showError && "text-destructive",
        className
      )}
    >
      {showSaving && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs">
            {syncStatus === "saving" ? "Syncing AI..." : "Saving..."}
          </span>
        </>
      )}
      {showSaved && !showSaving && (
        <>
          <Check className="h-3.5 w-3.5" />
          <span className="text-xs">Saved</span>
        </>
      )}
      {showError && !showSaving && (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-xs">Error saving</span>
        </>
      )}
    </div>
  );
}

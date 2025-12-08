import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      className
    )}>
      {/* Icon with decorative background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl scale-150" />
        <div className="relative w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>

      {/* Action */}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

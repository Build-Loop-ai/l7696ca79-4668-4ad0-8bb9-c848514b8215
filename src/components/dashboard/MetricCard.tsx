import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard = ({ label, value, icon: Icon, trend, className }: MetricCardProps) => {
  return (
    <div className={cn(
      "rounded-xl bg-card border border-border p-5 shadow-card card-hover",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.isPositive 
              ? "bg-success-muted text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

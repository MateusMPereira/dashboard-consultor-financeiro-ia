import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  percentage?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "destructive";
}

export function KPICard({ label, value, percentage, trend, variant = "default" }: KPICardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "destructive":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("p-6 shadow-card hover:shadow-elegant transition-all duration-300", getVariantStyles())}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {percentage && (
            <span className={cn("text-sm font-medium", getTrendColor())}>
              {percentage}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

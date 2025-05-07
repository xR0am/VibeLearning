import { getComplexityEmoji, getComplexityLabel } from "@/lib/courseUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ComplexityLevel } from "@shared/schema";

interface ComplexityBadgeProps {
  complexity?: ComplexityLevel | string | null;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ComplexityBadge({
  complexity,
  showLabel = true,
  className,
  size = "md"
}: ComplexityBadgeProps) {
  const emoji = getComplexityEmoji(complexity);
  const label = getComplexityLabel(complexity);
  
  const sizeClasses = {
    sm: "text-xs py-0 px-2",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1 px-3"
  };
  
  // Colors based on complexity level
  const getComplexityColor = () => {
    if (!complexity) return "bg-primary/10 text-primary border-primary/20";
    
    switch(complexity) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "advanced":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "expert":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-normal border",
        sizeClasses[size],
        getComplexityColor(),
        className
      )}
    >
      <span className="mr.5">{emoji}</span>
      {showLabel && <span className="ml-1">{showLabel ? label.split(' ')[1] : ''}</span>}
    </Badge>
  );
}
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ComplexityLevel } from "@shared/schema";
import { getComplexityEmoji, getComplexityLabel } from "@/lib/courseUtils";
import { cn } from "@/lib/utils";

interface ComplexityBadgeProps {
  complexity?: ComplexityLevel | string | null;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ComplexityBadge({
  complexity,
  showLabel = false,
  className,
  size = "md",
}: ComplexityBadgeProps) {
  const emoji = getComplexityEmoji(complexity);
  const label = getComplexityLabel(complexity);
  const complexityValue = (complexity || "beginner") as ComplexityLevel;
  
  // Determine color based on complexity
  const colorMap: Record<ComplexityLevel, string> = {
    beginner: "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    intermediate: "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
    advanced: "bg-orange-50/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400",
    expert: "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  };
  
  // Size classes
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1 px-2.5"
  };
  
  const badgeContent = showLabel ? label : emoji;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
              colorMap[complexityValue],
              sizeClasses[size],
              "font-medium hover:opacity-80 transition-opacity",
              className
            )}
          >
            {badgeContent}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="font-medium">
          {showLabel ? emoji : label} Complexity
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16 text-lg",
  md: "w-24 h-24 text-2xl",
  lg: "w-32 h-32 text-3xl",
};

const strokeWidths = {
  sm: 4,
  md: 6,
  lg: 8,
};

export function ScoreCircle({ 
  score, 
  size = "md", 
  label, 
  showLabel = true,
  className 
}: ScoreCircleProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "stroke-success";
    if (score >= 60) return "stroke-primary";
    if (score >= 40) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-out",
              getScoreColor(score)
            )}
            style={{
              animation: "progress 1s ease-out forwards",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold">{score}</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  );
}

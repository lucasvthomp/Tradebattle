import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dots" | "pulse";
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary animate-pulse",
              size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("rounded-full bg-primary/20 animate-pulse", sizeClasses[size], className)} />
    );
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}
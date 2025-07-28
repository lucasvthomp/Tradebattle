import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
}

export function SkeletonCard({ 
  className, 
  showHeader = true, 
  rows = 3 
}: SkeletonCardProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            {i === 0 && <div className="h-4 bg-muted rounded w-5/6"></div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
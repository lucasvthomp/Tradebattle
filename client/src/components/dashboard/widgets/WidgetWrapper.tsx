import { Button } from "@/components/ui/button";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { ReactNode } from "react";

interface WidgetWrapperProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  className?: string;
}

export function WidgetWrapper({
  title,
  icon,
  children,
  onRemove,
  onExpand,
  isExpanded = false,
  className = ""
}: WidgetWrapperProps) {
  return (
    <div className={`h-full flex flex-col bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden cursor-move shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <div className="px-4 py-3 border-b border-muted/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center space-x-2 text-muted-foreground">
            {icon}
            <span>{title}</span>
          </div>
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            {onExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="h-6 w-6 p-0 hover:bg-muted/50"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-muted/50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

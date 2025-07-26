import { useState, useCallback } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PortfolioGraphWidget } from "./widgets/PortfolioGraphWidget";
import { StockGraphWidget } from "./widgets/StockGraphWidget";
import { WatchlistWidget } from "./widgets/WatchlistWidget";
import { PositionsWidget } from "./widgets/PositionsWidget";
import { TradingWidget } from "./widgets/TradingWidget";
import { 
  Plus, 
  Settings, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Briefcase, 
  ShoppingCart,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
}

const availableWidgets: Widget[] = [
  {
    id: "portfolio-graph",
    type: "portfolio-graph",
    title: "Portfolio Performance",
    component: PortfolioGraphWidget,
    icon: BarChart3,
    defaultSize: { w: 6, h: 4 }
  },
  {
    id: "stock-graph",
    type: "stock-graph", 
    title: "Stock Chart",
    component: StockGraphWidget,
    icon: TrendingUp,
    defaultSize: { w: 6, h: 4 }
  },
  {
    id: "watchlist",
    type: "watchlist",
    title: "Watchlist",
    component: WatchlistWidget,
    icon: Eye,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: "positions",
    type: "positions",
    title: "Positions", 
    component: PositionsWidget,
    icon: Briefcase,
    defaultSize: { w: 4, h: 4 }
  },
  {
    id: "trading",
    type: "trading",
    title: "Trading",
    component: TradingWidget,
    icon: ShoppingCart,
    defaultSize: { w: 4, h: 5 }
  }
];

interface WidgetGridProps {
  className?: string;
}

export function WidgetGrid({ className }: WidgetGridProps) {
  // Initialize with default layout
  const [widgets, setWidgets] = useState(() => {
    const defaultWidgets = [
      availableWidgets[0], // Portfolio graph
      availableWidgets[2], // Watchlist
      availableWidgets[3], // Positions
      availableWidgets[4]  // Trading
    ];
    return defaultWidgets;
  });

  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({
    lg: [
      { i: "portfolio-graph", x: 0, y: 0, w: 8, h: 4 },
      { i: "watchlist", x: 8, y: 0, w: 4, h: 4 },
      { i: "positions", x: 0, y: 4, w: 6, h: 4 },
      { i: "trading", x: 6, y: 4, w: 4, h: 5 }
    ]
  });

  const [editMode, setEditMode] = useState(false);

  const addWidget = useCallback((widgetType: string) => {
    const widget = availableWidgets.find(w => w.type === widgetType);
    if (!widget) return;

    // Check if widget already exists
    const exists = widgets.find(w => w.type === widgetType);
    if (exists) return;

    // Create unique ID for multiple instances
    const widgetId = `${widgetType}-${Date.now()}`;
    const newWidget = { ...widget, id: widgetId };

    setWidgets(prev => [...prev, newWidget]);

    // Add to layout
    const newLayout = {
      i: widgetId,
      x: (widgets.length * 2) % 12,
      y: Math.floor(widgets.length / 6) * 4,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h
    };

    setLayouts(prev => ({
      ...prev,
      lg: [...(prev.lg || []), newLayout]
    }));
  }, [widgets]);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setLayouts(prev => ({
      ...prev,
      lg: prev.lg?.filter(layout => layout.i !== widgetId) || []
    }));
  }, []);

  const onLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-2 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableWidgets.map((widget) => {
                const Icon = widget.icon;
                const exists = widgets.find(w => w.type === widget.type);
                return (
                  <DropdownMenuItem
                    key={widget.type}
                    onClick={() => addWidget(widget.type)}
                    disabled={!!exists}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {widget.title}
                    {exists && <span className="text-xs text-muted-foreground ml-auto">Added</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {editMode ? "Done" : "Edit Layout"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      <div className="w-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={editMode}
          isResizable={editMode}
          margin={[8, 8]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {widgets.map((widget) => {
            const WidgetComponent = widget.component;
            const layout = layouts.lg?.find(l => l.i === widget.id);
            const widgetHeight = layout ? layout.h * 60 + (layout.h - 1) * 8 : 240;

            return (
              <div key={widget.id} className="widget-container">
                <Card className="h-full relative group">
                  {editMode && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  <WidgetComponent height={widgetHeight} />
                </Card>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Help text for edit mode */}
      {editMode && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
          Drag widgets to rearrange them. Resize by dragging the bottom-right corner. Click the X to remove widgets.
        </div>
      )}
    </div>
  );
}
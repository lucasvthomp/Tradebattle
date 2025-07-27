import { useState, useCallback, useEffect, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Plus, X, Edit3, Save, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

// Import widget components
import { PortfolioSummaryWidget } from "@/components/portfolio/widgets/PortfolioSummaryWidget";
import { PortfolioHoldingsWidget } from "@/components/portfolio/widgets/PortfolioHoldingsWidget";
import { PerformanceChartWidget } from "@/components/portfolio/widgets/PerformanceChartWidget";
import { WatchlistWidget } from "@/components/portfolio/widgets/WatchlistWidget";
import { RecentOrdersWidget } from "@/components/portfolio/widgets/RecentOrdersWidget";
import { MarketNewsWidget } from "@/components/portfolio/widgets/MarketNewsWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget definitions
export const AVAILABLE_WIDGETS = [
  {
    id: "portfolio-summary",
    name: "Portfolio Summary",
    component: PortfolioSummaryWidget,
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 2 }
  },
  {
    id: "holdings",
    name: "Holdings",
    component: PortfolioHoldingsWidget,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 }
  },
  {
    id: "performance-chart",
    name: "Performance Chart",
    component: PerformanceChartWidget,
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 4, h: 2 }
  },
  {
    id: "watchlist",
    name: "Watchlist",
    component: WatchlistWidget,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 }
  },
  {
    id: "recent-orders",
    name: "Recent Orders",
    component: RecentOrdersWidget,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 }
  },
  {
    id: "market-news",
    name: "Market News",
    component: MarketNewsWidget,
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 }
  }
];

// Clean, Robinhood-inspired default layout
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "portfolio-summary", x: 0, y: 0, w: 4, h: 2 },
    { i: "performance-chart", x: 4, y: 0, w: 8, h: 3 },
    { i: "holdings", x: 0, y: 2, w: 6, h: 4 },
    { i: "watchlist", x: 6, y: 3, w: 3, h: 3 },
    { i: "recent-orders", x: 9, y: 3, w: 3, h: 3 }
  ],
  md: [
    { i: "portfolio-summary", x: 0, y: 0, w: 4, h: 2 },
    { i: "performance-chart", x: 4, y: 0, w: 6, h: 3 },
    { i: "holdings", x: 0, y: 2, w: 5, h: 4 },
    { i: "watchlist", x: 5, y: 2, w: 3, h: 2 },
    { i: "recent-orders", x: 8, y: 2, w: 2, h: 4 }
  ],
  sm: [
    { i: "portfolio-summary", x: 0, y: 0, w: 6, h: 2 },
    { i: "performance-chart", x: 0, y: 2, w: 6, h: 3 },
    { i: "holdings", x: 0, y: 5, w: 6, h: 4 },
    { i: "watchlist", x: 0, y: 9, w: 3, h: 3 },
    { i: "recent-orders", x: 3, y: 9, w: 3, h: 3 }
  ]
};

interface PortfolioGridProps {
  className?: string;
}

export function PortfolioGrid({ className }: PortfolioGridProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  
  // Grid state
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>(DEFAULT_LAYOUTS);
  const [isEditing, setIsEditing] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    "portfolio-summary",
    "performance-chart", 
    "holdings",
    "watchlist",
    "recent-orders"
  ]);

  // Save layouts to localStorage
  const saveLayouts = useCallback((newLayouts: { [key: string]: Layout[] }) => {
    setLayouts(newLayouts);
    localStorage.setItem(`portfolio-layouts-${user?.id}`, JSON.stringify(newLayouts));
  }, [user?.id]);

  // Load layouts from localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`portfolio-layouts-${user.id}`);
      if (saved) {
        try {
          setLayouts(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved layouts:", e);
        }
      }
    }
  }, [user?.id]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    setActiveWidgets(["portfolio-summary", "performance-chart", "holdings", "watchlist", "recent-orders"]);
    localStorage.removeItem(`portfolio-layouts-${user?.id}`);
  }, [user?.id]);

  // Add widget
  const addWidget = useCallback((widgetId: string) => {
    if (activeWidgets.includes(widgetId)) return;
    
    const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    if (!widget) return;

    setActiveWidgets(prev => [...prev, widgetId]);
    
    // Add to layout
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      const layout = newLayouts[breakpoint];
      const { w, h } = widget.defaultSize;
      newLayouts[breakpoint] = [
        ...layout,
        { i: widgetId, x: 0, y: 0, w, h, minW: widget.minSize.w, minH: widget.minSize.h }
      ];
    });
    
    saveLayouts(newLayouts);
  }, [activeWidgets, layouts, saveLayouts]);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
    
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetId);
    });
    
    saveLayouts(newLayouts);
  }, [layouts, saveLayouts]);

  // Render widget
  const renderWidget = useCallback((widgetId: string) => {
    const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
    if (!widget) return null;

    const WidgetComponent = widget.component;
    
    return (
      <div key={widgetId} className="widget-container">
        <Card className="h-full border-border/50 bg-card overflow-hidden">
          {isEditing && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => removeWidget(widgetId)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <WidgetComponent />
        </Card>
      </div>
    );
  }, [isEditing, removeWidget]);

  // Available widgets to add
  const availableToAdd = AVAILABLE_WIDGETS.filter(w => !activeWidgets.includes(w.id));

  return (
    <div className={`h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-lg font-semibold text-foreground">Portfolio</h1>
        
        <div className="flex items-center gap-2">
          {isEditing && availableToAdd.length > 0 && (
            <div className="flex items-center gap-1">
              {availableToAdd.map(widget => (
                <Button
                  key={widget.id}
                  size="sm"
                  variant="outline"
                  onClick={() => addWidget(widget.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {widget.name}
                </Button>
              ))}
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={resetLayout}
            disabled={isEditing}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          
          <Button
            size="sm"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-1" />
                Done
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="h-[calc(100vh-12rem)] overflow-hidden">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={(layout, layouts) => {
            if (isEditing) {
              saveLayouts(layouts);
            }
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
        >
          {activeWidgets.map(renderWidget)}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
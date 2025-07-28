import { useState, useCallback, useEffect, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, X, Edit3, Save, RotateCcw, Grip, DollarSign, TrendingUp, Eye, Activity, BarChart3, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

// Import widget components
import { PortfolioSummary } from "./widgets/PortfolioSummary";
import { MarketOverview } from "./widgets/MarketOverview";
import { WatchlistWidget } from "./widgets/WatchlistWidget";
import { PerformanceChart } from "./widgets/PerformanceChart";
import { RecentTrades } from "./widgets/RecentTrades";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget definitions with beautiful icons and descriptions
export const AVAILABLE_WIDGETS = [
  {
    id: "portfolio-summary",
    name: "Portfolio Summary",
    description: "Overview of your total portfolio value and performance",
    component: PortfolioSummary,
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 }
  },
  {
    id: "performance-chart",
    name: "Performance Chart",
    description: "Visual representation of your portfolio performance over time",
    component: PerformanceChart,
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    defaultSize: { w: 8, h: 4 },
    minSize: { w: 6, h: 3 }
  },
  {
    id: "market-overview",
    name: "Market Overview",
    description: "Real-time overview of popular stocks and market trends",
    component: MarketOverview,
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 }
  },
  {
    id: "watchlist",
    name: "Watchlist",
    description: "Keep track of stocks you're interested in",
    component: WatchlistWidget,
    icon: Eye,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 }
  },
  {
    id: "recent-trades",
    name: "Recent Trades",
    description: "Your latest trading activity and transactions",
    component: RecentTrades,
    icon: Activity,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 }
  }
];

// Clean default layout
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "portfolio-summary", x: 0, y: 0, w: 4, h: 3 },
    { i: "performance-chart", x: 4, y: 0, w: 8, h: 4 },
    { i: "market-overview", x: 0, y: 3, w: 4, h: 4 },
    { i: "watchlist", x: 4, y: 4, w: 4, h: 4 },
    { i: "recent-trades", x: 8, y: 4, w: 4, h: 4 }
  ],
  md: [
    { i: "portfolio-summary", x: 0, y: 0, w: 4, h: 3 },
    { i: "performance-chart", x: 4, y: 0, w: 6, h: 4 },
    { i: "market-overview", x: 0, y: 3, w: 5, h: 4 },
    { i: "watchlist", x: 5, y: 3, w: 5, h: 4 },
    { i: "recent-trades", x: 0, y: 7, w: 5, h: 4 }
  ],
  sm: [
    { i: "portfolio-summary", x: 0, y: 0, w: 6, h: 3 },
    { i: "performance-chart", x: 0, y: 3, w: 6, h: 4 },
    { i: "market-overview", x: 0, y: 7, w: 6, h: 4 },
    { i: "watchlist", x: 0, y: 11, w: 6, h: 4 },
    { i: "recent-trades", x: 0, y: 15, w: 6, h: 4 }
  ]
};

export function PortfolioGrid() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    "portfolio-summary",
    "performance-chart",
    "market-overview"
  ]);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  // Generate layout for active widgets
  const currentLayouts = useMemo(() => {
    const result: any = {};
    Object.keys(DEFAULT_LAYOUTS).forEach(breakpoint => {
      result[breakpoint] = DEFAULT_LAYOUTS[breakpoint as keyof typeof DEFAULT_LAYOUTS].filter(
        item => activeWidgets.includes(item.i)
      );
    });
    return result;
  }, [activeWidgets]);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: any) => {
    if (isEditMode) {
      setLayouts(layouts);
    }
  }, [isEditMode]);

  const addWidget = useCallback((widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets(prev => [...prev, widgetId]);
      setAddWidgetOpen(false);
    }
  }, [activeWidgets]);

  const removeWidget = useCallback((widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
  }, []);

  const resetLayout = useCallback(() => {
    setLayouts(DEFAULT_LAYOUTS);
    setActiveWidgets(["portfolio-summary", "performance-chart", "market-overview"]);
  }, []);

  const availableWidgets = AVAILABLE_WIDGETS.filter(widget => !activeWidgets.includes(widget.id));

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Dashboard</h1>
          <p className="text-sm text-muted-foreground">Customize your trading workspace</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Widget</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {availableWidgets.map((widget) => {
                  const IconComponent = widget.icon;
                  return (
                    <motion.div
                      key={widget.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/50"
                        onClick={() => addWidget(widget.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${widget.bgColor}`}>
                              <IconComponent className={`w-5 h-5 ${widget.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{widget.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="h-9"
          >
            {isEditMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>

          {isEditMode && (
            <Button variant="ghost" size="sm" onClick={resetLayout} className="h-9">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Grid container with dotted background */}
      <div className="flex-1 relative overflow-auto">
        {/* Dotted background grid - only visible in edit mode */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                opacity: 0.3
              }}
            />
          )}
        </AnimatePresence>

        {/* Edit mode overlay */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Badge variant="secondary" className="px-4 py-2 shadow-lg">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Mode - Drag and resize widgets
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid layout */}
        <div className="p-4 relative z-10">
          <ResponsiveGridLayout
            className="layout"
            layouts={currentLayouts}
            onLayoutChange={handleLayoutChange}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            draggableHandle=".drag-handle"
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
          >
            {activeWidgets.map((widgetId) => {
              const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
              if (!widget) return null;

              const WidgetComponent = widget.component;

              return (
                <motion.div 
                  key={widgetId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`relative group ${isEditMode ? 'cursor-move' : ''}`}
                >
                  <Card className={`h-full transition-all duration-200 ${
                    isEditMode 
                      ? 'shadow-lg border-2 border-primary/20 hover:border-primary/40' 
                      : 'hover:shadow-md'
                  }`}>
                    {/* Edit mode controls */}
                    <AnimatePresence>
                      {isEditMode && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-2 right-2 z-20 flex items-center space-x-1"
                        >
                          <div className="drag-handle cursor-move p-1 rounded bg-background/80 hover:bg-background border border-border/50">
                            <Grip className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWidget(widgetId)}
                            className="h-6 w-6 p-0 bg-background/80 hover:bg-destructive hover:text-destructive-foreground border border-border/50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Widget content */}
                    <div className={isEditMode ? 'pointer-events-none' : ''}>
                      <WidgetComponent />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      </div>

      {/* Empty state */}
      {activeWidgets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Add Your First Widget</h3>
            <p className="text-sm text-muted-foreground mb-4">Start building your personalized trading dashboard</p>
            <Button onClick={() => setAddWidgetOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";

const mockNews = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cut as Inflation Cools",
    source: "Financial Times",
    time: "2h ago",
    category: "Economy"
  },
  {
    id: 2,
    title: "Tech Stocks Rally on Strong Earnings Reports",
    source: "MarketWatch",
    time: "4h ago",
    category: "Technology"
  },
  {
    id: 3,
    title: "Energy Sector Gains on Rising Oil Prices",
    source: "Reuters",
    time: "6h ago",
    category: "Energy"
  },
  {
    id: 4,
    title: "Consumer Spending Shows Resilience Despite Headwinds",
    source: "Bloomberg",
    time: "8h ago",
    category: "Consumer"
  }
];

export function MarketNewsWidget() {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Market News</h3>
        <Badge variant="secondary" className="text-xs">
          Live
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {mockNews.map((article) => (
          <div
            key={article.id}
            className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {article.source}
                </span>
                <Badge variant="outline" className="text-xs">
                  {article.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {article.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-border/50">
        <Button size="sm" variant="ghost" className="w-full text-xs">
          View more news
        </Button>
      </div>
    </div>
  );
}
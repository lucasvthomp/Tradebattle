import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Star, StarOff } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  // Fetch popular stocks
  const { data: popularStocksData, isLoading: popularStocksLoading } = useQuery({
    queryKey: ["/api/popular"],
    enabled: !!user,
  });

  // Fetch user's watchlist
  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="flex space-x-2">
              <Button 
                variant={currentView === "dashboard" ? "default" : "outline"}
                onClick={() => setCurrentView("dashboard")}
              >
                Portfolio
              </Button>
              <Button 
                variant={currentView === "watchlist" ? "default" : "outline"}
                onClick={() => setCurrentView("watchlist")}
              >
                Watchlist
              </Button>
              <Button 
                variant={currentView === "tournaments" ? "default" : "outline"}
                onClick={() => setCurrentView("tournaments")}
              >
                Tournaments
              </Button>
              <Button 
                variant={currentView === "leaderboard" ? "default" : "outline"}
                onClick={() => setCurrentView("leaderboard")}
              >
                Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$10,000.00</div>
                  <p className="text-xs text-muted-foreground">
                    +$0.00 (+0.00%) today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$10,000.00</div>
                  <p className="text-xs text-muted-foreground">
                    Available to trade
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Day's Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">$0.00</div>
                  <p className="text-xs text-muted-foreground">
                    0.00% change
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">$0.00</div>
                  <p className="text-xs text-muted-foreground">
                    0.00% all time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentView === "watchlist" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Watchlist</h2>
              <Button>Add Stock</Button>
            </div>
            
            {watchlistLoading ? (
              <div>Loading watchlist...</div>
            ) : watchlist.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Star className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No stocks in your watchlist yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {watchlist.map((stock: any) => (
                  <Card key={stock.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{stock.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{stock.companyName}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Loading...</div>
                          <div className="text-sm text-muted-foreground">--</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "tournaments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tournaments</h2>
              <Button>Create Tournament</Button>
            </div>
            
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Tournament functionality will be restored soon.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "leaderboard" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Leaderboard functionality will be restored soon.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
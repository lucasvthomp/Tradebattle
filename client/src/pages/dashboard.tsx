import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WatchlistItem, ResearchInsight } from "@shared/schema";
import { 
  Search, 
  Newspaper, 
  TrendingUp, 
  List, 
  Plus, 
  X,
  Lightbulb,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [newWatchlistItem, setNewWatchlistItem] = useState({ symbol: "", companyName: "", notes: "" });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: watchlist, isLoading: watchlistLoading } = useQuery<WatchlistItem[]>({
    queryKey: ["/api/watchlist"],
    enabled: isAuthenticated,
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<ResearchInsight[]>({
    queryKey: ["/api/insights"],
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (data: { symbol: string; companyName: string; notes: string }) => {
      await apiRequest("POST", "/api/watchlist", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      setNewWatchlistItem({ symbol: "", companyName: "", notes: "" });
      toast({
        title: "Success",
        description: "Added to watchlist successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Success",
        description: "Removed from watchlist",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  const handleAddToWatchlist = () => {
    if (!newWatchlistItem.symbol || !newWatchlistItem.companyName) {
      toast({
        title: "Error",
        description: "Please enter both symbol and company name",
        variant: "destructive",
      });
      return;
    }
    addToWatchlistMutation.mutate(newWatchlistItem);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <Lightbulb className="w-5 h-5 text-green-600" />;
      case "risk":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-black mb-6">Research Dashboard</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional tools for qualitative investment research and analysis
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Tools */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Search,
                  title: "Company Research",
                  description: "Deep dive analysis tools",
                  color: "text-blue-600",
                },
                {
                  icon: Newspaper,
                  title: "News Aggregator",
                  description: "Real-time news analysis",
                  color: "text-green-600",
                },
                {
                  icon: TrendingUp,
                  title: "Sentiment Tracker",
                  description: "Market sentiment analysis",
                  color: "text-purple-600",
                },
                {
                  icon: List,
                  title: "Watchlist",
                  description: "Custom research lists",
                  color: "text-orange-600",
                },
              ].map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <tool.icon className={`w-8 h-8 ${tool.color} mx-auto mb-3`} />
                      <h3 className="font-semibold text-black mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Watchlist */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-black">My Watchlist</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Last updated: {new Date().toLocaleTimeString()}
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Add to Watchlist */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="Symbol"
                          value={newWatchlistItem.symbol}
                          onChange={(e) => setNewWatchlistItem({ ...newWatchlistItem, symbol: e.target.value.toUpperCase() })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={newWatchlistItem.companyName}
                          onChange={(e) => setNewWatchlistItem({ ...newWatchlistItem, companyName: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={newWatchlistItem.notes}
                          onChange={(e) => setNewWatchlistItem({ ...newWatchlistItem, notes: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <Button 
                          onClick={handleAddToWatchlist}
                          disabled={addToWatchlistMutation.isPending}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Watchlist Items */}
                    {watchlistLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : watchlist && watchlist.length > 0 ? (
                      <div className="space-y-4">
                        {watchlist.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-bold text-lg text-black">{item.symbol}</span>
                                <span className="text-gray-600">{item.companyName}</span>
                              </div>
                              {item.notes && (
                                <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromWatchlistMutation.mutate(item.id)}
                                disabled={removeFromWatchlistMutation.isPending}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Your watchlist is empty. Add companies to start tracking.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Research Insights */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-black mb-6">Research Insights</h2>
                    {insightsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : insights && insights.length > 0 ? (
                      <div className="space-y-4">
                        {insights.map((insight, index) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center mb-2">
                              {getInsightIcon(insight.type)}
                              <span className="font-semibold text-black ml-2">{insight.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                            <div className="flex items-center justify-between">
                              {insight.symbol && (
                                <span className="text-xs text-gray-500">Symbol: {insight.symbol}</span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded ${
                                insight.impact === "high" ? "bg-red-100 text-red-800" :
                                insight.impact === "medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                              }`}>
                                {insight.impact} impact
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No research insights available at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Watchlist Items</span>
                        <span className="text-xl font-bold text-black">{watchlist?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Insights</span>
                        <span className="text-xl font-bold text-black">{insights?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Research Score</span>
                        <span className="text-xl font-bold text-green-600">8.5/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Added TECH to watchlist</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Viewed earnings report</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Updated research notes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Research Company
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Newspaper className="w-4 h-4 mr-2" />
                        Check News
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Market Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

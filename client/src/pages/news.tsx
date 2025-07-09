import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { News } from "@shared/schema";
import { Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: news, isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: breakingNews, isLoading: breakingLoading } = useQuery<News[]>({
    queryKey: ["/api/news/breaking"],
  });

  const categories = [
    { id: "all", label: "All News" },
    { id: "breaking", label: "Breaking" },
    { id: "research", label: "Research" },
    { id: "analysis", label: "Analysis" },
    { id: "market", label: "Market" },
  ];

  const filteredNews = news?.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "breaking":
        return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">BREAKING</span>;
      case "research":
        return <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">RESEARCH</span>;
      default:
        return null;
    }
  };

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
              <h1 className="text-5xl font-bold text-black mb-6">Market News & Analysis</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay informed with our curated news and expert analysis. Real-time updates on market movements and research insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Breaking News Banner */}
      {breakingNews && breakingNews.length > 0 && (
        <section className="py-4 bg-red-50 border-l-4 border-red-500">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-bold text-red-900">Breaking News</h3>
                  <p className="text-red-700">{breakingNews[0].title}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main News Feed */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded mb-4"></div>
                          <div className="h-6 bg-gray-200 rounded mb-3"></div>
                          <div className="h-20 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredNews && filteredNews.length > 0 ? (
                  <div className="space-y-6">
                    {filteredNews.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <CardContent className="p-6">
                            <div className="flex items-center mb-3">
                              {getPriorityBadge(item.priority || "normal")}
                              <span className="text-sm text-gray-500 ml-3">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {new Date(item.publishedAt!).toLocaleString()}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500 capitalize">
                                {item.category}
                              </span>
                              <Button variant="ghost" size="sm">
                                Read Analysis
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Available</h3>
                      <p className="text-gray-600 mb-6">
                        {selectedCategory === "all" 
                          ? "No news articles are available at the moment. Check back later for updates."
                          : `No news found in the ${selectedCategory} category.`
                        }
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedCategory("all")}
                      >
                        View All News
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Market Sentiment Tracker */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Market Sentiment Tracker</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Sentiment</span>
                        <span className="text-sm font-semibold text-green-600">Positive</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Weekend News Impact</span>
                        <span className="text-sm font-semibold text-orange-600">High</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Research Opportunities</span>
                        <span className="text-sm font-semibold text-blue-600">12 Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Research Calendar */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Research Calendar</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        <span className="text-sm text-gray-600">Earnings Analysis - Tech Sector</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Weekend News Review</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Market Sentiment Update</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Trending Topics</h3>
                    <div className="space-y-3">
                      {[
                        "Tech Sector Restructuring",
                        "Energy Market Volatility",
                        "Healthcare Regulations",
                        "Financial Earnings",
                      ].map((topic, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{topic}</span>
                        </div>
                      ))}
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

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ResearchInsight, Study, News } from "@shared/schema";
import { TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  
  const { data: insights, isLoading: insightsLoading } = useQuery<ResearchInsight[]>({
    queryKey: ["/api/insights"],
  });

  const { data: recentStudies, isLoading: studiesLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const { data: breakingNews, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news/breaking"],
  });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome back, {user?.name || "Researcher"}!
              </h1>
              <p className="text-xl text-muted-foreground">
                Here's your personalized research dashboard with the latest insights and opportunities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Research Insights */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Research Insights</h2>
                    {insightsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-6 bg-muted rounded mb-3"></div>
                            <div className="h-16 bg-muted rounded"></div>
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
                            className="p-4 bg-muted rounded-lg"
                          >
                            <div className="flex items-center mb-2">
                              {getInsightIcon(insight.type)}
                              <span className="font-semibold text-foreground ml-2">{insight.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            {insight.symbol && (
                              <span className="text-xs text-muted-foreground mt-1 block">
                                Symbol: {insight.symbol}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No insights available at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Studies */}
                <Card className="mt-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Recent Studies</h2>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </div>
                    {studiesLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-6 bg-muted rounded mb-2"></div>
                            <div className="h-16 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentStudies && recentStudies.length > 0 ? (
                      <div className="space-y-4">
                        {recentStudies.slice(0, 3).map((study, index) => (
                          <motion.div
                            key={study.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-muted rounded"
                          >
                            <div>
                              <h3 className="font-semibold text-foreground">{study.title}</h3>
                              <p className="text-sm text-muted-foreground">{study.category}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No studies available at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Breaking News */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Breaking News</h3>
                    {newsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded mb-2"></div>
                            <div className="h-16 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : breakingNews && breakingNews.length > 0 ? (
                      <div className="space-y-4">
                        {breakingNews.slice(0, 2).map((news, index) => (
                          <motion.div
                            key={news.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="border-l-4 border-red-500 pl-4"
                          >
                            <div className="flex items-center mb-1">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold mr-2">
                                BREAKING
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(news.publishedAt!).toLocaleTimeString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-foreground text-sm">{news.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{news.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">No breaking news at the moment.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Market Sentiment */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Market Sentiment</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Overall Sentiment</span>
                        <span className="text-sm font-semibold text-green-600">Positive</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Weekend Impact</span>
                        <span className="text-sm font-semibold text-foreground">High</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Opportunities</span>
                        <span className="text-sm font-semibold text-blue-600">12 Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        New Research
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Risk Alerts
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
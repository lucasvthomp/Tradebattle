import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  X,
  Star,
  StarOff,
  Eye,
  BarChart3,
  LineChart,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Newspaper,
  BookOpen,
  Target,
  Zap,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Bell,
  Settings,
  Download
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Mock data for demonstration with different time periods
const mockWatchlist = [
  { 
    id: 1, 
    symbol: "AAPL", 
    companyName: "Apple Inc.", 
    price: 175.43, 
    volume: "45.2M", 
    marketCap: "2.7T", 
    sector: "Technology",
    changes: {
      "1D": { change: 2.15, changePercent: 1.24 },
      "1W": { change: -3.42, changePercent: -1.91 },
      "1M": { change: 8.73, changePercent: 5.24 },
      "3M": { change: -12.15, changePercent: -6.48 },
      "6M": { change: 18.92, changePercent: 12.08 },
      "1Y": { change: 34.21, changePercent: 24.24 },
      "YTD": { change: 15.67, changePercent: 9.81 }
    }
  },
  { 
    id: 2, 
    symbol: "GOOGL", 
    companyName: "Alphabet Inc.", 
    price: 138.21, 
    volume: "28.1M", 
    marketCap: "1.8T", 
    sector: "Technology",
    changes: {
      "1D": { change: -1.87, changePercent: -1.33 },
      "1W": { change: 4.21, changePercent: 3.14 },
      "1M": { change: -5.42, changePercent: -3.77 },
      "3M": { change: 12.85, changePercent: 10.25 },
      "6M": { change: -8.92, changePercent: -6.08 },
      "1Y": { change: 28.45, changePercent: 25.93 },
      "YTD": { change: 6.78, changePercent: 5.16 }
    }
  },
  { 
    id: 3, 
    symbol: "MSFT", 
    companyName: "Microsoft Corporation", 
    price: 378.85, 
    volume: "22.8M", 
    marketCap: "2.8T", 
    sector: "Technology",
    changes: {
      "1D": { change: 5.23, changePercent: 1.40 },
      "1W": { change: -2.15, changePercent: -0.56 },
      "1M": { change: 15.42, changePercent: 4.24 },
      "3M": { change: 22.75, changePercent: 6.39 },
      "6M": { change: 31.18, changePercent: 8.98 },
      "1Y": { change: 48.92, changePercent: 14.82 },
      "YTD": { change: 19.34, changePercent: 5.38 }
    }
  },
  { 
    id: 4, 
    symbol: "TSLA", 
    companyName: "Tesla Inc.", 
    price: 248.42, 
    volume: "67.9M", 
    marketCap: "789B", 
    sector: "Automotive",
    changes: {
      "1D": { change: -8.15, changePercent: -3.18 },
      "1W": { change: 12.45, changePercent: 5.27 },
      "1M": { change: -21.73, changePercent: -8.04 },
      "3M": { change: 18.92, changePercent: 8.24 },
      "6M": { change: -45.21, changePercent: -15.39 },
      "1Y": { change: -92.15, changePercent: -27.05 },
      "YTD": { change: -15.67, changePercent: -5.93 }
    }
  },
  { 
    id: 5, 
    symbol: "NVDA", 
    companyName: "NVIDIA Corporation", 
    price: 875.28, 
    volume: "41.2M", 
    marketCap: "2.2T", 
    sector: "Technology",
    changes: {
      "1D": { change: 12.45, changePercent: 1.44 },
      "1W": { change: -18.73, changePercent: -2.09 },
      "1M": { change: 45.92, changePercent: 5.54 },
      "3M": { change: 125.43, changePercent: 16.73 },
      "6M": { change: 187.65, changePercent: 27.29 },
      "1Y": { change: 342.18, changePercent: 64.17 },
      "YTD": { change: 89.23, changePercent: 11.35 }
    }
  },
];

const mockMarketData = [
  { name: "S&P 500", value: "4,789.85", change: "+0.72%", trend: "up" },
  { name: "NASDAQ", value: "14,567.23", change: "+1.15%", trend: "up" },
  { name: "DOW", value: "37,248.92", change: "+0.28%", trend: "up" },
  { name: "VIX", value: "12.84", change: "-2.45%", trend: "down" },
];

const mockNews = [
  { id: 1, title: "Tech Stocks Rally as AI Optimism Grows", time: "2 hours ago", source: "ORSATH Research" },
  { id: 2, title: "Federal Reserve Signals Potential Rate Cuts", time: "4 hours ago", source: "Market Watch" },
  { id: 3, title: "Earnings Season Preview: What to Expect", time: "1 day ago", source: "ORSATH Insights" },
  { id: 4, title: "ESG Investing Trends for 2024", time: "2 days ago", source: "Sustainability Report" },
];

const mockInsights = [
  { id: 1, type: "opportunity", title: "Emerging Market Recovery", description: "Our analysis suggests emerging markets are poised for recovery...", priority: "high" },
  { id: 2, type: "risk", title: "Tech Sector Volatility", description: "Increased volatility expected in tech sector due to...", priority: "medium" },
  { id: 3, type: "trend", title: "Green Energy Momentum", description: "Renewable energy stocks showing strong momentum...", priority: "low" },
];

const stockSearchResults = [
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 151.94, sector: "Consumer Discretionary" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 484.26, sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 487.83, sector: "Communication Services" },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 184.92, sector: "Technology" },
  { symbol: "CRWD", name: "CrowdStrike Holdings", price: 298.45, sector: "Technology" },
];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterSector, setFilterSector] = useState("all");
  const [changePeriod, setChangePeriod] = useState("1D");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Access Required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    }
  }, [isAuthenticated, toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const addToWatchlist = (stock: any) => {
    const newStock = {
      id: Date.now(),
      symbol: stock.symbol,
      companyName: stock.name,
      price: stock.price,
      volume: Math.floor(Math.random() * 100) + "M",
      marketCap: Math.floor(Math.random() * 500) + "B",
      sector: stock.sector,
      changes: {
        "1D": { change: (Math.random() - 0.5) * 10, changePercent: (Math.random() - 0.5) * 5 },
        "1W": { change: (Math.random() - 0.5) * 20, changePercent: (Math.random() - 0.5) * 10 },
        "1M": { change: (Math.random() - 0.5) * 50, changePercent: (Math.random() - 0.5) * 25 },
        "3M": { change: (Math.random() - 0.5) * 100, changePercent: (Math.random() - 0.5) * 40 },
        "6M": { change: (Math.random() - 0.5) * 150, changePercent: (Math.random() - 0.5) * 60 },
        "1Y": { change: (Math.random() - 0.5) * 200, changePercent: (Math.random() - 0.5) * 80 },
        "YTD": { change: (Math.random() - 0.5) * 80, changePercent: (Math.random() - 0.5) * 35 }
      }
    };
    setWatchlist([...watchlist, newStock]);
    setShowSearchResults(false);
    setSearchQuery("");
    toast({
      title: "Added to Watchlist",
      description: `${stock.symbol} has been added to your watchlist.`,
    });
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
    toast({
      title: "Removed from Watchlist",
      description: "Stock has been removed from your watchlist.",
    });
  };

  const filteredWatchlist = watchlist
    .filter(stock => filterSector === "all" || stock.sector === filterSector)
    .sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const sectors = ["all", ...Array.from(new Set(watchlist.map(stock => stock.sector)))];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Welcome back, {user?.firstName || "Alexander"}
                </h1>
                <p className="text-gray-600">Here's your investment dashboard</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Market Overview */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockMarketData.map((market, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{market.name}</p>
                        <p className="text-2xl font-bold text-black">{market.value}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {market.trend === "up" ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          market.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {market.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Main Dashboard */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          Portfolio Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                          <p className="text-gray-500">Portfolio chart would go here</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Newspaper className="w-5 h-5 mr-2" />
                          Latest News
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockNews.map((news) => (
                            <div key={news.id} className="flex items-start space-x-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-black line-clamp-2">
                                  {news.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {news.source} • {news.time}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="watchlist" className="space-y-6">
                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search stocks to add..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                    {showSearchResults && (
                      <div className="absolute top-12 left-0 right-0 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {stockSearchResults
                          .filter(stock => 
                            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((stock) => (
                            <div key={stock.symbol} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{stock.symbol}</p>
                                  <p className="text-sm text-gray-600">{stock.name}</p>
                                  <p className="text-xs text-gray-500">{stock.sector}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${stock.price}</p>
                                  <Button
                                    size="sm"
                                    onClick={() => addToWatchlist(stock)}
                                    className="mt-1"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>
                          {sector === "all" ? "All Sectors" : sector}
                        </option>
                      ))}
                    </select>
                    <select
                      value={changePeriod}
                      onChange={(e) => setChangePeriod(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="1D">1 Day</option>
                      <option value="1W">1 Week</option>
                      <option value="1M">1 Month</option>
                      <option value="3M">3 Months</option>
                      <option value="6M">6 Months</option>
                      <option value="1Y">1 Year</option>
                      <option value="YTD">Year to Date</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Watchlist Table */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Your Watchlist ({filteredWatchlist.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4 font-medium">Symbol</th>
                            <th className="text-left py-2 px-4 font-medium">Company</th>
                            <th className="text-left py-2 px-4 font-medium">Price</th>
                            <th className="text-left py-2 px-4 font-medium">
                              Change ({changePeriod})
                            </th>
                            <th className="text-left py-2 px-4 font-medium">Volume</th>
                            <th className="text-left py-2 px-4 font-medium">Market Cap</th>
                            <th className="text-left py-2 px-4 font-medium">Sector</th>
                            <th className="text-left py-2 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWatchlist.map((stock) => (
                            <tr key={stock.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{stock.symbol}</td>
                              <td className="py-3 px-4 text-sm">{stock.companyName}</td>
                              <td className="py-3 px-4 font-medium">${stock.price.toFixed(2)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  {stock.changes[changePeriod].change > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    stock.changes[changePeriod].change > 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {stock.changes[changePeriod].change > 0 ? "+" : ""}{stock.changes[changePeriod].change.toFixed(2)} ({stock.changes[changePeriod].changePercent.toFixed(2)}%)
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{stock.volume}</td>
                              <td className="py-3 px-4 text-sm">{stock.marketCap}</td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="text-xs">
                                  {stock.sector}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <LineChart className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromWatchlist(stock.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Latest Research
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-black">Q4 2024 Tech Sector Analysis</h3>
                          <p className="text-sm text-gray-600 mt-2">
                            Comprehensive analysis of technology sector performance and outlook...
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">Published 2 days ago</span>
                            <Button size="sm" variant="outline">Read More</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-black">ESG Investment Trends</h3>
                          <p className="text-sm text-gray-600 mt-2">
                            Examining the growing impact of ESG factors on investment decisions...
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">Published 5 days ago</span>
                            <Button size="sm" variant="outline">Read More</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Research Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium text-black">Request Custom Research</h3>
                          <p className="text-sm text-gray-600 mt-2">
                            Get personalized research on specific companies or sectors.
                          </p>
                          <Button className="mt-3" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Request
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">AI & Machine Learning Sector</span>
                            <Badge variant="secondary">In Progress</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm font-medium">Renewable Energy Outlook</span>
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {mockInsights.map((insight) => (
                    <Card key={insight.id} className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {insight.type === "opportunity" && <Zap className="w-5 h-5 mr-2 text-green-500" />}
                          {insight.type === "risk" && <AlertCircle className="w-5 h-5 mr-2 text-red-500" />}
                          {insight.type === "trend" && <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />}
                          {insight.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${
                            insight.priority === "high" ? "bg-red-100 text-red-800" :
                            insight.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {insight.priority} priority
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
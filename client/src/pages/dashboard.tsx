import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WatchlistItem, InsertWatchlistItem } from "@shared/schema";
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

// Comprehensive stock database from major indices
const stockSearchResults = [
  // S&P 500 Major Companies
  { symbol: "AAPL", name: "Apple Inc.", price: 175.43, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 378.85, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A", price: 138.21, sector: "Technology" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C", price: 137.95, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 151.94, sector: "Consumer Discretionary" },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.28, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, sector: "Automotive" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 484.26, sector: "Technology" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc. Class B", price: 442.18, sector: "Financial Services" },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", price: 612.95, sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 158.73, sector: "Healthcare" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 221.45, sector: "Financial Services" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", price: 118.42, sector: "Energy" },
  { symbol: "PG", name: "Procter & Gamble Company", price: 162.34, sector: "Consumer Staples" },
  { symbol: "HD", name: "Home Depot Inc.", price: 398.72, sector: "Consumer Discretionary" },
  { symbol: "CVX", name: "Chevron Corporation", price: 158.92, sector: "Energy" },
  { symbol: "MRK", name: "Merck & Co. Inc.", price: 98.45, sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", price: 169.83, sector: "Healthcare" },
  { symbol: "KO", name: "Coca-Cola Company", price: 62.78, sector: "Consumer Staples" },
  { symbol: "PEP", name: "PepsiCo Inc.", price: 158.92, sector: "Consumer Staples" },
  { symbol: "COST", name: "Costco Wholesale Corporation", price: 798.45, sector: "Consumer Staples" },
  { symbol: "LLY", name: "Eli Lilly and Company", price: 712.34, sector: "Healthcare" },
  { symbol: "AVGO", name: "Broadcom Inc.", price: 1284.62, sector: "Technology" },
  { symbol: "WMT", name: "Walmart Inc.", price: 86.73, sector: "Consumer Staples" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 487.83, sector: "Communication Services" },
  { symbol: "BAC", name: "Bank of America Corporation", price: 42.15, sector: "Financial Services" },
  { symbol: "CRM", name: "Salesforce Inc.", price: 295.48, sector: "Technology" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", price: 512.67, sector: "Healthcare" },
  { symbol: "WFC", name: "Wells Fargo & Company", price: 63.84, sector: "Financial Services" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", price: 184.92, sector: "Technology" },
  { symbol: "DIS", name: "Walt Disney Company", price: 98.73, sector: "Communication Services" },
  { symbol: "ACN", name: "Accenture plc", price: 342.15, sector: "Technology" },
  { symbol: "VZ", name: "Verizon Communications Inc.", price: 41.92, sector: "Communication Services" },
  { symbol: "ADBE", name: "Adobe Inc.", price: 485.67, sector: "Technology" },
  { symbol: "PM", name: "Philip Morris International Inc.", price: 118.45, sector: "Consumer Staples" },
  { symbol: "COP", name: "ConocoPhillips", price: 108.92, sector: "Energy" },
  { symbol: "NEE", name: "NextEra Energy Inc.", price: 79.34, sector: "Utilities" },
  { symbol: "RTX", name: "RTX Corporation", price: 115.28, sector: "Industrials" },
  { symbol: "LIN", name: "Linde plc", price: 445.73, sector: "Materials" },
  { symbol: "T", name: "AT&T Inc.", price: 22.45, sector: "Communication Services" },
  { symbol: "UPS", name: "United Parcel Service Inc.", price: 129.67, sector: "Industrials" },
  { symbol: "LOW", name: "Lowe's Companies Inc.", price: 258.42, sector: "Consumer Discretionary" },
  { symbol: "INTU", name: "Intuit Inc.", price: 624.83, sector: "Technology" },
  { symbol: "GS", name: "Goldman Sachs Group Inc.", price: 512.34, sector: "Financial Services" },
  { symbol: "SPGI", name: "S&P Global Inc.", price: 445.92, sector: "Financial Services" },
  { symbol: "CAT", name: "Caterpillar Inc.", price: 345.78, sector: "Industrials" },
  { symbol: "DE", name: "Deere & Company", price: 398.45, sector: "Industrials" },
  { symbol: "MS", name: "Morgan Stanley", price: 112.67, sector: "Financial Services" },
  { symbol: "TJX", name: "TJX Companies Inc.", price: 118.92, sector: "Consumer Discretionary" },
  { symbol: "AXP", name: "American Express Company", price: 248.73, sector: "Financial Services" },
  { symbol: "BKNG", name: "Booking Holdings Inc.", price: 4285.67, sector: "Consumer Discretionary" },
  { symbol: "BLK", name: "BlackRock Inc.", price: 912.45, sector: "Financial Services" },
  { symbol: "MDT", name: "Medtronic plc", price: 87.34, sector: "Healthcare" },
  { symbol: "GE", name: "General Electric Company", price: 172.89, sector: "Industrials" },
  { symbol: "GILD", name: "Gilead Sciences Inc.", price: 91.45, sector: "Healthcare" },
  { symbol: "MMC", name: "Marsh & McLennan Companies", price: 218.67, sector: "Financial Services" },
  { symbol: "ADP", name: "Automatic Data Processing Inc.", price: 285.43, sector: "Technology" },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals Incorporated", price: 412.89, sector: "Healthcare" },
  { symbol: "AMT", name: "American Tower Corporation", price: 212.34, sector: "Real Estate" },
  { symbol: "LRCX", name: "Lam Research Corporation", price: 785.92, sector: "Technology" },
  { symbol: "SYK", name: "Stryker Corporation", price: 342.78, sector: "Healthcare" },
  { symbol: "TGT", name: "Target Corporation", price: 148.92, sector: "Consumer Discretionary" },
  { symbol: "PANW", name: "Palo Alto Networks Inc.", price: 298.45, sector: "Technology" },
  { symbol: "BSX", name: "Boston Scientific Corporation", price: 78.92, sector: "Healthcare" },
  { symbol: "C", name: "Citigroup Inc.", price: 65.43, sector: "Financial Services" },
  { symbol: "CMG", name: "Chipotle Mexican Grill Inc.", price: 2945.67, sector: "Consumer Discretionary" },
  { symbol: "MU", name: "Micron Technology Inc.", price: 104.58, sector: "Technology" },
  { symbol: "SCHW", name: "Charles Schwab Corporation", price: 74.29, sector: "Financial Services" },
  { symbol: "NOW", name: "ServiceNow Inc.", price: 798.45, sector: "Technology" },
  { symbol: "ISRG", name: "Intuitive Surgical Inc.", price: 485.73, sector: "Healthcare" },
  { symbol: "PLD", name: "Prologis Inc.", price: 118.92, sector: "Real Estate" },
  { symbol: "AMAT", name: "Applied Materials Inc.", price: 185.43, sector: "Technology" },
  { symbol: "HON", name: "Honeywell International Inc.", price: 219.78, sector: "Industrials" },
  { symbol: "TXN", name: "Texas Instruments Incorporated", price: 198.45, sector: "Technology" },
  { symbol: "SHW", name: "Sherwin-Williams Company", price: 385.92, sector: "Materials" },
  { symbol: "WM", name: "Waste Management Inc.", price: 218.67, sector: "Industrials" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", price: 78.92, sector: "Financial Services" },
  { symbol: "ETN", name: "Eaton Corporation plc", price: 345.78, sector: "Industrials" },
  { symbol: "ORCL", name: "Oracle Corporation", price: 178.34, sector: "Technology" },
  { symbol: "BDX", name: "Becton Dickinson and Company", price: 242.89, sector: "Healthcare" },
  { symbol: "IBM", name: "International Business Machines Corporation", price: 218.45, sector: "Technology" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", price: 168.92, sector: "Technology" },
  { symbol: "MO", name: "Altria Group Inc.", price: 48.73, sector: "Consumer Staples" },
  { symbol: "USB", name: "U.S. Bancorp", price: 48.92, sector: "Financial Services" },
  { symbol: "NKE", name: "Nike Inc.", price: 78.45, sector: "Consumer Discretionary" },
  { symbol: "CCI", name: "Crown Castle Inc.", price: 89.67, sector: "Real Estate" },
  { symbol: "DHR", name: "Danaher Corporation", price: 245.78, sector: "Healthcare" },
  { symbol: "BMY", name: "Bristol-Myers Squibb Company", price: 54.92, sector: "Healthcare" },
  { symbol: "TMUS", name: "T-Mobile US Inc.", price: 218.45, sector: "Communication Services" },
  { symbol: "SO", name: "Southern Company", price: 78.92, sector: "Utilities" },
  { symbol: "EOG", name: "EOG Resources Inc.", price: 125.43, sector: "Energy" },
  { symbol: "ICE", name: "Intercontinental Exchange Inc.", price: 142.78, sector: "Financial Services" },
  { symbol: "ITW", name: "Illinois Tool Works Inc.", price: 248.92, sector: "Industrials" },
  { symbol: "PNC", name: "PNC Financial Services Group Inc.", price: 198.45, sector: "Financial Services" },
  { symbol: "APD", name: "Air Products and Chemicals Inc.", price: 285.67, sector: "Materials" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals Inc.", price: 812.34, sector: "Healthcare" },
  { symbol: "KLAC", name: "KLA Corporation", price: 685.92, sector: "Technology" },
  { symbol: "CME", name: "CME Group Inc.", price: 218.45, sector: "Financial Services" },
  { symbol: "CSX", name: "CSX Corporation", price: 34.78, sector: "Industrials" },
  { symbol: "AON", name: "Aon plc", price: 358.92, sector: "Financial Services" },
  { symbol: "PGR", name: "Progressive Corporation", price: 245.67, sector: "Financial Services" },
  { symbol: "FCX", name: "Freeport-McMoRan Inc.", price: 42.89, sector: "Materials" },
  { symbol: "EL", name: "Estée Lauder Companies Inc.", price: 89.45, sector: "Consumer Staples" },
  { symbol: "MCO", name: "Moody's Corporation", price: 445.78, sector: "Financial Services" },
  { symbol: "NSC", name: "Norfolk Southern Corporation", price: 245.92, sector: "Industrials" },
  { symbol: "CRWD", name: "CrowdStrike Holdings Inc.", price: 298.45, sector: "Technology" },
  { symbol: "FTNT", name: "Fortinet Inc.", price: 78.92, sector: "Technology" },
  { symbol: "MAR", name: "Marriott International Inc.", price: 258.45, sector: "Consumer Discretionary" },
  { symbol: "JCI", name: "Johnson Controls International plc", price: 78.34, sector: "Industrials" },
  { symbol: "PCAR", name: "PACCAR Inc.", price: 108.92, sector: "Industrials" },
  { symbol: "NXPI", name: "NXP Semiconductors N.V.", price: 234.78, sector: "Technology" },
  { symbol: "ROST", name: "Ross Stores Inc.", price: 148.92, sector: "Consumer Discretionary" },
  { symbol: "GM", name: "General Motors Company", price: 48.73, sector: "Consumer Discretionary" },
  { symbol: "TFC", name: "Truist Financial Corporation", price: 42.89, sector: "Financial Services" },
  { symbol: "AIG", name: "American International Group Inc.", price: 78.45, sector: "Financial Services" },
  { symbol: "MCK", name: "McKesson Corporation", price: 485.92, sector: "Healthcare" },
  { symbol: "O", name: "Realty Income Corporation", price: 58.73, sector: "Real Estate" },
  { symbol: "FAST", name: "Fastenal Company", price: 78.92, sector: "Industrials" },
  { symbol: "MLM", name: "Martin Marietta Materials Inc.", price: 585.43, sector: "Materials" },
  { symbol: "ROP", name: "Roper Technologies Inc.", price: 485.67, sector: "Technology" },
  { symbol: "PAYX", name: "Paychex Inc.", price: 128.45, sector: "Technology" },
  { symbol: "ODFL", name: "Old Dominion Freight Line Inc.", price: 198.92, sector: "Industrials" },
  { symbol: "KMB", name: "Kimberly-Clark Corporation", price: 138.78, sector: "Consumer Staples" },
  { symbol: "COF", name: "Capital One Financial Corporation", price: 148.92, sector: "Financial Services" },
  { symbol: "CTSH", name: "Cognizant Technology Solutions Corporation", price: 78.45, sector: "Technology" },
  { symbol: "CTAS", name: "Cintas Corporation", price: 198.92, sector: "Industrials" },
  { symbol: "MCHP", name: "Microchip Technology Incorporated", price: 89.45, sector: "Technology" },
  { symbol: "VRSK", name: "Verisk Analytics Inc.", price: 258.73, sector: "Technology" },
  { symbol: "GWW", name: "W.W. Grainger Inc.", price: 985.42, sector: "Industrials" },
  { symbol: "YUM", name: "Yum! Brands Inc.", price: 138.92, sector: "Consumer Discretionary" },
  { symbol: "IDXX", name: "IDEXX Laboratories Inc.", price: 485.67, sector: "Healthcare" },
  { symbol: "CMI", name: "Cummins Inc.", price: 285.43, sector: "Industrials" },
  { symbol: "GPN", name: "Global Payments Inc.", price: 128.45, sector: "Technology" },
  { symbol: "MSI", name: "Motorola Solutions Inc.", price: 485.92, sector: "Technology" },
  
  // Additional Growth and Tech Stocks
  { symbol: "SHOP", name: "Shopify Inc.", price: 89.45, sector: "Technology" },
  { symbol: "ROKU", name: "Roku Inc.", price: 68.73, sector: "Technology" },
  { symbol: "SQ", name: "Block Inc.", price: 78.92, sector: "Technology" },
  { symbol: "SNAP", name: "Snap Inc.", price: 11.45, sector: "Technology" },
  { symbol: "PINS", name: "Pinterest Inc.", price: 38.92, sector: "Technology" },
  { symbol: "UBER", name: "Uber Technologies Inc.", price: 78.45, sector: "Technology" },
  { symbol: "LYFT", name: "Lyft Inc.", price: 18.92, sector: "Technology" },
  { symbol: "DOCU", name: "DocuSign Inc.", price: 58.73, sector: "Technology" },
  { symbol: "ZM", name: "Zoom Video Communications Inc.", price: 68.92, sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", price: 28.45, sector: "Technology" },
  { symbol: "SNOW", name: "Snowflake Inc.", price: 128.92, sector: "Technology" },
  { symbol: "DDOG", name: "Datadog Inc.", price: 128.45, sector: "Technology" },
  { symbol: "COIN", name: "Coinbase Global Inc.", price: 248.92, sector: "Technology" },
  { symbol: "RIVN", name: "Rivian Automotive Inc.", price: 18.45, sector: "Automotive" },
  { symbol: "LCID", name: "Lucid Group Inc.", price: 4.82, sector: "Automotive" },
  { symbol: "NIO", name: "NIO Inc.", price: 8.92, sector: "Automotive" },
  { symbol: "XPEV", name: "XPeng Inc.", price: 12.45, sector: "Automotive" },
  { symbol: "LI", name: "Li Auto Inc.", price: 24.78, sector: "Automotive" },
  
  // Healthcare & Biotech
  { symbol: "MRNA", name: "Moderna Inc.", price: 48.92, sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", price: 28.45, sector: "Healthcare" },
  { symbol: "BNTX", name: "BioNTech SE", price: 118.92, sector: "Healthcare" },
  { symbol: "ZTS", name: "Zoetis Inc.", price: 178.45, sector: "Healthcare" },
  { symbol: "BIIB", name: "Biogen Inc.", price: 218.92, sector: "Healthcare" },
  { symbol: "AMGN", name: "Amgen Inc.", price: 278.45, sector: "Healthcare" },
  { symbol: "CAH", name: "Cardinal Health Inc.", price: 118.92, sector: "Healthcare" },
  { symbol: "CVS", name: "CVS Health Corporation", price: 78.45, sector: "Healthcare" },
  { symbol: "WBA", name: "Walgreens Boots Alliance Inc.", price: 28.92, sector: "Healthcare" },
  
  // Energy Sector
  { symbol: "SLB", name: "SLB", price: 48.92, sector: "Energy" },
  { symbol: "HAL", name: "Halliburton Company", price: 38.45, sector: "Energy" },
  { symbol: "BKR", name: "Baker Hughes Company", price: 38.92, sector: "Energy" },
  { symbol: "OXY", name: "Occidental Petroleum Corporation", price: 58.73, sector: "Energy" },
  { symbol: "PSX", name: "Phillips 66", price: 128.45, sector: "Energy" },
  { symbol: "VLO", name: "Valero Energy Corporation", price: 138.92, sector: "Energy" },
  { symbol: "MPC", name: "Marathon Petroleum Corporation", price: 158.45, sector: "Energy" },
  { symbol: "KMI", name: "Kinder Morgan Inc.", price: 18.92, sector: "Energy" },
  { symbol: "WMB", name: "Williams Companies Inc.", price: 38.45, sector: "Energy" },
  { symbol: "OKE", name: "ONEOK Inc.", price: 88.92, sector: "Energy" },
  
  // Financial Services
  { symbol: "V", name: "Visa Inc.", price: 285.43, sector: "Financial Services" },
  { symbol: "MA", name: "Mastercard Incorporated", price: 458.92, sector: "Financial Services" },
  { symbol: "BK", name: "Bank of New York Mellon Corporation", price: 58.73, sector: "Financial Services" },
  { symbol: "STT", name: "State Street Corporation", price: 78.45, sector: "Financial Services" },
  { symbol: "NTRS", name: "Northern Trust Corporation", price: 98.92, sector: "Financial Services" },
  { symbol: "RF", name: "Regions Financial Corporation", price: 22.45, sector: "Financial Services" },
  { symbol: "KEY", name: "KeyCorp", price: 18.92, sector: "Financial Services" },
  { symbol: "FITB", name: "Fifth Third Bancorp", price: 38.45, sector: "Financial Services" },
  { symbol: "HBAN", name: "Huntington Bancshares Incorporated", price: 14.78, sector: "Financial Services" },
  { symbol: "CFG", name: "Citizens Financial Group Inc.", price: 42.89, sector: "Financial Services" },
  
  // Consumer & Retail
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 151.94, sector: "Consumer Discretionary" },
  { symbol: "EBAY", name: "eBay Inc.", price: 58.92, sector: "Consumer Discretionary" },
  { symbol: "ETSY", name: "Etsy Inc.", price: 58.73, sector: "Consumer Discretionary" },
  { symbol: "W", name: "Wayfair Inc.", price: 78.45, sector: "Consumer Discretionary" },
  { symbol: "CHWY", name: "Chewy Inc.", price: 28.92, sector: "Consumer Discretionary" },
  { symbol: "DASH", name: "DoorDash Inc.", price: 148.92, sector: "Consumer Discretionary" },
  { symbol: "ABNB", name: "Airbnb Inc.", price: 128.45, sector: "Consumer Discretionary" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.42, sector: "Automotive" },
  { symbol: "F", name: "Ford Motor Company", price: 10.45, sector: "Automotive" },
  
  // Real Estate
  { symbol: "SPG", name: "Simon Property Group Inc.", price: 158.92, sector: "Real Estate" },
  { symbol: "EXR", name: "Extended Stay America Inc.", price: 128.45, sector: "Real Estate" },
  { symbol: "AVB", name: "AvalonBay Communities Inc.", price: 218.92, sector: "Real Estate" },
  { symbol: "EQR", name: "Equity Residential", price: 78.45, sector: "Real Estate" },
  { symbol: "WELL", name: "Welltower Inc.", price: 118.92, sector: "Real Estate" },
  { symbol: "VTR", name: "Ventas Inc.", price: 58.73, sector: "Real Estate" },
  { symbol: "HCP", name: "Healthpeak Properties Inc.", price: 22.45, sector: "Real Estate" },
  { symbol: "PSA", name: "Public Storage", price: 358.92, sector: "Real Estate" },
  { symbol: "EXR", name: "Extended Stay America Inc.", price: 158.45, sector: "Real Estate" },
];

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockData, setStockData] = useState([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [popularStocks, setPopularStocks] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterSector, setFilterSector] = useState("all");
  const [changePeriod, setChangePeriod] = useState("1D");

  // Fetch user's watchlist
  const { data: watchlist = [], isLoading: watchlistLoading, refetch: refetchWatchlist } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (item: InsertWatchlistItem) => {
      const res = await apiRequest("POST", "/api/watchlist", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Added to watchlist",
        description: "Stock has been added to your watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({
        title: "Removed from watchlist",
        description: "Stock has been removed from your watchlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Authentication handled by router

  // Add query for cached company data
  const { data: cachedCompanies = [], isLoading: cachedLoading } = useQuery({
    queryKey: ["/api/companies/cached"],
    enabled: !!user,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Use cached data for popular stocks
  useEffect(() => {
    if (cachedCompanies.length > 0) {
      // Select first 10 companies from cache as popular stocks
      setPopularStocks(cachedCompanies.slice(0, 10));
      setIsLoadingPopular(false);
    }
  }, [cachedCompanies]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsLoadingStocks(true);
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const results = await response.json();
          setStockData(results);
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
      } finally {
        setIsLoadingStocks(false);
      }
    }
    setShowSearchResults(query.length > 0);
  };

  const addToWatchlist = async (stock: any) => {
    addToWatchlistMutation.mutate({
      symbol: stock.symbol,
      companyName: stock.name,
      price: stock.currentPrice,
      marketCap: stock.marketCap,
      sector: stock.sector,
      change: stock.change,
      changePercent: stock.changePercent,
    });
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return (marketCap / 1000000).toFixed(1) + "T";
    } else if (marketCap >= 1000) {
      return (marketCap / 1000).toFixed(1) + "B";
    } else {
      return marketCap.toFixed(1) + "M";
    }
  };

  const removeFromWatchlist = (id: number) => {
    removeFromWatchlistMutation.mutate(id);
  };

  // Enrich watchlist with cached company data
  const enrichedWatchlist = watchlist.map(stock => {
    const cachedData = cachedCompanies.find((company: any) => company.symbol === stock.symbol);
    if (cachedData) {
      return {
        ...stock,
        currentPrice: cachedData.currentPrice,
        volume: cachedData.volume,
        marketCap: formatMarketCap(cachedData.marketCap),
        sector: cachedData.sector,
        changes: cachedData.changes,
        lastUpdated: cachedData.lastUpdated
      };
    }
    return stock;
  });

  const filteredWatchlist = enrichedWatchlist
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
                  Welcome back, {user?.firstName || user?.email || "User"}
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
                        {isLoadingStocks ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                            <div className="mt-2 text-sm text-gray-600">Searching stocks...</div>
                          </div>
                        ) : stockData.length > 0 ? (
                          stockData.map((stock: any, index) => (
                            <div key={index} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{stock.symbol}</p>
                                  <p className="text-sm text-gray-600">{stock.name}</p>
                                  <p className="text-xs text-gray-500">{stock.sector}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${stock.currentPrice.toFixed(2)}</p>
                                  <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                  </p>
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
                          ))
                        ) : searchQuery.length > 0 && (
                          <div className="p-4 text-center text-gray-600">
                            No stocks found for "{searchQuery}"
                          </div>
                        )}
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
                              <td className="py-3 px-4 font-medium">
                                ${stock.currentPrice ? stock.currentPrice.toFixed(2) : (stock.price ? stock.price.toFixed(2) : 'N/A')}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  {stock.changes && stock.changes[changePeriod] ? (
                                    <>
                                      {stock.changes[changePeriod].changePercent >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                      )}
                                      <span className={`text-sm font-medium ${
                                        stock.changes[changePeriod].changePercent >= 0 ? "text-green-600" : "text-red-600"
                                      }`}>
                                        {stock.changes[changePeriod].changePercent >= 0 ? '+' : ''}{stock.changes[changePeriod].changePercent.toFixed(2)}%
                                      </span>
                                      <span className={`text-xs ${
                                        stock.changes[changePeriod].change >= 0 ? "text-green-500" : "text-red-500"
                                      }`}>
                                        (${stock.changes[changePeriod].change >= 0 ? '+' : ''}{stock.changes[changePeriod].change.toFixed(2)})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      Loading...
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{stock.volume || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm">{stock.marketCap || 'N/A'}</td>
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
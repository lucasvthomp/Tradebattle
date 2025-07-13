import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WatchlistItem, InsertWatchlistItem, StockPurchase, InsertStockPurchase, Tournament, InsertTournament } from "@shared/schema";
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

  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Bell,
  Settings,
  Download,
  Building,
  Trophy
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("tournament");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterSector, setFilterSector] = useState("all");
  const [changePeriod, setChangePeriod] = useState("1D");
  

  
  // Trading state
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [selectedTradingStock, setSelectedTradingStock] = useState<any>(null);
  const [shareAmount, setShareAmount] = useState("");
  const [tradingSearchQuery, setTradingSearchQuery] = useState("");
  const [tradingStockData, setTradingStockData] = useState<any[]>([]);
  const [showTradingSearchResults, setShowTradingSearchResults] = useState(false);
  const [isLoadingTradingStocks, setIsLoadingTradingStocks] = useState(false);
  const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(false);
  const [isCreateTournamentDialogOpen, setIsCreateTournamentDialogOpen] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [startingBalance, setStartingBalance] = useState("10000");
  const [createdTournament, setCreatedTournament] = useState<any>(null);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [isJoinTournamentDialogOpen, setIsJoinTournamentDialogOpen] = useState(false);
  const [joinGameCode, setJoinGameCode] = useState("");
  const [stockPrices, setStockPrices] = useState<{[key: string]: number}>({});
  
  // Sell dialog state
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  const [sellAmount, setSellAmount] = useState("");

  // Helper function to determine refresh interval based on subscription tier and timeframe
  const getRefreshInterval = (timeframe: string) => {
    // Free tier gets 15-minute intervals for 1D and 5D, 1-day intervals for longer periods
    if (user?.subscriptionTier === 'novice') {
      return (timeframe === '1D' || timeframe === '5D') ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000;
    }
    
    // Paid tiers get 1-minute intervals for 1D and 5D, 5-minute for longer periods
    return (timeframe === '1D' || timeframe === '5D') ? 1 * 60 * 1000 : 5 * 60 * 1000;
  };

  // Fetch user's watchlist
  const { data: watchlist = [], isLoading: watchlistLoading, refetch: refetchWatchlist } = useQuery({
    queryKey: ["/api/watchlist"],
    enabled: !!user,
  });

  // Fetch individual stock quotes for watchlist items not in popular stocks
  const watchlistSymbols = watchlist.map(stock => stock.symbol);
  const { data: individualStockData = [], isLoading: individualStockLoading } = useQuery({
    queryKey: ["/api/watchlist-quotes", watchlistSymbols],
    queryFn: async () => {
      const promises = watchlistSymbols.map(async (symbol) => {
        try {
          const response = await fetch(`/api/quote/${symbol}`);
          if (response.ok) {
            const result = await response.json();
            return result.success ? result.data : null;
          }
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          return null;
        }
      });
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    enabled: !!user && watchlistSymbols.length > 0,
    refetchInterval: getRefreshInterval(changePeriod),
  });

  // Tournament-specific trading queries with unique keys
  const tournamentId = selectedTournament?.tournaments?.id;
  const { data: tournamentBalance, refetch: refetchBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['tournament-balance', tournamentId, user?.id],
    queryFn: async () => {
      if (!tournamentId) return null;

      const response = await fetch(`/api/tournaments/${tournamentId}/balance`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!user && !!tournamentId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0
  });

  const { data: tournamentPurchases, refetch: refetchPurchases, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['tournament-purchases', tournamentId, user?.id],
    queryFn: async () => {
      if (!tournamentId) return null;

      const response = await fetch(`/api/tournaments/${tournamentId}/purchases`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!user && !!tournamentId,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0
  });

  // Tournament participants query
  const { data: tournamentParticipants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['tournament-participants', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return null;

      const response = await fetch(`/api/tournaments/${tournamentId}/participants`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!user && !!tournamentId,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    cacheTime: 60000 // 1 minute
  });

  // Use tournament data when available, otherwise use regular balance
  const currentBalance = selectedTournament?.tournaments?.id 
    ? Number(tournamentBalance?.data?.balance || selectedTournament?.balance || 0)
    : 0;
  
  // Tournament balance is working correctly
  const currentPurchases = selectedTournament?.tournaments?.id 
    ? tournamentPurchases?.data || []
    : [];

  // Fetch current prices for purchased stocks
  const purchasedSymbols = currentPurchases.map((purchase: any) => purchase.symbol);
  const { data: purchasedStockPrices, isLoading: isLoadingPurchasedPrices } = useQuery({
    queryKey: ['purchased-stock-prices', purchasedSymbols],
    queryFn: async () => {
      if (purchasedSymbols.length === 0) return {};
      
      const promises = purchasedSymbols.map(async (symbol: string) => {
        try {
          const response = await fetch(`/api/quote/${symbol}`);
          if (response.ok) {
            const result = await response.json();
            return result.success ? { symbol, price: result.data.price } : null;
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          return null;
        }
      });
      const results = await Promise.all(promises);
      const prices: {[key: string]: number} = {};
      results.forEach(result => {
        if (result) {
          prices[result.symbol] = result.price;
        }
      });
      return prices;
    },
    enabled: purchasedSymbols.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update stock prices when new data comes in
  useEffect(() => {
    if (purchasedStockPrices) {
      setStockPrices(purchasedStockPrices);
    }
  }, [purchasedStockPrices]);

  // Refetch balance when tournament changes
  useEffect(() => {
    if (selectedTournament?.tournaments?.id) {
      refetchBalance();
      refetchPurchases();
    }
  }, [selectedTournament?.tournaments?.id, refetchBalance, refetchPurchases]);

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
      // Check if it's a watchlist limit error
      if (error.message.includes("limited to 5 equities")) {
        toast({
          title: "Watchlist Limit Reached",
          description: "Free accounts can only track 5 stocks. Upgrade to add more to your watchlist.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
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

  // Search handler for watchlist
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
          setShowSearchResults(true);
        }
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
    }
  };

  // Add stock to watchlist from search results
  const addToWatchlist = (stock: any) => {
    const watchlistItem: InsertWatchlistItem = {
      symbol: stock.symbol,
      companyName: stock.name,
      notes: ""
    };
    
    addToWatchlistMutation.mutate(watchlistItem);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearchResults && !(event.target as Element).closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournament: InsertTournament) => {
      const res = await apiRequest("POST", "/api/tournaments", tournament);
      return res.json();
    },
    onSuccess: (response) => {
      const tournament = response.data;
      setCreatedTournament(tournament);
      setIsCreateTournamentDialogOpen(false);
      setTournamentName("");
      setMaxPlayers("10");
      setStartingBalance("10000");
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      // Invalidate balance query for the newly created tournament
      queryClient.invalidateQueries({ queryKey: ['tournament-balance', tournament.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tournament-purchases', tournament.id, user?.id] });
      // Invalidate participants cache for the new tournament
      queryClient.invalidateQueries({ queryKey: ['tournament-participants', tournament.id] });
      toast({
        title: "Tournament created!",
        description: `Tournament "${tournament.name}" has been created. Code: ${tournament.code}`,
      });
      
      // Auto-select the newly created tournament after a short delay to ensure queries are updated
      setTimeout(() => {
        const tournamentWithBalance = { tournaments: tournament, balance: null };
        setSelectedTournament(tournamentWithBalance);
        setSelectedTournamentId(tournament.id.toString());
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", `/api/tournaments/${code}/join`, {});
      return res.json();
    },
    onSuccess: (response) => {
      const tournament = response.data;
      setIsJoinTournamentDialogOpen(false);
      setJoinGameCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      // Invalidate participants cache for the joined tournament
      queryClient.invalidateQueries({ queryKey: ['tournament-participants', tournament.tournamentId] });
      toast({
        title: "Joined tournament!",
        description: `Successfully joined tournament "${tournament.name}". Code: ${tournament.code}`,
      });
      
      // Auto-select the newly joined tournament after a short delay
      setTimeout(() => {
        const tournamentWithBalance = { tournaments: tournament, balance: null };
        setSelectedTournament(tournamentWithBalance);
        setSelectedTournamentId(tournament.id.toString());
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch user tournaments
  const { data: tournamentResponse, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  // Extract tournaments from response
  const userTournaments = tournamentResponse?.data || [];

  // Auto-select first tournament if none selected
  useEffect(() => {
    if (userTournaments.length > 0 && !selectedTournamentId) {
      const firstTournament = userTournaments[0];
      setSelectedTournamentId(firstTournament.tournaments.id.toString());
      setSelectedTournament(firstTournament);
    }
  }, [userTournaments, selectedTournamentId]);

  // Update selectedTournament when selectedTournamentId changes
  useEffect(() => {
    if (selectedTournamentId && userTournaments.length > 0) {
      const tournament = userTournaments.find((t: any) => 
        t.tournaments.id.toString() === selectedTournamentId
      );
      if (tournament) {
        setSelectedTournament(tournament);
      }
    }
  }, [selectedTournamentId, userTournaments]);



  // Tournament trading mutations
  const purchaseStockMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      const tournamentId = selectedTournament?.tournaments?.id;
      if (!tournamentId) {
        throw new Error("No tournament selected");
      }
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/purchase`, purchaseData);
      return res.json();
    },
    onSuccess: () => {
      const tournamentId = selectedTournament?.tournaments?.id;
      if (tournamentId) {
        queryClient.invalidateQueries({ queryKey: ['tournament-balance', tournamentId, user?.id] });
        queryClient.invalidateQueries({ queryKey: ['tournament-purchases', tournamentId, user?.id] });
        // Also refetch immediately
        refetchBalance();
        refetchPurchases();
      }
      toast({
        title: "Purchase Successful",
        description: "Stock has been added to your tournament portfolio",
      });
      setIsBuyDialogOpen(false);
      setSelectedTradingStock(null);
      setShareAmount("");
      // Clear the search bar after successful purchase
      setTradingSearchQuery("");
      setTradingStockData([]);
      setShowTradingSearchResults(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sell stock mutation
  const sellStockMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const tournamentId = selectedTournament?.tournaments?.id;
      if (!tournamentId) {
        throw new Error("No tournament selected");
      }
      const res = await apiRequest("POST", `/api/tournaments/${tournamentId}/sell`, saleData);
      return res.json();
    },
    onSuccess: () => {
      const tournamentId = selectedTournament?.tournaments?.id;
      if (tournamentId) {
        queryClient.invalidateQueries({ queryKey: ['tournament-balance', tournamentId, user?.id] });
        queryClient.invalidateQueries({ queryKey: ['tournament-purchases', tournamentId, user?.id] });
        // Also refetch immediately
        refetchBalance();
        refetchPurchases();
      }
      toast({
        title: "Sale Successful",
        description: "Stock has been sold and funds added to your tournament balance",
      });
      setIsSellDialogOpen(false);
      setSelectedSellStock(null);
      setSellAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Sale Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  // Trading search function
  const handleTradingSearch = async (query: string) => {
    setTradingSearchQuery(query);
    
    if (query.length < 2) {
      setTradingStockData([]);
      setShowTradingSearchResults(false);
      return;
    }

    setIsLoadingTradingStocks(true);
    setShowTradingSearchResults(true);

    try {
      const response = await fetch(`/api/search/${query}`);
      const data = await response.json();
      
      if (data.success) {
        setTradingStockData(data.data);
      } else {
        setTradingStockData([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setTradingStockData([]);
    } finally {
      setIsLoadingTradingStocks(false);
    }
  };

  // Handle buy button click
  const handleBuyStock = async (stock: any) => {
    // If the stock already has a price, use it directly
    if (stock.price && stock.price > 0) {
      setSelectedTradingStock(stock);
      setIsBuyDialogOpen(true);
      return;
    }

    // Otherwise, fetch the current price
    try {
      const response = await fetch(`/api/quote/${stock.symbol}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const stockWithPrice = {
          ...stock,
          price: data.data.price,
          name: data.data.name || stock.name,
        };
        setSelectedTradingStock(stockWithPrice);
        setIsBuyDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Unable to fetch current price for this stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
      toast({
        title: "Error",
        description: "Unable to fetch current price for this stock",
        variant: "destructive",
      });
    }
  };

  // Handle sell stock
  const handleSellStock = async (purchase: any) => {
    try {
      // Get current price for the stock
      const response = await fetch(`/api/quote/${purchase.symbol}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const currentPrice = data.data.price;
        const totalValue = purchase.shares * currentPrice;
        
        // Confirm sale
        const confirmed = confirm(
          `Sell ${purchase.shares} shares of ${purchase.symbol} at $${currentPrice.toFixed(2)} per share?\n\nTotal value: $${totalValue.toFixed(2)}`
        );
        
        if (confirmed) {
          const saleData = {
            purchaseId: purchase.id,
            shares: purchase.shares,
            salePrice: currentPrice,
            totalValue: totalValue
          };
          
          sellStockMutation.mutate(saleData);
        }
      } else {
        toast({
          title: "Error",
          description: "Unable to fetch current price for this stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error selling stock:', error);
      toast({
        title: "Error",
        description: "Unable to sell stock at this time",
        variant: "destructive",
      });
    }
  };

  // Handle purchase submission
  const handlePurchaseSubmit = () => {
    if (!selectedTradingStock || !shareAmount || parseInt(shareAmount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of shares",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTradingStock.price || selectedTradingStock.price <= 0) {
      toast({
        title: "Price unavailable",
        description: "Stock price is not available for this stock",
        variant: "destructive",
      });
      return;
    }

    const shares = parseInt(shareAmount);
    const totalCost = shares * selectedTradingStock.price;

    // Check if user has enough balance
    const currentBalanceAmount = parseFloat(currentBalance?.toString() || '0');
    if (totalCost > currentBalanceAmount) {
      toast({
        title: "Insufficient funds",
        description: `You need $${totalCost.toFixed(2)} but only have $${currentBalanceAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    purchaseStockMutation.mutate({
      symbol: selectedTradingStock.symbol,
      companyName: selectedTradingStock.name || selectedTradingStock.symbol,
      shares: shares,
      purchasePrice: selectedTradingStock.price.toString(),
      totalCost: totalCost.toString(),
    });
  };

  // Authentication handled by router

  // Add query for popular stocks
  const { data: popularStocksData, isLoading: cachedLoading } = useQuery({
    queryKey: ["/api/popular"],
    enabled: !!user,
    refetchInterval: getRefreshInterval(changePeriod),
  });

  // Use popular stocks data
  useEffect(() => {
    if (popularStocksData?.success && popularStocksData.data) {
      setPopularStocks(popularStocksData.data);
      setIsLoadingPopular(false);
    }
  }, [popularStocksData]);

  // Fetch timeframe-specific performance data for watchlist
  const { data: performanceData = {} } = useQuery({
    queryKey: ["/api/performance", watchlist.map(s => s.symbol), changePeriod],
    queryFn: async () => {
      if (watchlist.length === 0) return {};
      
      const performancePromises = watchlist.map(async (stock) => {
        try {
          const response = await fetch(`/api/performance/${stock.symbol}/${changePeriod}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              return { [stock.symbol]: result.data };
            }
          }
          return { [stock.symbol]: null };
        } catch (error) {
          console.error(`Error fetching ${changePeriod} data for ${stock.symbol}:`, error);
          return { [stock.symbol]: null };
        }
      });
      
      const results = await Promise.all(performancePromises);
      return Object.assign({}, ...results);
    },
    enabled: !!user && watchlist.length > 0,
    refetchInterval: getRefreshInterval(changePeriod),
  });

  // Fetch all available sectors
  const { data: allSectors = [] } = useQuery({
    queryKey: ["/api/sectors"],
    queryFn: async () => {
      const response = await fetch('/api/sectors');
      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data : [];
      }
      return [];
    },
  });



  const formatMarketCap = (marketCap: number | string) => {
    // If already formatted, return as is
    if (typeof marketCap === 'string') {
      return marketCap;
    }
    
    // If not a number, return N/A
    if (!marketCap || typeof marketCap !== 'number') {
      return 'N/A';
    }
    
    if (marketCap >= 1000000000000) {
      return (marketCap / 1000000000000).toFixed(1) + "T";
    } else if (marketCap >= 1000000000) {
      return (marketCap / 1000000000).toFixed(1) + "B";
    } else if (marketCap >= 1000000) {
      return (marketCap / 1000000).toFixed(1) + "M";
    } else {
      return marketCap.toFixed(1) + "K";
    }
  };

  const removeFromWatchlist = (id: number) => {
    removeFromWatchlistMutation.mutate(id);
  };

  // Enrich watchlist with real-time data
  const enrichedWatchlist = watchlist.map(stock => {
    // Get timeframe-specific data for the selected period
    const timeframeSpecificData = performanceData[stock.symbol];
    
    // First try to find data in popular stocks for current price
    const popularData = popularStocks.find((company: any) => company.symbol === stock.symbol);
    const individualData = individualStockData.find((company: any) => company.symbol === stock.symbol);
    
    // Use current price from popular or individual data
    const currentPrice = popularData?.price || individualData?.price || stock.price;
    const volume = popularData?.volume || individualData?.volume || stock.volume || 0;
    const marketCap = popularData?.marketCap || individualData?.marketCap || stock.marketCap || 0;
    const sector = popularData?.sector || individualData?.sector || stock.sector || "N/A";
    
    // Get the correct historical close price based on timeframe
    let historicalClose = 0;
    
    if (changePeriod === '1D') {
      // For 1D, use previous close (trading day before)
      historicalClose = popularData?.previousClose || individualData?.previousClose || (currentPrice - (popularData?.change || individualData?.change || 0));
    } else {
      // For other timeframes, use the historical open price from performance data
      if (timeframeSpecificData) {
        historicalClose = timeframeSpecificData.startPrice || timeframeSpecificData.previousClose || 0;
      } else {
        // Fallback to previous close if timeframe data not available
        historicalClose = popularData?.previousClose || individualData?.previousClose || (currentPrice - (popularData?.change || individualData?.change || 0));
      }
    }
    
    // For 1D changes: Always calculate from current price vs previous close
    // For long-term changes: Use Yahoo Finance timeframe data
    let finalChange = 0;
    let finalChangePercent = 0;
    
    if (changePeriod === '1D') {
      // 1D: Calculate change immediately from current price vs previous close
      finalChange = currentPrice - historicalClose;
      finalChangePercent = historicalClose > 0 ? ((finalChange / historicalClose) * 100) : 0;
    } else {
      // Long-term: Use Yahoo Finance timeframe-specific data
      if (timeframeSpecificData) {
        finalChange = timeframeSpecificData.change;
        finalChangePercent = timeframeSpecificData.percentChange;
      } else {
        // Fallback to current data if timeframe data not available
        finalChange = popularData?.change || individualData?.change || 0;
        finalChangePercent = popularData?.percentChange || individualData?.percentChange || 0;
      }
    }
    
    return {
      ...stock,
      currentPrice,
      previousClose: historicalClose,
      volume,
      marketCap,
      sector,
      change: finalChange,
      changePercent: finalChangePercent,
      currency: popularData?.currency || individualData?.currency || stock.currency || "USD",
      lastUpdated: Date.now()
    };
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

  // Limit watchlist display to 3 items by default
  const displayedWatchlist = isWatchlistExpanded ? filteredWatchlist : filteredWatchlist.slice(0, 3);

  const sectors = ["all", ...allSectors];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-none">
        <motion.div
          className="max-w-none mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          {/* Header */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {user?.firstName || user?.email || "User"}
                </h1>
                <p className="text-muted-foreground">Here's your trading dashboard</p>
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

          {/* Watchlist */}
          <motion.div className="mb-8" variants={fadeInUp}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Your Watchlist</h2>
              <div className="flex items-center space-x-4">
                {/* Add Stock Search */}
                <div className="relative search-container">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stocks to add to watchlist..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 min-w-[350px]"
                  />
                  {showSearchResults && (
                    <div className="absolute top-12 left-0 right-0 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                      {searchResults.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="p-3 hover:bg-accent border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{stock.name}</div>
                              <div className="text-xs text-muted-foreground">{stock.exchange}</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToWatchlist(stock)}
                              className="ml-2"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                      {searchResults.length === 0 && searchQuery && (
                        <div className="p-3 text-sm text-muted-foreground">
                          No stocks found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <select 
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>
                      {sector === "all" ? "All Sectors" : sector}
                    </option>
                  ))}
                </select>
                <select 
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  value={changePeriod}
                  onChange={(e) => setChangePeriod(e.target.value as '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD')}
                >
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="YTD">Year to Date</option>
                </select>
                <select 
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="companyName">Alphabetical</option>
                  <option value="currentPrice">Price</option>
                  <option value="changePercent">% Change</option>
                  <option value="volume">Volume</option>
                  <option value="marketCap">Market Cap</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {(changePeriod === '1D' || changePeriod === '5D') ? 
                      '1min' : 
                      '5min'} refresh
                  </span>
                </div>
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
                        <th className="text-left py-2 px-4 font-medium">Close Price ({changePeriod} ago)</th>
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
                      {displayedWatchlist.map((stock) => (
                        <tr key={stock.id} className="border-b hover:bg-muted">
                          <td className="py-3 px-4 font-medium text-foreground">{stock.symbol}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{stock.companyName}</td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            ${stock.currentPrice ? stock.currentPrice.toFixed(2) : (stock.price ? stock.price.toFixed(2) : 'N/A')}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {stock.previousClose ? `$${stock.previousClose.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              {stock.changePercent !== undefined && stock.change !== undefined ? (
                                <>
                                  {stock.changePercent >= 0 ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                  </span>
                                  <span className={`text-xs ${
                                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                                  }`}>
                                    (${stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)})
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{stock.volume ? stock.volume.toLocaleString() : 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{formatMarketCap(stock.marketCap)}</td>
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
                
                {/* Show More/Show Less Button */}
                {filteredWatchlist.length > 3 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsWatchlistExpanded(!isWatchlistExpanded)}
                    >
                      {isWatchlistExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Create Game and Join Game Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <Dialog open={isCreateTournamentDialogOpen} onOpenChange={setIsCreateTournamentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Create Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Tournament</DialogTitle>
                    <DialogDescription>
                      Create a new paper trading tournament. Max 10 players.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tournament-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="tournament-name"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        className="col-span-3"
                        placeholder="Enter tournament name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="starting-balance" className="text-right">
                        Starting Balance ($)
                      </Label>
                      <Input
                        id="starting-balance"
                        type="number"
                        value={startingBalance}
                        onChange={(e) => setStartingBalance(e.target.value)}
                        className="col-span-3"
                        placeholder="10000.00"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max-players" className="text-right">
                        Max Players
                      </Label>
                      <Input
                        id="max-players"
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        className="col-span-3"
                        min="2"
                        max="10"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateTournamentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        if (tournamentName && startingBalance) {
                          createTournamentMutation.mutate({
                            name: tournamentName,
                            maxPlayers: parseInt(maxPlayers),
                            startingBalance: parseFloat(startingBalance)
                          });
                        }
                      }}
                      disabled={!tournamentName || !startingBalance || createTournamentMutation.isPending}
                    >
                      {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isJoinTournamentDialogOpen} onOpenChange={setIsJoinTournamentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                    Join Game
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Join Tournament</DialogTitle>
                    <DialogDescription>
                      Enter the unique game code to join an existing tournament.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="game-code" className="text-right">
                        Game Code
                      </Label>
                      <Input
                        id="game-code"
                        value={joinGameCode}
                        onChange={(e) => setJoinGameCode(e.target.value.toUpperCase())}
                        className="col-span-3 font-mono"
                        placeholder="Enter 8-character code"
                        maxLength={8}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsJoinTournamentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        if (joinGameCode && joinGameCode.length === 8) {
                          joinTournamentMutation.mutate(joinGameCode);
                        }
                      }}
                      disabled={!joinGameCode || joinGameCode.length !== 8 || joinTournamentMutation.isPending}
                    >
                      {joinTournamentMutation.isPending ? 'Joining...' : 'Join Tournament'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Main Dashboard */}
          <motion.div variants={fadeInUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1 mb-6">
                <TabsTrigger value="tournament">Tournament</TabsTrigger>
              </TabsList>


              <TabsContent value="tournament" className="space-y-6">
                {/* Tournament Code Display */}
                {createdTournament && (
                  <Card className="border-0 shadow-lg border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-800">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Tournament Created Successfully!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-green-700">
                          <strong>Tournament:</strong> {createdTournament?.name || 'Unknown'}
                        </p>
                        <p className="text-green-700">
                          <strong>Join Code:</strong> <span className="font-mono text-lg">{createdTournament?.code || 'N/A'}</span>
                        </p>
                        <p className="text-green-700">
                          <strong>Buy-in:</strong> ${createdTournament?.buyInAmount || 0}
                        </p>
                        <p className="text-sm text-green-600">
                          Share this code with other players so they can join your tournament!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tournament Header & Selector */}
                {userTournaments.length > 0 ? (
                  <div className="space-y-6">
                    {/* Tournament Header with Selector */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Your Tournaments
                          </CardTitle>
                          <Select value={selectedTournamentId || userTournaments[0]?.tournaments?.id?.toString()} onValueChange={setSelectedTournamentId}>
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select a tournament" />
                            </SelectTrigger>
                            <SelectContent>
                              {userTournaments.map((tournament: any) => (
                                <SelectItem key={tournament.tournaments.id} value={tournament.tournaments.id.toString()}>
                                  {tournament.tournaments.name} - {tournament.tournaments.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Selected Tournament Content */}
                    {(() => {
                      const selectedTournament = userTournaments.find((t: any) => 
                        t.tournaments.id.toString() === (selectedTournamentId || userTournaments[0]?.tournaments?.id?.toString())
                      ) || userTournaments[0];

                      if (!selectedTournament) return null;

                      return (
                        <div className="space-y-6">
                          {/* Tournament Details */}
                          <Card className="border-0 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Activity className="w-5 h-5 mr-2" />
                                  {selectedTournament.tournaments.name}
                                </div>
                                <Badge variant={selectedTournament.tournaments.status === 'waiting' ? 'secondary' : 'default'}>
                                  {selectedTournament.tournaments.status}
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Join Code</p>
                                  <p className="font-mono text-lg font-semibold">{selectedTournament.tournaments.code}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Your Balance</p>
                                  <p className="text-lg font-semibold">${currentBalance.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Players</p>
                                  {isLoadingParticipants ? (
                                    <p className="text-sm text-muted-foreground">Loading...</p>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-lg font-semibold">{tournamentParticipants?.data?.length || 0}/{selectedTournament.tournaments.maxPlayers}</p>
                                      <div className="text-sm text-muted-foreground">
                                        {tournamentParticipants?.data?.map((participant: any, index: number) => (
                                          <span key={participant.id}>
                                            {participant.firstName}
                                            {index < (tournamentParticipants.data.length - 1) ? ', ' : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Tournament Balance */}


                          {/* Tournament Trading Section */}
                          <Card className="border-0 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Trade in {selectedTournament.tournaments.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="relative">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search stocks to buy in this tournament..."
                                    value={tradingSearchQuery}
                                    onChange={(e) => handleTradingSearch(e.target.value)}
                                    className="pl-10"
                                  />
                                  {showTradingSearchResults && (
                                    <div className="absolute top-12 left-0 right-0 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                                      {isLoadingTradingStocks ? (
                                        <div className="p-4 text-center">
                                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                          <div className="mt-2 text-sm text-muted-foreground">Searching stocks...</div>
                                        </div>
                                      ) : tradingStockData.length > 0 ? (
                                        tradingStockData.map((stock: any, index) => (
                                          <div key={index} className="p-3 hover:bg-muted border-b last:border-b-0">
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1">
                                                <p className="font-medium text-foreground">{stock.symbol}</p>
                                                <p className="text-sm text-muted-foreground">{stock.name}</p>
                                                <p className="text-sm font-medium text-foreground">${stock.price}</p>
                                              </div>
                                              <Button
                                                size="sm"
                                                onClick={() => handleBuyStock(stock)}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                              >
                                                Buy
                                              </Button>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="p-4 text-center text-muted-foreground">
                                          {tradingSearchQuery.length > 0 ? "No stocks found" : "Start typing to search"}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Tournament Portfolio */}
                          <Card className="border-0 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Building className="w-5 h-5 mr-2" />
                                Tournament Portfolio
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {currentPurchases.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2 font-medium text-muted-foreground">Stock</th>
                                        <th className="text-right p-2 font-medium text-muted-foreground">Shares</th>
                                        <th className="text-right p-2 font-medium text-muted-foreground">Purchase Price</th>
                                        <th className="text-right p-2 font-medium text-muted-foreground">Current Price</th>
                                        <th className="text-right p-2 font-medium text-muted-foreground">Change</th>
                                        <th className="text-right p-2 font-medium text-muted-foreground">Total Value</th>
                                        <th className="text-center p-2 font-medium text-muted-foreground">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentPurchases.map((purchase: any, index: number) => {
                                        const purchasePrice = Number(purchase.purchasePrice);
                                        const currentPrice = stockPrices[purchase.symbol] || purchasePrice;
                                        const change = currentPrice - purchasePrice;
                                        const percentChange = ((change / purchasePrice) * 100);
                                        const totalValue = currentPrice * purchase.shares;
                                        
                                        return (
                                          <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="p-2">
                                              <div>
                                                <p className="font-medium text-foreground">{purchase.symbol}</p>
                                                <p className="text-sm text-muted-foreground">{purchase.companyName}</p>
                                              </div>
                                            </td>
                                            <td className="p-2 text-right font-medium">{purchase.shares}</td>
                                            <td className="p-2 text-right">${purchasePrice.toFixed(2)}</td>
                                            <td className="p-2 text-right">${currentPrice.toFixed(2)}</td>
                                            <td className="p-2 text-right">
                                              <div className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <div>${change.toFixed(2)}</div>
                                                <div className="text-xs">({percentChange.toFixed(2)}%)</div>
                                              </div>
                                            </td>
                                            <td className="p-2 text-right font-medium">${totalValue.toFixed(2)}</td>
                                            <td className="p-2 text-center">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                onClick={() => {
                                                  setSelectedSellStock({
                                                    ...purchase,
                                                    currentPrice: currentPrice
                                                  });
                                                  setIsSellDialogOpen(true);
                                                }}
                                              >
                                                Sell
                                              </Button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                  <p className="text-muted-foreground mb-2">No stocks in this tournament yet</p>
                                  <p className="text-sm text-muted-foreground">Use the search above to buy stocks for this tournament</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Tournament Leaderboard */}
                          <Card className="border-0 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Trophy className="w-5 h-5 mr-2" />
                                Tournament Leaderboard
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isLoadingParticipants ? (
                                <div className="text-center py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                  <div className="mt-2 text-sm text-muted-foreground">Loading leaderboard...</div>
                                </div>
                              ) : tournamentParticipants?.data?.length > 0 ? (
                                <div className="space-y-4">
                                  {tournamentParticipants.data.map((participant: any, index: number) => (
                                    <div key={participant.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <p className="font-medium">{participant.firstName} {participant.lastName}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Joined {new Date(participant.joinedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-lg">${participant.totalValue?.toFixed(2) || '0.00'}</p>
                                        <div className="text-sm text-muted-foreground">
                                          <p>Cash: ${parseFloat(participant.balance || '0').toFixed(2)}</p>
                                          <p>Stocks: ${participant.stockValue?.toFixed(2) || '0.00'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                  <p className="text-muted-foreground mb-2">No participants yet</p>
                                  <p className="text-sm text-muted-foreground">Invite others to join this tournament!</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Your Tournaments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">No tournaments yet</p>
                        <p className="text-sm text-muted-foreground">Create your first tournament to start competing!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="watchlist" className="space-y-6">
                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks to add..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                    {showSearchResults && (
                      <div className="absolute top-12 left-0 right-0 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {isLoadingStocks ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <div className="mt-2 text-sm text-muted-foreground">Searching stocks...</div>
                          </div>
                        ) : stockData.length > 0 ? (
                          stockData.map((stock: any, index) => (
                            <div key={index} className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">{stock.symbol}</p>
                                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                                  <p className="text-xs text-muted-foreground">{stock.sector || "N/A"}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-foreground">${stock.currentPrice ? stock.currentPrice.toFixed(2) : 'N/A'}</p>
                                  <p className={`text-xs ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%
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
                          <div className="p-4 text-center text-muted-foreground">
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
                      {sectors.map((sector, index) => (
                        <option key={`sector-${index}`} value={sector}>
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
                      <option value="5D">5 Days</option>
                      <option value="1M">1 Month</option>
                      <option value="6M">6 Months</option>
                      <option value="YTD">Year to Date</option>
                      <option value="1Y">1 Year</option>
                      <option value="5Y">5 Years</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {(changePeriod === '1D' || changePeriod === '5D') ? 
                          '1min' : 
                          '5min'} refresh
                      </span>
                    </div>
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
                            <th className="text-left py-2 px-4 font-medium">Close Price ({changePeriod} ago)</th>
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
                            <tr key={stock.id} className="border-b hover:bg-muted">
                              <td className="py-3 px-4 font-medium text-foreground">{stock.symbol}</td>
                              <td className="py-3 px-4 text-sm text-foreground">{stock.companyName}</td>
                              <td className="py-3 px-4 font-medium text-foreground">
                                ${stock.currentPrice ? stock.currentPrice.toFixed(2) : (stock.price ? stock.price.toFixed(2) : 'N/A')}
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {stock.previousClose ? `$${stock.previousClose.toFixed(2)}` : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  {stock.changePercent !== undefined && stock.change !== undefined ? (
                                    <>
                                      {stock.changePercent >= 0 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                      )}
                                      <span className={`text-sm font-medium ${
                                        stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                                      }`}>
                                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                      </span>
                                      <span className={`text-xs ${
                                        stock.change >= 0 ? "text-green-500" : "text-red-500"
                                      }`}>
                                        (${stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      N/A
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground">{stock.volume ? stock.volume.toLocaleString() : 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-foreground">{formatMarketCap(stock.marketCap)}</td>
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


            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      {/* Buy Stock Dialog */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Stock</DialogTitle>
            <DialogDescription>
              {selectedTradingStock && (
                <div className="space-y-2">
                  <p><strong>{selectedTradingStock.symbol}</strong> - {selectedTradingStock.name}</p>
                  <p>Current price: <strong>${selectedTradingStock.price}</strong></p>
                  <p>Your balance: <strong>${currentBalance.toFixed(2)}</strong></p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shares">Number of shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                step="1"
                value={shareAmount}
                onChange={(e) => setShareAmount(e.target.value)}
                placeholder="Enter number of shares"
              />
            </div>
            {selectedTradingStock && shareAmount && parseInt(shareAmount) > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total cost: <strong>${(parseInt(shareAmount) * selectedTradingStock.price).toFixed(2)}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Remaining balance: <strong>${(currentBalance - (parseInt(shareAmount) * selectedTradingStock.price)).toFixed(2)}</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePurchaseSubmit}
                disabled={!shareAmount || parseInt(shareAmount) <= 0 || purchaseStockMutation.isPending}
                className="bg-black text-white hover:bg-gray-800"
              >
                {purchaseStockMutation.isPending ? "Processing..." : "Buy Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Stock Dialog */}
      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sell Stock</DialogTitle>
            <DialogDescription>
              {selectedSellStock && (
                <div className="space-y-2">
                  <p><strong>{selectedSellStock.symbol}</strong> - {selectedSellStock.companyName}</p>
                  <p>Current price: <strong>${selectedSellStock.currentPrice?.toFixed(2)}</strong></p>
                  <p>You own: <strong>{selectedSellStock.shares} shares</strong></p>
                  <p>Your balance: <strong>${currentBalance.toFixed(2)}</strong></p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sellShares">Number of shares to sell</Label>
              <Input
                id="sellShares"
                type="number"
                min="1"
                max={selectedSellStock?.shares || 1}
                step="1"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="Enter number of shares"
              />
            </div>
            {selectedSellStock && sellAmount && parseInt(sellAmount) > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Sale value: <strong>${(parseInt(sellAmount) * selectedSellStock.currentPrice).toFixed(2)}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  New balance: <strong>${(currentBalance + (parseInt(sellAmount) * selectedSellStock.currentPrice)).toFixed(2)}</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedSellStock && sellAmount) {
                    sellStockMutation.mutate({
                      purchaseId: selectedSellStock.id,
                      sharesToSell: parseInt(sellAmount),
                      currentPrice: selectedSellStock.currentPrice
                    });
                  }
                }}
                disabled={!sellAmount || parseInt(sellAmount) <= 0 || parseInt(sellAmount) > selectedSellStock?.shares || sellStockMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {sellStockMutation.isPending ? "Processing..." : "Sell Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
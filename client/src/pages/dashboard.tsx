import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trophy,
  Lock,
  Globe,
  Building2,
  Coins,
  Briefcase,
  Factory,
  Cpu,
  Car,
  Home,
  ShoppingCart,
  Heart,
  Lightbulb,
  Landmark,
  Zap,
  Package,
  Users,
  ChevronUp,
  ChevronDown,
  FileText
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
import { RegionalChat } from "@/components/ui/regional-chat";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Duration Wheel Component
const DurationWheel = ({ value, onChange }: { value: { value: number, unit: string }, onChange: (value: { value: number, unit: string }) => void }) => {
  const units = [
    { key: "minutes", label: "Minutes", min: 10, max: 60 },
    { key: "hours", label: "Hours", min: 1, max: 24 },
    { key: "days", label: "Days", min: 1, max: 30 },
    { key: "weeks", label: "Weeks", min: 1, max: 8 }
  ];

  const currentUnit = units.find(u => u.key === value.unit) || units[3];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative w-48 h-48 border-4 border-primary rounded-full bg-gradient-to-br from-primary/10 to-primary/20">
          {/* Clock face */}
          <div className="absolute inset-4 border-2 border-primary/30 rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{value.value}</div>
              <div className="text-sm text-muted-foreground capitalize">{value.unit}</div>
            </div>
          </div>
          
          {/* Clock ticks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-6 bg-primary/60"
              style={{
                top: '4px',
                left: '50%',
                transformOrigin: '50% 92px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`
              }}
            />
          ))}
          
          {/* Clock hands */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-primary origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${(value.value / currentUnit.max) * 360}deg)`
            }}
          />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Time Unit</Label>
          <Select 
            value={value.unit} 
            onValueChange={(unit) => {
              const newUnit = units.find(u => u.key === unit);
              if (newUnit) {
                const clampedValue = Math.min(Math.max(value.value, newUnit.min), newUnit.max);
                onChange({ value: clampedValue, unit });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.key} value={unit.key}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Duration: {value.value} {value.unit}</Label>
          <Slider
            value={[value.value]}
            onValueChange={([newValue]) => onChange({ ...value, value: newValue })}
            min={currentUnit.min}
            max={currentUnit.max}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{currentUnit.min}</span>
            <span>{currentUnit.max}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trading Restriction Options
const tradingRestrictions = [
  { value: "none", label: "No Restrictions", icon: Globe, description: "Trade any stocks" },
  { value: "blue_chip", label: "Blue Chip Only", icon: Building2, description: "Large, established companies (S&P 500)" },
  { value: "tech", label: "Technology Sector", icon: Cpu, description: "Tech companies only" },
  { value: "finance", label: "Financial Sector", icon: Landmark, description: "Banks, insurance, financial services" },
  { value: "healthcare", label: "Healthcare Sector", icon: Heart, description: "Pharmaceutical, biotech, medical" },
  { value: "energy", label: "Energy Sector", icon: Zap, description: "Oil, gas, renewable energy" },
  { value: "consumer", label: "Consumer Goods", icon: ShoppingCart, description: "Retail, consumer products" },
  { value: "industrial", label: "Industrial Sector", icon: Factory, description: "Manufacturing, machinery, aerospace" },
  { value: "automotive", label: "Automotive Sector", icon: Car, description: "Car manufacturers, auto parts" },
  { value: "real_estate", label: "Real Estate", icon: Home, description: "REITs, property companies" },
  { value: "crypto_related", label: "Crypto-Related", icon: Coins, description: "Cryptocurrency and blockchain stocks" },
  { value: "small_cap", label: "Small Cap Only", icon: Briefcase, description: "Companies under $2B market cap" },
  { value: "dividend", label: "Dividend Stocks", icon: Lightbulb, description: "Companies that pay regular dividends" }
];

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

// Tournament Countdown Component
const TournamentCountdown = ({ startedAt, timeframe }: { startedAt: string; timeframe: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = new Date(startedAt).getTime();
      
      // Parse timeframe to get duration in milliseconds
      const timeframeMap: { [key: string]: number } = {
        "1 minute": 1 * 60 * 1000,
        "1 week": 7 * 24 * 60 * 60 * 1000,
        "2 weeks": 14 * 24 * 60 * 60 * 1000,
        "3 weeks": 21 * 24 * 60 * 60 * 1000,
        "4 weeks": 28 * 24 * 60 * 60 * 1000,
        "5 weeks": 35 * 24 * 60 * 60 * 1000,
        "6 weeks": 42 * 24 * 60 * 60 * 1000,
        "7 weeks": 49 * 24 * 60 * 60 * 1000,
        "8 weeks": 56 * 24 * 60 * 60 * 1000,
        "9 weeks": 63 * 24 * 60 * 60 * 1000,
        "10 weeks": 70 * 24 * 60 * 60 * 1000,
        "15 weeks": 105 * 24 * 60 * 60 * 1000,
        "20 weeks": 140 * 24 * 60 * 60 * 1000,
        "25 weeks": 175 * 24 * 60 * 60 * 1000,
        "30 weeks": 210 * 24 * 60 * 60 * 1000,
        "40 weeks": 280 * 24 * 60 * 60 * 1000,
        "1 year": 365 * 24 * 60 * 60 * 1000,
      };
      
      const duration = timeframeMap[timeframe] || timeframeMap["4 weeks"];
      const endTime = startTime + duration;
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft("Tournament Ended");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startedAt, timeframe]);

  return (
    <p className="text-lg font-semibold text-orange-600">
      {timeLeft}
    </p>
  );
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Public Tournaments Browser Component
  const PublicTournamentBrowser = () => {
    const { data: publicTournaments, isLoading } = useQuery({
      queryKey: ['/api/tournaments/public'],
      enabled: currentView === 'tournament-browser'
    }) as { data?: { success: boolean; data: any[] }; isLoading: boolean };

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      );
    }

    if (!publicTournaments?.data?.data || publicTournaments.data.data.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Public Tournaments</h3>
          <p className="mb-4">Be the first to create a public tournament!</p>
          <Button onClick={() => setIsCreateTournamentDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicTournaments.data.data.map((tournament: any) => (
          <Card key={tournament.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{tournament.name}</span>
                <Badge variant="outline" className="ml-2">
                  {tournament.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Code: {tournament.code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{tournament.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Balance:</span>
                  <span>${parseFloat(tournament.startingBalance).toLocaleString()}</span>
                </div>
                {tournament.buyInAmount && parseFloat(tournament.buyInAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy-in:</span>
                    <span className="text-green-600 font-semibold">${parseFloat(tournament.buyInAmount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setJoinGameCode(tournament.code);
                    joinTournamentMutation.mutate(tournament.code);
                  }}
                  disabled={joinTournamentMutation.isPending}
                >
                  <Building className="w-4 h-4 mr-1" />
                  Join
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    console.log("Viewing tournament:", tournament);
                    setSelectedTournament({ tournaments: tournament, balance: tournament.startingBalance || '0' });
                    setCurrentView('tournament-detail');
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Main navigation state
  const [currentView, setCurrentView] = useState<'main' | 'watchlist' | 'tournaments' | 'create' | 'join' | 'tournament-detail' | 'tournament-browser' | 'logs'>('main');
  
  // Watchlist state
  const [searchQuery, setSearchQuery] = useState("");
  const [stockData, setStockData] = useState([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [popularStocks, setPopularStocks] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  
  // Tournament stock search state
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [stockSearchResults, setStockSearchResults] = useState([]);
  const [stockSearchLoading, setStockSearchLoading] = useState(false);
  
  // Missing state variables
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("symbol");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  

  const [filterSector, setFilterSector] = useState("all");
  

  
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
  const [timeframe, setTimeframe] = useState("4 weeks");
  
  // Enhanced tournament creation fields
  const [buyInAmount, setBuyInAmount] = useState("5"); // Real money buy-in amount
  const [tradingRestriction, setTradingRestriction] = useState("none");
  const [isPublicTournament, setIsPublicTournament] = useState(true);
  const [customDuration, setCustomDuration] = useState({ value: 4, unit: "weeks" }); // For duration wheel
  const [createdTournament, setCreatedTournament] = useState<any>(null);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [isJoinTournamentDialogOpen, setIsJoinTournamentDialogOpen] = useState(false);
  const [joinGameCode, setJoinGameCode] = useState("");
  const [stockPrices, setStockPrices] = useState<{[key: string]: number}>({});
  
  // Tournament detail state
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  // Tournament timer effect
  useEffect(() => {
    if (currentView === 'tournament-detail' && selectedTournament?.tournaments) {
      try {
        const parseTimeframe = (timeframe: string) => {
          const regex = /(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks)/i;
          const match = timeframe.match(regex);
          if (!match) return 0;
          
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          
          let multiplier = 1;
          if (unit.includes('minute')) multiplier = 60 * 1000;
          else if (unit.includes('hour')) multiplier = 60 * 60 * 1000;
          else if (unit.includes('day')) multiplier = 24 * 60 * 60 * 1000;
          else if (unit.includes('week')) multiplier = 7 * 24 * 60 * 60 * 1000;
          
          return value * multiplier;
        };

        const calculateTimeRemaining = () => {
          try {
            const tournamentData = selectedTournament.tournaments;
            if (!tournamentData) return "Invalid tournament";
            
            // Use startedAt if available, otherwise use createdAt for active tournaments
            const startDateStr = tournamentData.startedAt || (tournamentData.status === 'active' ? tournamentData.createdAt : null);
            
            if (!startDateStr) return "Not started";
            
            const startTime = new Date(startDateStr).getTime();
            const duration = parseTimeframe(tournamentData.timeframe);
            const endTime = startTime + duration;
            const now = Date.now();
            const remaining = endTime - now;
            
            if (remaining <= 0) return "Tournament ended";
            
            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
            
            if (days > 0) return `${days}d ${hours}h ${minutes}m`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            if (minutes > 0) return `${minutes}m ${seconds}s`;
            return `${seconds}s`;
          } catch (error) {
            console.error('Error calculating time remaining:', error);
            return "Error";
          }
        };

        const updateTimer = () => {
          setTimeRemaining(calculateTimeRemaining());
        };

        updateTimer(); // Initial update
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error setting up tournament timer:', error);
      }
    }
  }, [currentView, selectedTournament]);
  
  // Sell dialog state
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedSellStock, setSelectedSellStock] = useState<any>(null);
  const [sellAmount, setSellAmount] = useState("");
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  
  // Performance period state
  const [changePeriod, setChangePeriod] = useState("1D");

  // Animation variants
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: {
      y: 60,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  // Helper function to determine refresh interval based on subscription tier and timeframe
  const getRefreshInterval = (timeframe: string) => {
    // Free tier gets 10-minute intervals for all timeframes
    if (user?.subscriptionTier === 'free') {
      return 10 * 60 * 1000; // 10 minutes
    }
    
    // Premium/Admin tiers get 30-second intervals for better real-time experience
    return 30 * 1000; // 30 seconds
  };

  // Fetch popular stocks
  const { data: popularStocksData, isLoading: popularStocksLoading } = useQuery({
    queryKey: ["/api/popular"],
    enabled: !!user,
  });

  // Fetch user tournaments
  const { data: tournamentsResponse, isLoading: tournamentsLoading, error: tournamentsError } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const userTournaments = (tournamentsResponse as any)?.data || [];

  // Tournament participants query for detail view
  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/tournaments/${selectedTournament?.tournaments?.id || selectedTournament?.id}/participants`],
    enabled: !!(selectedTournament?.tournaments?.id || selectedTournament?.id),
  });

  // Fetch user's watchlist
  const { data: watchlist = [], isLoading: watchlistLoading, refetch: refetchWatchlist } = useQuery<WatchlistItem[]>({
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
    refetchInterval: getRefreshInterval("1D"),
  });

  // Tournament-specific trading queries with unique keys
  const tournamentId = selectedTournament?.tournaments?.id;
  const { data: tournamentBalance, refetch: refetchBalance, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['tournament-balance', tournamentId, user?.id],
    queryFn: async () => {
      if (!tournamentId) {
        console.log("No tournament ID for balance query");
        return null;
      }

      console.log(`Fetching balance for tournament ${tournamentId}`);
      const response = await fetch(`/api/tournaments/${tournamentId}/balance`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`Balance API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Balance API error: ${response.status} - ${errorText}`);
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      console.log("Balance API response data:", data);
      return data;
    },
    enabled: !!user && !!tournamentId,
    refetchOnWindowFocus: false,
    staleTime: 0
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
    staleTime: 0
  });

  // Tournament participants query with real-time updates
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
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 0 // Always consider data stale to ensure fresh updates
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
    refetchInterval: user?.subscriptionTier === 'free' ? 10 * 60 * 1000 : 30000, // Free: 10 minutes, Premium/Admin: 30 seconds
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

  // Tournament stock search functionality
  useEffect(() => {
    const handleTournamentStockSearch = async () => {
      if (stockSearchTerm.trim() === "") {
        setStockSearchResults([]);
        setStockSearchLoading(false);
        return;
      }

      if (stockSearchTerm.length < 2) return;

      setStockSearchLoading(true);
      try {
        const response = await fetch(`/api/search/${encodeURIComponent(stockSearchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStockSearchResults(data.data);
          }
        }
      } catch (error) {
        console.error("Error searching stocks for tournament:", error);
      } finally {
        setStockSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleTournamentStockSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [stockSearchTerm]);

  // Tournament stock purchase handler
  const handleTournamentStockPurchase = async (stock: any) => {
    if (!selectedTournament?.tournaments?.id) {
      toast({
        title: "Error",
        description: "No tournament selected",
        variant: "destructive",
      });
      return;
    }

    // Get current stock price
    try {
      const response = await fetch(`/api/quote/${stock.symbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock price');
      
      const priceData = await response.json();
      if (!priceData.success) throw new Error('Failed to get stock price');

      const currentPrice = priceData.data.price;
      const maxShares = Math.floor(currentBalance / currentPrice);

      if (maxShares === 0) {
        toast({
          title: "Insufficient Funds",
          description: `You need at least ${formatCurrency(currentPrice)} to buy one share of ${stock.symbol}`,
          variant: "destructive",
        });
        return;
      }

      // For now, buy 1 share (could be expanded to show a dialog for quantity)
      const sharesToBuy = 1;
      const totalCost = sharesToBuy * currentPrice;

      if (totalCost > currentBalance) {
        toast({
          title: "Insufficient Funds",
          description: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(currentBalance)}`,
          variant: "destructive",
        });
        return;
      }

      // Make the purchase
      const purchaseResponse = await apiRequest("POST", `/api/tournaments/${selectedTournament.tournaments.id}/purchase`, {
        symbol: stock.symbol,
        companyName: stock.companyName || stock.name,
        shares: sharesToBuy,
        purchasePrice: currentPrice
      });

      const purchaseResult = await purchaseResponse.json();

      if (purchaseResult.success) {
        toast({
          title: "Purchase Successful",
          description: `Bought ${sharesToBuy} share${sharesToBuy > 1 ? 's' : ''} of ${stock.symbol} for ${formatCurrency(totalCost)}`,
        });

        // Refresh tournament data
        refetchBalance();
        refetchPurchases();
        
        // Clear search
        setStockSearchTerm("");
        setStockSearchResults([]);
      } else {
        toast({
          title: "Purchase Failed",
          description: purchaseResult.message || "Failed to purchase stock",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to purchase stock",
        variant: "destructive",
      });
    }
  };

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournament: InsertTournament) => {
      const res = await apiRequest("POST", "/api/tournaments", tournament);
      return res.json();
    },
    onSuccess: (response) => {
      // Check if this is a premium restriction response
      if (response.message && !response.data) {
        toast({
          title: "Premium Required",
          description: response.message,
          variant: "destructive",
        });
        setIsCreateTournamentDialogOpen(false);
        setTournamentName("");
        setMaxPlayers("10");
        setStartingBalance("10000");
        setTimeframe("4 weeks");
        return;
      }
      
      const tournament = response.data;
      setIsCreateTournamentDialogOpen(false);
      setTournamentName("");
      setMaxPlayers("10");
      setStartingBalance("10000");
      setTimeframe("4 weeks");
      setBuyInAmount("0");
      setTradingRestriction("none");
      setIsPublicTournament(true);
      setCustomDuration({ value: 4, unit: "weeks" });
      setBuyInAmount("0");
      setTradingRestriction("none");
      setIsPublicTournament(true);
      setCustomDuration({ value: 4, unit: "weeks" });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      // Invalidate balance query for the newly created tournament
      queryClient.invalidateQueries({ queryKey: ['tournament-balance', tournament.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tournament-purchases', tournament.id, user?.id] });
      // Invalidate participants cache for the new tournament
      queryClient.invalidateQueries({ queryKey: ['tournament-participants', tournament.id] });
      
      // Show success notification
      toast({
        title: "Tournament created!",
        description: `${tournament.name} - Code: ${tournament.code}`,
        className: "fixed bottom-4 right-4 w-96 bg-green-50 border-green-200 text-green-800"
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

  // Fetch tournament response - already declared above, removing duplicate

  // Extract tournaments from response - using already declared variable
  
  // Participants query already declared above

  // Fetch tournament purchases when tournament is selected
  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: [`/api/tournaments/${selectedTournamentId}/purchases`],
    enabled: !!selectedTournamentId,
  });


  // Auto-select first tournament if none selected
  useEffect(() => {
    try {
      if (userTournaments.length > 0 && !selectedTournamentId) {
        const firstTournament = userTournaments[0];
        if (firstTournament?.tournaments?.id) {
          setSelectedTournamentId(firstTournament.tournaments.id.toString());
          setSelectedTournament(firstTournament);
        }
      }
    } catch (error) {
      console.error('Error auto-selecting tournament:', error);
    }
  }, [userTournaments, selectedTournamentId]);

  // Update selectedTournament when selectedTournamentId changes
  useEffect(() => {
    try {
      if (selectedTournamentId && userTournaments.length > 0) {
        const tournament = userTournaments.find((t: any) => 
          t?.tournaments?.id?.toString() === selectedTournamentId
        );
        if (tournament) {
          setSelectedTournament(tournament);
        }
      }
    } catch (error) {
      console.error('Error updating selected tournament:', error);
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
        queryClient.invalidateQueries({ queryKey: ['tournament-participants', tournamentId] });
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
        queryClient.invalidateQueries({ queryKey: ['tournament-participants', tournamentId] });
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
        // Fetch prices for search results
        const stocksWithPrices = await Promise.all(
          data.data.map(async (stock: any) => {
            try {
              const priceResponse = await fetch(`/api/quote/${stock.symbol}`);
              const priceData = await priceResponse.json();
              return {
                ...stock,
                price: priceData.success ? priceData.data.price : 0
              };
            } catch (error) {
              return { ...stock, price: 0 };
            }
          })
        );
        setTradingStockData(stocksWithPrices);
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
    // Stock should already have price from search, but verify
    if (!stock.price || stock.price <= 0) {
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
    } else {
      setSelectedTradingStock(stock);
      setIsBuyDialogOpen(true);
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

    // Check if user has enough tournament balance  
    console.log("Tournament balance data:", JSON.stringify(tournamentBalance, null, 2));
    console.log("Tournament ID:", selectedTournament?.tournaments?.id);
    
    const tournamentBalanceAmount = parseFloat(tournamentBalance?.data?.balance?.toString() || '0');
    console.log("Parsed balance amount:", tournamentBalanceAmount);
    console.log("Total cost needed:", totalCost);
    
    if (totalCost > tournamentBalanceAmount) {
      toast({
        title: "Insufficient tournament funds",
        description: `You need $${totalCost.toFixed(2)} but only have $${tournamentBalanceAmount.toFixed(2)} in this tournament`,
        variant: "destructive",
      });
      return;
    }

    // Check if we're in tournament mode and have a tournament selected
    if (currentView === 'tournament-detail' && selectedTournament?.tournaments?.id) {
      // Use tournament purchase API
      purchaseStockMutation.mutate({
        symbol: selectedTradingStock.symbol,
        companyName: selectedTradingStock.name || selectedTradingStock.symbol,
        shares: shares,
        purchasePrice: selectedTradingStock.price.toString(),
        totalCost: totalCost.toString(),
      });
    } else {
      toast({
        title: "Error",
        description: "No tournament selected for trading. Please select a tournament first.",
        variant: "destructive",
      });
    }
  };

  // Authentication handled by router

  // Popular stocks query already declared above

  // Use popular stocks data
  useEffect(() => {
    if (popularStocksData?.success && popularStocksData.data) {
      setPopularStocks(popularStocksData.data);
      setIsLoadingPopular(false);
    }
  }, [popularStocksData]);

  // Fetch timeframe-specific performance data for watchlist
  const { data: performanceData = {}, isLoading: isLoadingPerformance } = useQuery({
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
    const currentPrice = popularData?.price || individualData?.price || (stock as any).price || 0;
    const volume = popularData?.volume || individualData?.volume || (stock as any).volume || 0;
    const marketCap = popularData?.marketCap || individualData?.marketCap || (stock as any).marketCap || 0;
    const sector = popularData?.sector || individualData?.sector || (stock as any).sector || "N/A";
    
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
    let isLoadingData = false;
    
    if (changePeriod === '1D') {
      // 1D: Calculate change immediately from current price vs previous close
      finalChange = currentPrice - historicalClose;
      finalChangePercent = historicalClose > 0 ? ((finalChange / historicalClose) * 100) : 0;
    } else {
      // Long-term: Use Yahoo Finance timeframe-specific data
      if (isLoadingPerformance) {
        // Show loading state for non-1D timeframes
        isLoadingData = true;
      } else if (timeframeSpecificData) {
        finalChange = timeframeSpecificData.change;
        finalChangePercent = timeframeSpecificData.percentChange;
      } else {
        // Fallback to current data if timeframe data not available
        finalChange = (popularData as any)?.change || (individualData as any)?.change || 0;
        finalChangePercent = (popularData as any)?.percentChange || (individualData as any)?.percentChange || 0;
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
      currency: (popularData as any)?.currency || (individualData as any)?.currency || (stock as any).currency || "USD",
      lastUpdated: Date.now(),
      isLoadingData
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

  // Limit watchlist display to 3 items by default, but show all when on watchlist page
  const displayedWatchlist = currentView === 'watchlist' ? filteredWatchlist : (isWatchlistExpanded ? filteredWatchlist : filteredWatchlist.slice(0, 3));

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

  // Main Dashboard View with Watchlist Preview
  if (currentView === 'main') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome back, {user?.displayName || user?.username || user?.email || "User"}
              </h1>
              <p className="text-xl text-muted-foreground">
                Ready to track and trade? Here's your dashboard.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary" onClick={() => setCurrentView('watchlist')}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">View Watchlist</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Monitor your tracked stocks with real-time prices and performance data
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary" onClick={() => setCurrentView('tournaments')}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">My Tournaments</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      View and manage your active trading competitions
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary" onClick={() => setCurrentView('tournament-browser')}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Join & Create</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Browse open tournaments or create your own competition
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary" onClick={() => setCurrentView('logs')}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Transaction Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      View your tournament activity and transaction history
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Watchlist View
  if (currentView === 'watchlist') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-none">
          <motion.div
            className="max-w-none mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Header with Back Button */}
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={() => setCurrentView('main')}>
                    ← Back to Dashboard
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Your Watchlist</h1>
                    <p className="text-muted-foreground">Monitor your tracked stocks</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Watchlist Controls */}
            <motion.div className="mb-6" variants={fadeInUp}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Tracked Stocks</h2>
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
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Timeframe Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Timeframe:</span>
                    <Select value={changePeriod} onValueChange={setChangePeriod}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1D">1 Day</SelectItem>
                        <SelectItem value="5D">5 Days</SelectItem>
                        <SelectItem value="1M">1 Month</SelectItem>
                        <SelectItem value="3M">3 Months</SelectItem>
                        <SelectItem value="6M">6 Months</SelectItem>
                        <SelectItem value="YTD">YTD</SelectItem>
                        <SelectItem value="1Y">1 Year</SelectItem>
                        <SelectItem value="2Y">2 Years</SelectItem>
                        <SelectItem value="5Y">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sector Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Sector:</span>
                    <Select value={filterSector} onValueChange={setFilterSector}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financials">Financials</SelectItem>
                        <SelectItem value="Consumer Discretionary">Consumer Discretionary</SelectItem>
                        <SelectItem value="Consumer Staples">Consumer Staples</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Industrials">Industrials</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Sort Controls */}
                  <span className="text-sm font-medium text-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="symbol">Symbol</SelectItem>
                      <SelectItem value="companyName">Company</SelectItem>
                      <SelectItem value="currentPrice">Price</SelectItem>
                      <SelectItem value="changePercent">Change %</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="marketCap">Market Cap</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Watchlist Table - Using existing code */}
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
                        <th className="text-left py-2 px-4 font-medium">Price ({changePeriod})</th>
                        <th className="text-left py-2 px-4 font-medium">Change</th>
                        <th className="text-left py-2 px-4 font-medium">Volume</th>
                        <th className="text-left py-2 px-4 font-medium">Market Cap</th>
                        <th className="text-left py-2 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedWatchlist.map((stock) => (
                        <tr key={stock.id} className="border-b hover:bg-muted">
                          <td className="py-3 px-4 font-medium text-foreground">{stock.symbol}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{stock.companyName}</td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {formatCurrency(stock.currentPrice || stock.price || 0)}
                          </td>
                          <td className="py-3 px-4 font-medium text-muted-foreground">
                            {stock.previousClose ? formatCurrency(stock.previousClose) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1">
                              {stock.isLoadingData ? (
                                <span className="text-sm text-muted-foreground">Loading...</span>
                              ) : stock.changePercent !== undefined && stock.change !== undefined ? (
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
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{stock.volume ? stock.volume.toLocaleString() : 'N/A'}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{formatMarketCap(stock.marketCap)}</td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromWatchlist(stock.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Tournaments View
  if (currentView === 'tournaments') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentView('main')}>
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Current Tournaments</h1>
                  <p className="text-muted-foreground">View and manage your active competitions</p>
                </div>
              </div>
            </motion.div>

            {/* Tournament Cards */}
            <motion.div variants={fadeInUp}>
              {tournamentsError ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Unable to Load Tournaments</h3>
                    <p className="text-muted-foreground mb-4">
                      {tournamentsError.message || "Please try refreshing the page or check your connection."}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </CardContent>
                </Card>
              ) : tournamentsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userTournaments && userTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTournaments.map((tournament: any) => {
                    const tournamentData = tournament;
                    const balance = parseFloat(tournament.userBalance || '0');
                    
                    return (
                      <Card 
                        key={tournamentData.id} 
                        className="interactive-card hover-lift cursor-pointer border-2 hover:border-neon group animate-fade-in particle-effect"
                        onClick={() => {
                          console.log("Clicking My Tournament:", tournament);
                          console.log("tournamentData:", tournamentData);
                          setSelectedTournament(tournament);
                          setSelectedTournamentId(tournamentData.id.toString());
                          setCurrentView('tournament-detail');
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center group-hover:neon-glow transition-all duration-300 animate-pulse-slow">
                                <Trophy className="w-6 h-6 text-primary-foreground" />
                              </div>
                              <div>
                                <CardTitle className="text-lg line-clamp-1">{tournamentData.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">Code: {tournamentData.code}</p>
                              </div>
                            </div>
                            <Badge className={`${
                              tournamentData.status === 'active' 
                                ? 'status-active neon-glow' 
                                : tournamentData.status === 'waiting' 
                                  ? 'btn-secondary' 
                                  : 'btn-secondary'
                            } font-semibold`}>
                              {tournamentData.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Your Balance</span>
                              <span className="font-semibold gradient-text-profit animate-glow">${balance.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Players</span>
                              <span className="text-sm">{tournamentData.currentPlayers}/{tournamentData.maxPlayers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Duration</span>
                              <span className="text-sm">{tournamentData.timeframe}</span>
                            </div>
                            {tournamentData.buyInAmount && parseFloat(tournamentData.buyInAmount) > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Buy-in</span>
                                <Badge variant="outline" className="text-xs">
                                  ${parseFloat(tournamentData.buyInAmount).toLocaleString()}
                                </Badge>
                              </div>
                            )}
                            {tournamentData.tradingRestriction && tournamentData.tradingRestriction !== 'none' && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Trading</span>
                                <Badge variant="secondary" className="text-xs">
                                  {tradingRestrictions.find(r => r.value === tournamentData.tradingRestriction)?.label || tournamentData.tradingRestriction}
                                </Badge>
                              </div>
                            )}
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Created {new Date(tournamentData.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center space-x-1">
                                  {tournamentData.isPublic ? (
                                    <>
                                      <Globe className="w-3 h-3" />
                                      <span>Public</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      <span>Private</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Active Tournaments</h3>
                    <p className="text-muted-foreground mb-4">
                      You're not currently participating in any tournaments.
                    </p>
                    <div className="space-x-3">
                      <Button onClick={() => setCurrentView('create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tournament
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentView('join')}>
                        Join Tournament
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Action Buttons */}
            {userTournaments && userTournaments.length > 0 && (
              <motion.div variants={fadeInUp} className="mt-8 flex justify-center space-x-4">
                <Button onClick={() => setCurrentView('create')} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Tournament
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('join')} size="lg">
                  Join Tournament
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Join Tournament View
  if (currentView === 'join') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" onClick={() => setCurrentView('main')}>
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Join Tournament</h1>
                  <p className="text-muted-foreground">Enter a tournament code to join</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="join-code">Enter Tournament Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter tournament code"
                  />
                  <Button className="w-full">Join Tournament</Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Create Tournament View  
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center space-x-4 mb-6">
                <Button variant="outline" onClick={() => setCurrentView('main')}>
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Create Tournament</h1>
                  <p className="text-muted-foreground">Start a new trading competition</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Basic Tournament Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tournament-name">Tournament Name</Label>
                    <Input
                      id="tournament-name"
                      value={tournamentName}
                      onChange={(e) => setTournamentName(e.target.value)}
                      placeholder="Enter tournament name"
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-players">Max Players</Label>
                      <Input
                        id="max-players"
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        min="2"
                        max="100"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="starting-balance">Starting Fake Money</Label>
                      <Input
                        id="starting-balance"
                        type="number"
                        value={startingBalance}
                        onChange={(e) => setStartingBalance(e.target.value)}
                        min="1000"
                        max="1000000"
                        placeholder="10000"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creator Benefits & Jackpot System */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <Trophy className="w-5 h-5" />
                    <span>Creator Benefits & Jackpot System</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    As a tournament creator, you earn 5% of the total jackpot! The more players that join, the bigger your reward.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-400">Creator Reward Calculation</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>• Total Jackpot = Buy-in Amount × Number of Players</p>
                      <p>• Your Creator Reward = 5% of Total Jackpot</p>
                      <p>• Winner Prize Pool = 95% of Total Jackpot</p>
                    </div>
                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Example: $10 buy-in × 20 players = $200 total jackpot</p>
                      <p className="text-xs font-semibold text-green-600">Your reward: $10 (5%) | Winner gets: $190 (95%)</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="buy-in-amount">Required Buy-in Amount (Minimum $5)</Label>
                    <Input
                      id="buy-in-amount"
                      type="number"
                      value={buyInAmount}
                      onChange={(e) => setBuyInAmount(e.target.value)}
                      min="5"
                      placeholder="Enter amount (minimum $5)"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Each player must pay this amount to join. You earn 5% of the total collected amount.
                    </p>
                    {buyInAmount && parseFloat(buyInAmount) >= 5 && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm space-y-1">
                          <p className="font-semibold text-blue-700 dark:text-blue-400">Potential Earnings Preview:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>10 players: <span className="font-semibold text-green-600">${(parseFloat(buyInAmount) * 10 * 0.05).toFixed(2)}</span></div>
                            <div>20 players: <span className="font-semibold text-green-600">${(parseFloat(buyInAmount) * 20 * 0.05).toFixed(2)}</span></div>
                            <div>50 players: <span className="font-semibold text-green-600">${(parseFloat(buyInAmount) * 50 * 0.05).toFixed(2)}</span></div>
                            <div>100 players: <span className="font-semibold text-green-600">${(parseFloat(buyInAmount) * 100 * 0.05).toFixed(2)}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>



              {/* Duration Wheel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Tournament Duration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DurationWheel 
                    value={customDuration} 
                    onChange={setCustomDuration}
                  />
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {isPublicTournament ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tournament Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        {isPublicTournament ? "Anyone can discover and join this tournament" : "Only people with the join code can participate"}
                      </p>
                    </div>
                    <Switch
                      checked={isPublicTournament}
                      onCheckedChange={setIsPublicTournament}
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    {isPublicTournament ? (
                      <>
                        <Globe className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Public Tournament</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Private Tournament</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Create Button */}
              <Button 
                className="w-full h-12 text-lg font-semibold" 
                onClick={() => {
                  // Convert duration to the format expected by the backend
                  const durationString = `${customDuration.value} ${customDuration.unit}`;
                  
                  createTournamentMutation.mutate({
                    name: tournamentName,
                    maxPlayers: parseInt(maxPlayers as string),
                    startingBalance: parseFloat(startingBalance as string),
                    timeframe: durationString,
                    buyInAmount: parseFloat(buyInAmount),
                    tradingRestriction: tradingRestriction,
                    isPublic: isPublicTournament
                  });
                }}
                disabled={!tournamentName || !maxPlayers || !startingBalance || parseFloat(buyInAmount) < 5 || createTournamentMutation.isPending}
              >
                {createTournamentMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Tournament...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Create Tournament</span>
                    <span>(${buyInAmount} Buy-in • Earn 5%)</span>
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }





  // Tournament Detail View
  if (currentView === 'tournament-detail' && selectedTournament) {
    console.log("Tournament Detail View - selectedTournament:", selectedTournament);
    // Handle both tournament data structures
    const tournamentData = selectedTournament.tournaments || selectedTournament;
    const balance = parseFloat(selectedTournament.balance || selectedTournament.userBalance || '0');
    console.log("Tournament Detail View - tournamentData:", tournamentData, "balance:", balance);
    





    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentView('tournaments')}>
                  ← Back to Tournaments
                </Button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{tournamentData?.name || "Tournament"}</h1>
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <span>Code: {tournamentData?.code || "N/A"}</span>
                        <Badge variant={tournamentData?.status === 'active' ? 'default' : tournamentData?.status === 'waiting' ? 'secondary' : 'outline'}>
                          {tournamentData?.status || "unknown"}
                        </Badge>
                        <span>Time Remaining: <span className="text-red-500 font-semibold">{timeRemaining || "Loading..."}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${balance.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Your Balance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Portfolio & Trading */}
              <div className="lg:col-span-2 space-y-6">
                {/* Portfolio Graph */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <LineChart className="w-5 h-5" />
                        <span>Portfolio Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                          <p>Portfolio graph will be implemented with actual trading data</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Holdings */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>Current Holdings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {purchasesLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex space-x-4">
                              <div className="h-4 bg-muted rounded w-1/4"></div>
                              <div className="h-4 bg-muted rounded w-1/4"></div>
                              <div className="h-4 bg-muted rounded w-1/4"></div>
                              <div className="h-4 bg-muted rounded w-1/4"></div>
                            </div>
                          ))}
                        </div>
                      ) : purchases?.data && (purchases as any)?.data?.length > 0 ? (
                        <div className="space-y-3">
                          {(purchases as any).data.map((purchase: any) => (
                            <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                              <div>
                                <div className="font-semibold">{purchase.symbol}</div>
                                <div className="text-sm text-muted-foreground">{purchase.companyName}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{purchase.shares} shares</div>
                                <div className="text-sm text-muted-foreground">${purchase.purchasePrice.toFixed(2)}/share</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-2" />
                          <p>No holdings yet. Start trading to build your portfolio!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stock Search and Trading */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Search & Trade Stocks</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Stock Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search stocks to trade..."
                          value={tradingSearchQuery}
                          onChange={(e) => handleTradingSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Search Results */}
                      {showTradingSearchResults && (
                        <div className="max-h-64 overflow-y-auto border rounded-lg">
                          {isLoadingTradingStocks ? (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                            </div>
                          ) : tradingStockData.length > 0 ? (
                            <div className="divide-y">
                              {tradingStockData.slice(0, 8).map((stock) => (
                                <div 
                                  key={stock.symbol} 
                                  className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between"
                                  onClick={() => handleBuyStock(stock)}
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-sm">{stock.symbol}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {stock.name}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-sm">
                                      {formatCurrency(stock.price || 0)}
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-1">
                                      <Plus className="w-3 h-3 mr-1" />
                                      Buy
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : tradingSearchQuery.length >= 2 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <Package className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">No stocks found for "{tradingSearchQuery}"</p>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Popular Stocks Quick Trade */}
                      {!tradingSearchQuery && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Popular Stocks</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {popularStocksData?.data?.slice(0, 4).map((stock) => (
                              <div
                                key={stock.symbol}
                                className="p-2 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleBuyStock(stock)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-xs">{stock.symbol}</div>
                                    <div className="text-xs text-green-600">
                                      {formatCurrency(stock.price || 0)}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="p-1">
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Tournament Info & Leaderboard */}
              <div className="space-y-6">
                {/* Tournament Info */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Tournament Info</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players</span>
                        <span>{tournamentData.currentPlayers}/{tournamentData.maxPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{tournamentData.timeframe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Starting Balance</span>
                        <span>${parseFloat(tournamentData.startingBalance).toLocaleString()}</span>
                      </div>
                      {tournamentData.buyInAmount && parseFloat(tournamentData.buyInAmount) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Buy-in</span>
                          <Badge variant="outline">${parseFloat(tournamentData.buyInAmount).toLocaleString()}</Badge>
                        </div>
                      )}
                      {tournamentData.tradingRestriction && tournamentData.tradingRestriction !== 'none' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trading</span>
                          <Badge variant="secondary" className="text-xs">
                            {tradingRestrictions.find(r => r.value === tournamentData.tradingRestriction)?.label || tournamentData.tradingRestriction}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Privacy</span>
                        <div className="flex items-center space-x-1">
                          {tournamentData.isPublic ? (
                            <>
                              <Globe className="w-3 h-3" />
                              <span className="text-sm">Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span className="text-sm">Private</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Participants/Leaderboard */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Leaderboard</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {participantsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-3">
                              <div className="w-8 h-8 bg-muted rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : participants?.data && Array.isArray(participants.data) && participants.data.length > 0 ? (
                        <div className="space-y-3">
                          {participants.data
                            .sort((a: any, b: any) => parseFloat(b.balance) - parseFloat(a.balance))
                            .map((participant: any, index: any) => (
                              <div key={participant.userId} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  index === 0 ? 'bg-yellow-500 text-white' : 
                                  index === 1 ? 'bg-gray-400 text-white' :
                                  index === 2 ? 'bg-amber-600 text-white' : 
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold">{participant.displayName || participant.firstName || participant.username || `User ${participant.userId}`}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ${parseFloat(participant.balance).toLocaleString()}
                                  </div>
                                </div>
                                {participant.userId === user?.userId && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2" />
                          <p>No participants yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Refresh tournament data
                          queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
                          queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentData.id}/participants`] });
                          queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentData.id}/purchases`] });
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Stock Dialog */}
        <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buy Stock</DialogTitle>
              <DialogDescription>
                Purchase shares of {selectedTradingStock?.symbol} - {selectedTradingStock?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock Symbol</Label>
                  <div className="font-semibold text-lg">{selectedTradingStock?.symbol}</div>
                </div>
                <div>
                  <Label>Current Price</Label>
                  <div className="font-semibold text-lg text-green-600">
                    {formatCurrency(selectedTradingStock?.price || 0)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="share-amount">Number of Shares</Label>
                <Input
                  id="share-amount"
                  type="number"
                  value={shareAmount}
                  onChange={(e) => setShareAmount(e.target.value)}
                  min="1"
                  placeholder="Enter number of shares"
                  className="mt-2"
                />
              </div>

              {shareAmount && selectedTradingStock?.price && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Shares:</span>
                      <span>{shareAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per share:</span>
                      <span>{formatCurrency(selectedTradingStock.price)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total Cost:</span>
                      <span>{formatCurrency((selectedTradingStock.price * parseInt(shareAmount || "0")))}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsBuyDialogOpen(false);
                  setSelectedTradingStock(null);
                  setShareAmount("");
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchaseSubmit}
                  disabled={!shareAmount || parseInt(shareAmount) <= 0 || !selectedTradingStock?.price}
                >
                  Buy Stock
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Tournament Browser View
  if (currentView === 'tournament-browser') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Header */}
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={() => setCurrentView('main')}>
                    ← Back to Dashboard
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Tournament Browser</h1>
                    <p className="text-muted-foreground">Join existing tournaments or create your own</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button onClick={() => setIsJoinTournamentDialogOpen(true)} variant="outline">
                    <Building className="w-4 h-4 mr-2" />
                    Join by Code
                  </Button>
                  <Button onClick={() => setIsCreateTournamentDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tournament Cards Grid */}
            <motion.div variants={fadeInUp}>
              <PublicTournamentBrowser />
            </motion.div>
          </motion.div>
        </div>

        {/* Join Tournament Dialog */}
        <Dialog open={isJoinTournamentDialogOpen} onOpenChange={setIsJoinTournamentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Tournament</DialogTitle>
              <DialogDescription>
                Enter the tournament code to join an existing competition
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="join-code">Tournament Code</Label>
                <Input
                  id="join-code"
                  value={joinGameCode}
                  onChange={(e) => setJoinGameCode(e.target.value)}
                  placeholder="Enter tournament code"
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsJoinTournamentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (joinGameCode.trim()) {
                      joinTournamentMutation.mutate(joinGameCode.trim());
                    }
                  }}
                  disabled={!joinGameCode.trim() || joinTournamentMutation.isPending}
                >
                  {joinTournamentMutation.isPending ? "Joining..." : "Join Tournament"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Tournament Dialog - Full Featured */}
        <Dialog open={isCreateTournamentDialogOpen} onOpenChange={setIsCreateTournamentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Create Tournament</span>
              </DialogTitle>
              <DialogDescription>
                Set up a new trading competition with custom settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Basic Tournament Settings</span>
                </h3>
                <div>
                  <Label htmlFor="tournament-name">Tournament Name</Label>
                  <Input
                    id="tournament-name"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter tournament name"
                    className="mt-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-players">Max Players</Label>
                    <Input
                      id="max-players"
                      type="number"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(e.target.value)}
                      min="2"
                      max="100"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="starting-balance">Starting Fake Money</Label>
                    <Input
                      id="starting-balance"
                      type="number"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(e.target.value)}
                      min="1000"
                      max="1000000"
                      placeholder="10000"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Creator Benefits & Jackpot System */}
              <div className="border border-green-500/20 bg-green-500/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2 text-green-600 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span>Creator Benefits & Jackpot System</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  As a tournament creator, you earn 5% of the total jackpot! The more players that join, the bigger your reward.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">Creator Reward Calculation</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>• Total Jackpot = Buy-in Amount × Number of Players</p>
                    <p>• Your Creator Reward = 5% of Total Jackpot</p>
                    <p>• Winner Prize Pool = 95% of Total Jackpot</p>
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Example: $10 buy-in × 20 players = $200 total jackpot</p>
                    <p className="text-xs font-semibold text-green-600">Your reward: $10 (5%) | Winner gets: $190 (95%)</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="buy-in-amount">Required Buy-in Amount (Minimum $5)</Label>
                  <Input
                    id="buy-in-amount"
                    type="number"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    min="5"
                    placeholder="Enter amount (minimum $5)"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Each player must pay this amount to join. You earn 5% of the total collected amount.
                  </p>
                  {buyInAmount && parseFloat(buyInAmount) >= 5 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-sm space-y-1">
                        <p><strong>With {maxPlayers} max players:</strong></p>
                        <p>• Total Jackpot: ${(parseFloat(buyInAmount) * parseInt(maxPlayers)).toLocaleString()}</p>
                        <p>• Your Creator Reward: ${((parseFloat(buyInAmount) * parseInt(maxPlayers)) * 0.05).toLocaleString()}</p>
                        <p>• Winner Prize Pool: ${((parseFloat(buyInAmount) * parseInt(maxPlayers)) * 0.95).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="timeframe">Tournament Duration</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 minute">1 Minute</SelectItem>
                    <SelectItem value="1 hour">1 Hour</SelectItem>
                    <SelectItem value="1 day">1 Day</SelectItem>
                    <SelectItem value="1 week">1 Week</SelectItem>
                    <SelectItem value="2 weeks">2 Weeks</SelectItem>
                    <SelectItem value="4 weeks">4 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private-tournament"
                  checked={!isPublicTournament}
                  onCheckedChange={(checked) => setIsPublicTournament(!checked)}
                />
                <Label htmlFor="private-tournament" className="text-sm">
                  Make tournament private (only joinable by code)
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateTournamentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (tournamentName.trim()) {
                      createTournamentMutation.mutate({
                        name: tournamentName.trim(),
                        maxPlayers: parseInt(maxPlayers),
                        startingBalance: parseFloat(startingBalance),
                        timeframe,
                        buyInAmount: parseFloat(buyInAmount) || 0,
                        tradingRestriction,
                        isPublic: isPublicTournament
                      });
                    }
                  }}
                  disabled={!tournamentName.trim() || createTournamentMutation.isPending}
                  className="min-w-[140px]"
                >
                  {createTournamentMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>Create Tournament</span>
                      <span>(${buyInAmount} Buy-in • Earn 5%)</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Transaction Logs View
  if (currentView === 'logs') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Header */}
            <motion.div className="mb-8" variants={fadeInUp}>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentView('main')}>
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Transaction Logs</h1>
                  <p className="text-muted-foreground">Your tournament activity and trading history</p>
                </div>
              </div>
            </motion.div>

            {/* Tabs for different log types */}
            <motion.div variants={fadeInUp}>
              <Tabs defaultValue="tournaments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tournaments">Tournament Activity</TabsTrigger>
                  <TabsTrigger value="trading">Stock Trading</TabsTrigger>
                  <TabsTrigger value="financial">Financial History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tournaments" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tournament Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Sample tournament transactions */}
                        {[
                          { type: "join", tournament: "Tech Giants Battle", amount: 25, date: "2025-01-20" },
                          { type: "create", tournament: "My First Tournament", amount: 0, date: "2025-01-18" },
                          { type: "cashout", tournament: "Weekly Challenge", amount: 150, date: "2025-01-15" }
                        ].map((transaction, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'join' ? 'bg-blue-100 text-blue-600' :
                                transaction.type === 'create' ? 'bg-green-100 text-green-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {transaction.type === 'join' ? <Users className="w-5 h-5" /> :
                                 transaction.type === 'create' ? <Plus className="w-5 h-5" /> :
                                 <DollarSign className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {transaction.type === 'join' ? 'Joined' :
                                   transaction.type === 'create' ? 'Created' : 'Cash Out from'} {transaction.tournament}
                                </p>
                                <p className="text-sm text-muted-foreground">{transaction.date}</p>
                              </div>
                            </div>
                            <div className={`font-semibold ${
                              transaction.type === 'cashout' ? 'text-green-600' : 
                              transaction.type === 'join' ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                              {transaction.type === 'cashout' ? '+' : transaction.type === 'join' ? '-' : ''}${transaction.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trading" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stock Trading History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-4" />
                        <p>Your stock trading history will appear here</p>
                        <p className="text-sm">This includes all buy/sell transactions from tournaments</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                          <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-2xl font-bold text-green-600">+$247</p>
                          <p className="text-sm text-muted-foreground">Total Winnings</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <p className="text-2xl font-bold">3</p>
                          <p className="text-sm text-muted-foreground">Tournaments Won</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <p className="text-2xl font-bold">127</p>
                          <p className="text-sm text-muted-foreground">Total Trades</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default case - show loading or main dashboard
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Default dashboard view if no specific view is matched
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <p>Welcome to your trading dashboard!</p>
      </div>

      {/* Join Tournament Dialog */}
      <Dialog open={isJoinTournamentDialogOpen} onOpenChange={setIsJoinTournamentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Tournament</DialogTitle>
            <DialogDescription>
              Enter the tournament code to join an existing competition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="join-code">Tournament Code</Label>
              <Input
                id="join-code"
                value={joinGameCode}
                onChange={(e) => setJoinGameCode(e.target.value)}
                placeholder="Enter tournament code"
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsJoinTournamentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (joinGameCode.trim()) {
                    joinTournamentMutation.mutate(joinGameCode.trim());
                  }
                }}
                disabled={!joinGameCode.trim() || joinTournamentMutation.isPending}
              >
                {joinTournamentMutation.isPending ? "Joining..." : "Join Tournament"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Tournament Dialog */}
      <Dialog open={isCreateTournamentDialogOpen} onOpenChange={setIsCreateTournamentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Tournament</DialogTitle>
            <DialogDescription>
              Set up a new trading competition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tournament-name">Tournament Name</Label>
              <Input
                id="tournament-name"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="Enter tournament name"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-players">Max Players</Label>
                <Input
                  id="max-players"
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min="2"
                  max="100"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="starting-balance">Starting Balance</Label>
                <Input
                  id="starting-balance"
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  min="1000"
                  max="1000000"
                  placeholder="10000"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="buy-in-amount">Buy-in Amount ($)</Label>
              <Input
                id="buy-in-amount"
                type="number"
                value={buyInAmount}
                onChange={(e) => setBuyInAmount(e.target.value)}
                min="0"
                placeholder="Enter amount (0 for free)"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="timeframe">Duration</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 minute">1 Minute</SelectItem>
                  <SelectItem value="1 hour">1 Hour</SelectItem>
                  <SelectItem value="1 day">1 Day</SelectItem>
                  <SelectItem value="1 week">1 Week</SelectItem>
                  <SelectItem value="2 weeks">2 Weeks</SelectItem>
                  <SelectItem value="4 weeks">4 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateTournamentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (tournamentName.trim()) {
                    createTournamentMutation.mutate({
                      name: tournamentName.trim(),
                      maxPlayers: parseInt(maxPlayers as string),
                      startingBalance: parseFloat(startingBalance as string),
                      timeframe,
                      buyInAmount: parseFloat(buyInAmount) || 0,
                      tradingRestriction,
                      isPublic: isPublicTournament
                    });
                  }
                }}
                disabled={!tournamentName.trim() || createTournamentMutation.isPending}
              >
                {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regional Chat */}
      <RegionalChat
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}

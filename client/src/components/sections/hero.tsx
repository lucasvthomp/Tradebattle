import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  // Generate realistic stock chart with candlestick-like movement
  const generateStockChart = () => {
    const points = [];
    const candlesticks = [];
    const width = 1200;
    const height = 600;
    const segments = 80;
    
    let basePrice = height * 0.6; // Start at 60% from top
    let currentPrice = basePrice;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      
      // Generate more realistic stock movement
      const volatility = 25;
      const trend = Math.sin(i * 0.1) * 10; // Gentle wave trend
      const randomChange = (Math.random() - 0.5) * volatility;
      
      currentPrice += randomChange + trend * 0.3;
      currentPrice = Math.max(height * 0.15, Math.min(height * 0.85, currentPrice));
      
      points.push(`${x},${currentPrice}`);
      
      // Add candlestick data for volume bars
      if (i % 4 === 0) {
        candlesticks.push({
          x: x,
          height: Math.random() * 40 + 10,
          y: height - 80
        });
      }
    }
    
    return { 
      path: `M ${points.join(' L ')}`,
      candlesticks: candlesticks
    };
  };

  const { path: chartPath, candlesticks } = generateStockChart();

  return (
    <section className="relative py-20 gradient-card overflow-hidden particle-effect animate-fade-in">
      {/* Large Background Stock Chart */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="w-full h-full scale-110 transform rotate-1"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.6" />
              <stop offset="30%" stopColor="hsl(142, 76%, 46%)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="hsl(51, 100%, 50%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(200, 100%, 50%)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(240, 10%, 8%)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(51, 100%, 50%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Grid system */}
          <g opacity="0.15">
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 75}
                x2="1200"
                y2={i * 75}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
            {Array.from({ length: 13 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 100}
                y1="0"
                x2={i * 100}
                y2="600"
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
          </g>
          
          {/* Volume bars */}
          <g opacity="0.3">
            {candlesticks.map((bar, i) => (
              <rect
                key={`vol-${i}`}
                x={bar.x - 8}
                y={bar.y}
                width="16"
                height={bar.height}
                fill="url(#volumeGradient)"
                rx="2"
              />
            ))}
          </g>
          
          {/* Chart area fill */}
          <path
            d={`${chartPath} L 1200,600 L 0,600 Z`}
            fill="url(#fillGradient)"
          />
          
          {/* Main chart line with glow */}
          <path
            d={chartPath}
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))"
          />
          
          {/* Price points */}
          <g opacity="0.6">
            {chartPath.split(' L ').slice(0, -1).map((point, i) => {
              if (i % 8 === 0) {
                const [x, y] = point.replace('M ', '').split(',').map(Number);
                return (
                  <circle
                    key={`point-${i}`}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="hsl(142, 76%, 36%)"
                    stroke="hsl(51, 100%, 50%)"
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })}
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4 animate-glow">
                Compete. Trade. Win.
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground animate-fade-in">
                No risk, all reward.
              </p>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
              Compete with traders worldwide using virtual portfolios and real market data.
              Test your skills, climb the leaderboards, and win prizes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
              <Button
                size="lg"
                className="btn-primary hover-lift neon-glow animate-pulse-slow"
                onClick={() => window.location.href = "/signup"}
              >
                🚀 Start Trading
              </Button>
              <Button variant="ghost" size="lg" className="btn-secondary hover-lift">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

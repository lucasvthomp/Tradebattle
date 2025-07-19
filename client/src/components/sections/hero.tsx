import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  // Generate stock chart path data
  const generateChartPath = () => {
    const points = [];
    const width = 800;
    const height = 400;
    const segments = 50;
    
    let currentY = height * 0.7; // Start at 70% from top
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      // Add some randomness with upward trend
      const variation = (Math.random() - 0.3) * 40; // Slight upward bias
      currentY += variation;
      // Keep within bounds
      currentY = Math.max(height * 0.2, Math.min(height * 0.9, currentY));
      points.push(`${x},${currentY}`);
    }
    
    return `M ${points.join(' L ')}`;
  };

  const chartPath = generateChartPath();

  return (
    <section className="relative py-20 bg-gradient-to-b from-background to-card overflow-hidden">
      {/* Background Stock Chart SVG */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full object-cover filter blur-sm"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <g opacity="0.1">
            {Array.from({ length: 6 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 80}
                x2="800"
                y2={i * 80}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 100}
                y1="0"
                x2={i * 100}
                y2="400"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
              />
            ))}
          </g>
          
          {/* Chart area fill */}
          <path
            d={`${chartPath} L 800,400 L 0,400 Z`}
            fill="url(#chartFill)"
          />
          
          {/* Chart line */}
          <path
            d={chartPath}
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Glow effect */}
          <path
            d={chartPath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(3px)"
          />
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
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                Compete. Trade. Win.
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground">
                No risk, all reward.
              </p>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compete with traders worldwide using virtual portfolios and real market data.
              Test your skills, climb the leaderboards, and win prizes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => window.location.href = "/signup"}
              >
                Start Trading
              </Button>
              <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
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

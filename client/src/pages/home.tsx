import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ResearchInsight, Study, News } from "@shared/schema";
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  BarChart3,
  Globe,
  Zap,
  Target,
  DollarSign,
  Users,
  BookOpen,
  Activity,
  Shield,
  Sparkles,
  ChevronRight,
  Play,
  MousePointer2
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for interactive elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove);
      return () => heroElement.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  const { data: insights, isLoading: insightsLoading } = useQuery<ResearchInsight[]>({
    queryKey: ["/api/insights"],
  });

  const { data: recentStudies, isLoading: studiesLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const { data: breakingNews, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news/breaking"],
  });

  // Interactive background elements
  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 60 + 20,
    delay: Math.random() * 2,
  }));

  const statsData = [
    { value: "2.4M+", label: "Data Points Analyzed", icon: BarChart3 },
    { value: "500+", label: "Research Reports", icon: BookOpen },
    { value: "15K+", label: "Active Investors", icon: Users },
    { value: "99.7%", label: "Accuracy Rate", icon: Target },
  ];

  const featuresData = [
    {
      title: "Real-Time Market Intelligence",
      description: "Advanced algorithms process thousands of data points in real-time to deliver actionable insights",
      icon: Activity,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Qualitative Analysis Focus",
      description: "Deep-dive into the human factors that drive market movements beyond traditional metrics",
      icon: Globe,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Institutional-Grade Research",
      description: "Professional-level analysis tools previously available only to institutional investors",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Personalized Investment Strategies",
      description: "Tailored recommendations based on your risk profile and investment objectives",
      icon: Target,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 1) 100%)`
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {floatingElements.map((element) => (
            <motion.div
              key={element.id}
              className="absolute rounded-full bg-gradient-to-br from-white/5 to-white/10 blur-xl"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: element.size,
                height: element.size,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6 + element.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Mouse Follower */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl pointer-events-none"
          style={{
            x: useTransform(smoothMouseX, (value) => value - 192),
            y: useTransform(smoothMouseY, (value) => value - 192),
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-4"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                ORSATH
              </h1>
            </div>
            <div className="text-xl md:text-2xl text-gray-300 mb-2">
              Orellana, Santos & Thompson
            </div>
            <div className="text-sm md:text-base text-gray-400 uppercase tracking-wider">
              Investment Research Excellence
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome back, 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {" "}{user?.name || "Researcher"}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your gateway to institutional-grade investment research and real-time market intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Access Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <MousePointer2 className="w-5 h-5 mr-2" />
              Interactive Tour
            </Button>
          </motion.div>

          {/* Live Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Advanced Research Tools
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge technology meets institutional-grade analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuresData.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-500 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                      Learn More
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-black relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Research Insights */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white">Research Insights</h2>
                    </div>
                    
                    {insightsLoading ? (
                      <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-6 bg-white/10 rounded-lg mb-3"></div>
                            <div className="h-4 bg-white/5 rounded-lg mb-2"></div>
                            <div className="h-20 bg-white/5 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : insights && insights.length > 0 ? (
                      <div className="space-y-6">
                        {insights.map((insight, index) => (
                          <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                          >
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="font-bold text-white text-lg">{insight.title}</h3>
                            </div>
                            <p className="text-gray-300 mb-3">{insight.description}</p>
                            {insight.symbol && (
                              <div className="flex items-center">
                                <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                                  {insight.symbol}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-gray-400 text-lg">New insights loading...</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Market Pulse */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-3">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Market Pulse</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Overall Sentiment</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-green-400 font-semibold">Bullish</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Active Opportunities</span>
                        <span className="text-blue-400 font-semibold">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Risk Level</span>
                        <span className="text-yellow-400 font-semibold">Moderate</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border-white/10 hover:border-white/20 transition-all duration-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      {[
                        { icon: BarChart3, label: "View Dashboard", color: "from-blue-500 to-cyan-500" },
                        { icon: BookOpen, label: "Research Library", color: "from-purple-500 to-pink-500" },
                        { icon: AlertTriangle, label: "Risk Alerts", color: "from-red-500 to-orange-500" },
                        { icon: DollarSign, label: "Portfolio Analysis", color: "from-green-500 to-emerald-500" },
                      ].map((action, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-3`}>
                              <action.icon className="w-4 h-4 text-white" />
                            </div>
                            {action.label}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your Investment Strategy?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of investors who trust ORSATH for institutional-grade research and real-time market intelligence.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl"
              >
                <ArrowRight className="w-6 h-6 mr-3" />
                Start Your Analysis
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
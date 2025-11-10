import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Crown,
  ChevronRight,
  BarChart3,
  DollarSign,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch active tournaments
  const { data: tournaments } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: !!user,
  });

  const activeTournaments = (tournaments as any)?.data?.filter((t: any) => t.status === 'active') || [];

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 50,
            y: mousePosition.y * 50,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -40,
            y: mousePosition.y * -40,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative pt-20 pb-32 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {user ? `Welcome back, ${user.username}!` : "Join the Trading Competition"}
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
              Master Trading.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-500 to-primary">
                Compete. Win.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders in real-time competitions. Test your skills,
              climb the leaderboard, and prove you're the best.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              {!user ? (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => navigate("/auth")}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Start Competing
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                    onClick={() => navigate("/tournaments")}
                  >
                    <Target className="w-5 h-5 mr-2" />
                    View Tournaments
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => navigate("/dashboard")}
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                    onClick={() => navigate("/tournaments")}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Browse Tournaments
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold mb-1">{Math.floor(Math.random() * 5000) + 1000}</div>
                  <div className="text-sm text-muted-foreground">Active Traders</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="border-green-500/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-3xl font-bold mb-1">{activeTournaments.length || 12}</div>
                  <div className="text-sm text-muted-foreground">Live Tournaments</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="border-amber-500/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <div className="text-3xl font-bold mb-1">${Math.floor(Math.random() * 500) + 100}K</div>
                  <div className="text-sm text-muted-foreground">Prize Pool</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="border-blue-500/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold mb-1">{Math.floor(Math.random() * 10000) + 5000}</div>
                  <div className="text-sm text-muted-foreground">Daily Trades</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Active Tournaments Section */}
      {user && activeTournaments.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-16 px-4"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">🔥 Live Tournaments</h2>
                <p className="text-muted-foreground">Jump in and start trading now</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/tournaments")}>
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTournaments.slice(0, 3).map((tournament: any, index: number) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-primary/20 bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          Live
                        </Badge>
                        <Trophy className="w-5 h-5 text-amber-500" />
                      </div>

                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {tournament.description || "Compete against other traders"}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Players</span>
                          <span className="font-medium">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Buy-in</span>
                          <span className="font-medium text-green-500">${tournament.buyInAmount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">{tournament.timeframe}</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Trade Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-20 px-4 bg-card/30 backdrop-blur"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Trade with Us?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to become a successful trader</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center"
              >
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Real-Time Trading</h3>
              <p className="text-muted-foreground">
                Trade with live market data and compete in real-time tournaments
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: "0.5s" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-500/50 flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Competitive Prizes</h3>
              <p className="text-muted-foreground">
                Win real prizes by climbing the leaderboard and finishing in top positions
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <motion.div
                variants={floatingVariants}
                animate="animate"
                style={{ animationDelay: "1s" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-500/50 flex items-center justify-center"
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Risk-Free Learning</h3>
              <p className="text-muted-foreground">
                Practice with virtual money and hone your skills without financial risk
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {!user && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-20 px-4"
        >
          <div className="container mx-auto max-w-4xl">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-green-500/10 backdrop-blur">
              <CardContent className="p-12 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-4xl font-bold mb-4">Ready to Start Your Trading Journey?</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join our community today and compete with traders worldwide
                </p>

                <Button
                  size="lg"
                  className="text-lg px-12 py-6 bg-gradient-to-r from-primary via-primary/90 to-green-500 hover:from-primary/90 hover:via-primary/80 hover:to-green-500/90"
                  onClick={() => navigate("/auth")}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      )}
    </div>
  );
}

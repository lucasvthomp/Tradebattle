import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Tag,
  Sparkles,
  TrendingUp,
  Users,
  Trophy,
  Star,
  Zap,
  DollarSign,
  Check,
  X,
} from "lucide-react";

export default function Shop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");

  // Redeem promo code mutation
  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/codes/redeem", { code });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "🎉 Code Redeemed!",
        description: data.message,
      });
      setPromoCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Redeem",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    },
  });

  const handleRedeem = () => {
    if (promoCode.trim()) {
      redeemMutation.mutate(promoCode.trim().toUpperCase());
    }
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    x: Math.random() * 100,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            background: 'radial-gradient(circle, #E3B341, transparent)',
            opacity: 0.3,
          }}
          animate={{
            y: ['-10vh', '110vh'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsing Background Glow */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(227, 179, 65, 0.15), transparent)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(40, 199, 111, 0.15), transparent)' }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Gift className="w-20 h-20 mx-auto" style={{ color: '#E3B341' }} />
          </motion.div>

          <h1 className="text-5xl font-black mb-4" style={{
            background: 'linear-gradient(135deg, #E3B341, #FFD700, #E3B341)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient 3s ease infinite',
          }}>
            Rewards Center
          </h1>

          <p className="text-lg" style={{ color: '#8A93A6' }}>
            Unlock rewards, redeem codes, and earn bonuses
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Promo Code Redemption */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 overflow-hidden" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #0F172A 100%)',
              borderColor: '#E3B341',
              boxShadow: '0 0 40px rgba(227, 179, 65, 0.2)',
            }}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Tag className="w-8 h-8" style={{ color: '#E3B341' }} />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl" style={{ color: '#E3B341' }}>
                      Redeem Code
                    </CardTitle>
                    <CardDescription style={{ color: '#8A93A6' }}>
                      Enter a promo code to claim your reward
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="h-14 text-lg font-bold tracking-wider text-center"
                    style={{
                      background: '#06121F',
                      borderColor: '#E3B341',
                      color: '#E3B341',
                    }}
                    maxLength={20}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={!promoCode.trim() || redeemMutation.isPending}
                    className="h-14 px-8 text-lg font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #E3B341, #FFD700)',
                      color: '#06121F',
                    }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Redeem
                  </Button>
                </div>

                {/* Example Codes */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(227, 179, 65, 0.1)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#E3B341' }}>
                    💡 Where to find codes:
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: '#C9D1E2' }}>
                    <li>• Follow us on social media</li>
                    <li>• Join our Discord server</li>
                    <li>• Special event giveaways</li>
                    <li>• Newsletter subscribers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Coming Soon Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Daily Rewards */}
            <Card className="border-2" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #0F172A 100%)',
              borderColor: '#28C76F',
              opacity: 0.6,
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8" style={{ color: '#28C76F' }} />
                    <div>
                      <CardTitle className="text-xl" style={{ color: '#C9D1E2' }}>
                        Daily Rewards
                      </CardTitle>
                      <CardDescription style={{ color: '#8A93A6' }}>
                        Login every day for bonuses
                      </CardDescription>
                    </div>
                  </div>
                  <Badge style={{ background: '#8A93A6', color: '#06121F' }}>
                    Coming Soon
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Referral Program */}
            <Card className="border-2" style={{
              background: 'linear-gradient(135deg, #1E2D3F 0%, #0F172A 100%)',
              borderColor: '#6366F1',
              opacity: 0.6,
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8" style={{ color: '#6366F1' }} />
                    <div>
                      <CardTitle className="text-xl" style={{ color: '#C9D1E2' }}>
                        Referral Program
                      </CardTitle>
                      <CardDescription style={{ color: '#8A93A6' }}>
                        Invite friends, earn rewards
                      </CardDescription>
                    </div>
                  </div>
                  <Badge style={{ background: '#8A93A6', color: '#06121F' }}>
                    Coming Soon
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12"
        >
          <Card className="border-2" style={{
            background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1), rgba(227, 179, 65, 0.05))',
            borderColor: '#E3B341',
          }}>
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: '#E3B341' }} />
              <h3 className="text-3xl font-black mb-1" style={{ color: '#E3B341' }}>
                ${user?.siteCash || '0.00'}
              </h3>
              <p className="text-sm" style={{ color: '#8A93A6' }}>Your Balance</p>
            </CardContent>
          </Card>

          <Card className="border-2" style={{
            background: 'linear-gradient(135deg, rgba(40, 199, 111, 0.1), rgba(40, 199, 111, 0.05))',
            borderColor: '#28C76F',
          }}>
            <CardContent className="pt-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: '#28C76F' }} />
              <h3 className="text-3xl font-black mb-1" style={{ color: '#28C76F' }}>
                {user?.tournamentWins || 0}
              </h3>
              <p className="text-sm" style={{ color: '#8A93A6' }}>Tournament Wins</p>
            </CardContent>
          </Card>

          <Card className="border-2" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))',
            borderColor: '#6366F1',
          }}>
            <CardContent className="pt-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3" style={{ color: '#6366F1' }} />
              <h3 className="text-3xl font-black mb-1" style={{ color: '#6366F1' }}>
                {user?.totalTrades || 0}
              </h3>
              <p className="text-sm" style={{ color: '#8A93A6' }}>Total Trades</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CSS Animation for Gradient */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

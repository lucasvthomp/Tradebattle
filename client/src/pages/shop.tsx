import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Tag,
  Users,
  Trophy,
  Zap,
  DollarSign,
  Star,
} from "lucide-react";

export default function Shop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/codes/redeem", { code });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Code Redeemed!",
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-7 h-7" style={{ color: '#E3B341' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#C9D1E2' }}>
              Rewards Center
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#8A93A6' }}>
            Redeem codes, track your stats, and unlock upcoming rewards.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: DollarSign, label: 'Balance', value: `$${user?.siteCash || '0.00'}`, color: '#E3B341' },
            { icon: Trophy, label: 'Wins', value: user?.tournamentWins ?? 0, color: '#28C76F' },
            { icon: Zap, label: 'Trades', value: user?.totalTrades ?? 0, color: '#8B5CF6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ y: -2 }}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: '#0C1829', border: '1px solid #0E2040' }}
            >
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
              <div className="text-xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8A93A6' }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Code Redemption */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8"
        >
          <Card style={{ backgroundColor: '#0C1829', border: '1px solid #0E2040' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" style={{ color: '#E3B341' }} />
                <CardTitle className="text-lg" style={{ color: '#C9D1E2' }}>
                  Redeem a Code
                </CardTitle>
              </div>
              <CardDescription style={{ color: '#8A93A6' }}>
                Got a promo code? Enter it below to claim your reward.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="h-11 font-mono tracking-widest text-center"
                  style={{
                    backgroundColor: '#0C1A2E',
                    borderColor: '#0E2040',
                    color: '#C9D1E2',
                  }}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                />
                <Button
                  onClick={handleRedeem}
                  disabled={!promoCode.trim() || redeemMutation.isPending}
                  className="h-11 px-6 font-semibold"
                  style={{
                    backgroundColor: '#E3B341',
                    color: '#091525',
                  }}
                >
                  Redeem
                </Button>
              </div>

              <div className="rounded-lg p-3" style={{ backgroundColor: '#0C1A2E', border: '1px solid #0E2040' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#8A93A6' }}>
                  Where to find codes
                </p>
                <ul className="text-sm space-y-1" style={{ color: '#C9D1E2' }}>
                  <li>Follow us on social media</li>
                  <li>Join our Discord server</li>
                  <li>Special event giveaways</li>
                  <li>Newsletter subscribers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[
            {
              icon: Star,
              title: 'Daily Rewards',
              desc: 'Login every day for streak bonuses',
              color: '#28C76F',
            },
            {
              icon: Users,
              title: 'Referral Program',
              desc: 'Invite friends and earn cash rewards',
              color: '#8B5CF6',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="rounded-xl p-4 flex items-center gap-4 opacity-60"
              style={{ backgroundColor: '#0C1829', border: '1px solid #0E2040' }}
            >
              <Icon className="w-6 h-6 flex-shrink-0" style={{ color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: '#C9D1E2' }}>{title}</div>
                <div className="text-xs" style={{ color: '#8A93A6' }}>{desc}</div>
              </div>
              <Badge className="text-xs flex-shrink-0" style={{ backgroundColor: '#0E2040', color: '#8A93A6', border: 'none' }}>
                Soon
              </Badge>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();

  const upgradeToPremiumMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/upgrade-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to upgrade to premium');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Premium Activated!",
        description: "You now have access to premium features including personal portfolio tracking.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading to premium. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access Premium features</h2>
        </div>
      </div>
    );
  }

  const isPremium = user.subscriptionTier === 'premium';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
              <Crown className="w-10 h-10 mr-3 text-yellow-500" />
              Premium Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              {isPremium ? 'You have premium access!' : 'Unlock advanced trading features'}
            </p>
          </div>

          {isPremium ? (
            <Card className="mb-8 border-yellow-500/20 bg-gradient-to-r from-yellow-50/10 to-orange-50/10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center text-yellow-500">
                  <Star className="w-6 h-6 mr-2" />
                  Premium Member
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  You have full access to all premium features including personal portfolio tracking!
                </p>
                <Button 
                  onClick={() => window.location.href = '/portfolio'}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                >
                  Go to Personal Portfolio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Get access to advanced trading features and personal portfolio management
                </p>
                <Button 
                  onClick={() => upgradeToPremiumMutation.mutate()}
                  disabled={upgradeToPremiumMutation.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3 text-lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  {upgradeToPremiumMutation.isPending ? 'Upgrading...' : 'Activate Premium'}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Personal portfolio tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Separate balance from tournaments</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Advanced portfolio analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Portfolio streak tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Real-time performance metrics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Join trading tournaments</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Create custom tournaments</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Compete with other traders</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Real-time leaderboards</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Free for all users</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
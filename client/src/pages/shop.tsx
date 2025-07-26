import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Zap, 
  Trophy, 
  Crown, 
  Star, 
  Gift, 
  Coins,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

export default function Shop() {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const [selectedCategory, setSelectedCategory] = useState("boosts");

  // Shop items organized by category
  const shopItems = {
    boosts: [
      {
        id: "balance_boost_small",
        name: "Balance Boost (Small)",
        description: "Add $500 to your trading balance instantly",
        price: 4.99,
        icon: Coins,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        badge: "Popular",
        badgeColor: "bg-blue-500"
      },
      {
        id: "balance_boost_medium",
        name: "Balance Boost (Medium)",
        description: "Add $1,500 to your trading balance instantly",
        price: 12.99,
        icon: Coins,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        badge: "Best Value",
        badgeColor: "bg-orange-500"
      },
      {
        id: "balance_boost_large",
        name: "Balance Boost (Large)",
        description: "Add $5,000 to your trading balance instantly",
        price: 39.99,
        icon: Coins,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20"
      },
      {
        id: "trading_multiplier",
        name: "Trading Multiplier (24h)",
        description: "2x gains from all trades for 24 hours",
        price: 9.99,
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        badge: "Limited Time",
        badgeColor: "bg-red-500"
      }
    ],
    cosmetics: [
      {
        id: "golden_badge",
        name: "Golden Trader Badge",
        description: "Show off your premium status with a golden badge",
        price: 7.99,
        icon: Crown,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
      },
      {
        id: "diamond_avatar",
        name: "Diamond Avatar Frame",
        description: "Exclusive diamond frame for your profile picture",
        price: 14.99,
        icon: Star,
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        badge: "Exclusive",
        badgeColor: "bg-purple-500"
      },
      {
        id: "champion_title",
        name: "Champion Title",
        description: "Display 'Champion' title on your profile",
        price: 19.99,
        icon: Trophy,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20"
      }
    ],
    features: [
      {
        id: "private_tournaments",
        name: "Private Tournament Access (30 days)",
        description: "Create unlimited private tournaments for 30 days",
        price: 24.99,
        icon: Users,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        badge: "Premium",
        badgeColor: "bg-indigo-500"
      },
      {
        id: "advanced_analytics",
        name: "Advanced Analytics (30 days)",
        description: "Detailed portfolio analysis and performance insights",
        price: 16.99,
        icon: Target,
        color: "text-teal-600",
        bgColor: "bg-teal-50 dark:bg-teal-900/20"
      }
    ]
  };

  const categories = [
    { id: "boosts", name: "Balance & Boosts", icon: Zap },
    { id: "cosmetics", name: "Cosmetics", icon: Crown },
    { id: "features", name: "Premium Features", icon: Gift }
  ];

  const handlePurchase = (item: any) => {
    // This would integrate with Stripe or another payment processor
    console.log("Purchasing item:", item);
    // For now, just show a placeholder
    alert(`Purchase ${item.name} for ${formatCurrency(item.price)}? (Payment integration coming soon!)`);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Shop</h1>
          <p className="text-muted-foreground mb-8">Please log in to access the shop.</p>
          <Button onClick={() => window.location.href = "/login"}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center neon-glow">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Shop</h1>
            <p className="text-muted-foreground">
              Enhance your trading experience with premium items and boosts
            </p>
          </div>
        </div>
        
        {/* User Balance Display */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(parseFloat(user.balance?.toString() || "0"))}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                // This would open the balance dialog from header
                const balanceButton = document.querySelector('[data-balance-trigger]') as HTMLElement;
                balanceButton?.click();
              }}
            >
              Add Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category Navigation */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Shop Items */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopItems[category.id as keyof typeof shopItems].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} className="hover-lift transition-all duration-300 border-2 hover:border-primary/20">
                    <CardHeader className="relative">
                      {item.badge && (
                        <Badge 
                          className={`absolute -top-2 -right-2 ${item.badgeColor} text-white`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${item.bgColor} mb-4`}>
                        <Icon className={`w-8 h-8 ${item.color}`} />
                      </div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(item.price)}
                        </div>
                        <Button 
                          onClick={() => handlePurchase(item)}
                          className="btn-primary hover-lift neon-glow"
                        >
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, DollarSign, Search } from "lucide-react";

interface TradingWidgetProps {
  height?: number;
}

export function TradingWidget({ height = 400 }: TradingWidgetProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [buySymbol, setBuySymbol] = useState("");
  const [buyShares, setBuyShares] = useState("");
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellShares, setSellShares] = useState("");

  // Fetch portfolio balance
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/personal-portfolio"],
    enabled: !!user,
  });

  // Fetch stock quote for buying
  const { data: buyStockData, isLoading: buyLoading } = useQuery({
    queryKey: ["/api/quote", buySymbol],
    enabled: !!buySymbol && buySymbol.length > 0,
  });

  // Fetch stock quote for selling
  const { data: sellStockData, isLoading: sellLoading } = useQuery({
    queryKey: ["/api/quote", sellSymbol],
    enabled: !!sellSymbol && sellSymbol.length > 0,
  });

  // Buy stock mutation
  const buyMutation = useMutation({
    mutationFn: async (data: { symbol: string; shares: number; price: number }) => {
      const response = await apiRequest("POST", "/api/personal-portfolio/buy", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to buy stock");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: `Successfully purchased ${buyShares} shares of ${buySymbol}`,
      });
      setBuySymbol("");
      setBuyShares("");
      queryClient.invalidateQueries({ queryKey: ["/api/personal-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-purchases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sell stock mutation
  const sellMutation = useMutation({
    mutationFn: async (data: { symbol: string; shares: number; price: number }) => {
      const response = await apiRequest("POST", "/api/personal-portfolio/sell", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sell stock");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale Successful",
        description: `Successfully sold ${sellShares} shares of ${sellSymbol}`,
      });
      setSellSymbol("");
      setSellShares("");
      queryClient.invalidateQueries({ queryKey: ["/api/personal-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-purchases"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBuy = () => {
    if (!buySymbol || !buyShares || !(buyStockData as any)?.data?.price) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid symbol and number of shares",
        variant: "destructive",
      });
      return;
    }

    const shares = parseInt(buyShares);
    const price = (buyStockData as any).data.price;
    const totalCost = shares * price;

    if (totalCost > parseFloat((portfolioData as any)?.data?.balance || "0")) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this purchase",
        variant: "destructive",
      });
      return;
    }

    buyMutation.mutate({ symbol: buySymbol.toUpperCase(), shares, price });
  };

  const handleSell = () => {
    if (!sellSymbol || !sellShares || !(sellStockData as any)?.data?.price) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid symbol and number of shares",
        variant: "destructive",
      });
      return;
    }

    const shares = parseInt(sellShares);
    const price = (sellStockData as any).data.price;

    sellMutation.mutate({ symbol: sellSymbol.toUpperCase(), shares, price });
  };

  const buyPrice = (buyStockData as any)?.data?.price || 0;
  const sellPrice = (sellStockData as any)?.data?.price || 0;
  const buyTotal = parseInt(buyShares || "0") * buyPrice;
  const sellTotal = parseInt(sellShares || "0") * sellPrice;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Trading
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Balance: {formatCurrency(parseFloat((portfolioData as any)?.data?.balance || "0"))}
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="buy" className="text-xs">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="text-xs">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="buy-symbol" className="text-xs">Symbol</Label>
              <Input
                id="buy-symbol"
                type="text"
                placeholder="AAPL"
                value={buySymbol}
                onChange={(e) => setBuySymbol(e.target.value.toUpperCase())}
                className="text-xs h-8"
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buy-shares" className="text-xs">Shares</Label>
              <Input
                id="buy-shares"
                type="number"
                placeholder="100"
                value={buyShares}
                onChange={(e) => setBuyShares(e.target.value)}
                className="text-xs h-8"
                min="1"
              />
            </div>

            {buySymbol && (buyStockData as any)?.data && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">{formatCurrency(buyPrice)}</span>
                </div>
                {buyShares && (
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{formatCurrency(buyTotal)}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleBuy}
              disabled={buyMutation.isPending || buyLoading || !buySymbol || !buyShares}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            >
              {buyMutation.isPending ? "Buying..." : "Buy Stock"}
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="sell-symbol" className="text-xs">Symbol</Label>
              <Input
                id="sell-symbol"
                type="text"
                placeholder="AAPL"
                value={sellSymbol}
                onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
                className="text-xs h-8"
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sell-shares" className="text-xs">Shares</Label>
              <Input
                id="sell-shares"
                type="number"
                placeholder="100"
                value={sellShares}
                onChange={(e) => setSellShares(e.target.value)}
                className="text-xs h-8"
                min="1"
              />
            </div>

            {sellSymbol && (sellStockData as any)?.data && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">{formatCurrency(sellPrice)}</span>
                </div>
                {sellShares && (
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{formatCurrency(sellTotal)}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleSell}
              disabled={sellMutation.isPending || sellLoading || !sellSymbol || !sellShares}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8"
            >
              {sellMutation.isPending ? "Selling..." : "Sell Stock"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
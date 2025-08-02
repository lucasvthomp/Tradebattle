import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface SellStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: any;
}

export function SellStockDialog({ open, onOpenChange, stock }: SellStockDialogProps) {
  const [shares, setShares] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useUserPreferences();

  const sellMutation = useMutation({
    mutationFn: async (data: { shares: number }) => {
      return apiRequest("POST", "/api/personal-portfolio/sell", {
        symbol: stock.symbol,
        sharesToSell: data.shares,
        currentPrice: stock.currentPrice
      });
    },
    onSuccess: () => {
      toast({
        title: "Stock Sold",
        description: `Successfully sold ${shares} shares of ${stock?.symbol}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-portfolio"] });
      onOpenChange(false);
      setShares("");
    },
    onError: (error: any) => {
      toast({
        title: "Sale Failed",
        description: error.message || "Failed to sell stock",
        variant: "destructive",
      });
    },
  });

  const handleSell = () => {
    const sharesToSell = parseInt(shares);
    if (sharesToSell > 0 && sharesToSell <= (stock?.shares || 0)) {
      sellMutation.mutate({ shares: sharesToSell });
    }
  };

  if (!stock) return null;

  const maxShares = stock.shares || 0;
  const estimatedValue = parseInt(shares) * (stock.currentPrice || stock.purchasePrice || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {stock.symbol}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Shares owned:</span>
              <p className="font-medium">{maxShares}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Current price:</span>
              <p className="font-medium">{formatCurrency(stock.currentPrice || stock.purchasePrice || 0)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Shares to sell</Label>
            <Input
              id="shares"
              type="number"
              min="1"
              max={maxShares}
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Enter number of shares"
            />
          </div>

          {shares && parseInt(shares) > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Estimated proceeds:</div>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(estimatedValue)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSell}
              disabled={!shares || parseInt(shares) <= 0 || parseInt(shares) > maxShares || sellMutation.isPending}
              className="flex-1"
            >
              {sellMutation.isPending ? "Selling..." : "Sell Stock"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
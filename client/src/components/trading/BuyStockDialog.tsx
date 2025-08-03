import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Calculator } from "lucide-react";

interface BuyStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: {
    symbol: string;
    name?: string;
    shortName?: string;
    companyName?: string;
    price: number;
    exchange?: string;
  } | null;
}

export function BuyStockDialog({ open, onOpenChange, stock }: BuyStockDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency, t } = useUserPreferences();
  const queryClient = useQueryClient();
  const [shares, setShares] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sharesNumber = parseFloat(shares) || 0;
  const totalCost = sharesNumber * (stock?.price || 0);

  const buyStockMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      return apiRequest("POST", "/api/personal-portfolio/purchase", purchaseData);
    },
    onSuccess: () => {
      toast({ 
        title: t('success'),
        description: `${t('buyStock')}: ${shares} ${t('shares')} ${stock?.symbol}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/personal"] });
      onOpenChange(false);
      setShares("");
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message || t('errorOccurred'),
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stock || !shares || sharesNumber <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of shares",
        variant: "destructive"
      });
      return;
    }

    const purchaseData = {
      symbol: stock.symbol,
      companyName: stock.name || stock.shortName || stock.companyName || stock.symbol,
      shares: sharesNumber,
      purchasePrice: stock.price,
      totalCost: totalCost
    };

    setIsSubmitting(true);
    try {
      await buyStockMutation.mutateAsync(purchaseData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Buy {stock.symbol}</span>
          </DialogTitle>
          <DialogDescription>
            {stock.name || stock.shortName || stock.companyName}
            {stock.exchange && (
              <span className="text-xs ml-2 text-muted-foreground">({stock.exchange})</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-price">Current Price</Label>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stock.price)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              type="number"
              placeholder="Enter number of shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className="text-lg"
            />
          </div>

          {sharesNumber > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Order Summary</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Shares:</span>
                  <span>{sharesNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per share:</span>
                  <span>{formatCurrency(stock.price)}</span>
                </div>
                <div className="border-t pt-1 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!shares || sharesNumber <= 0 || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Processing..." : `Buy ${formatCurrency(totalCost)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OrderRequest } from "../widgets/TradingExecutionWidget";

interface BuyOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: OrderRequest) => void;
  initialOrder: OrderRequest | null;
  balance: number;
}

export function BuyOrderDialog({
  isOpen,
  onClose,
  onConfirm,
  initialOrder,
  balance
}: BuyOrderDialogProps) {
  const { formatCurrency } = useUserPreferences();

  // Order state
  const [shares, setShares] = useState("");
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<'day' | 'gtc' | 'ioc'>('day');

  // Risk management
  const [stopLossEnabled, setStopLossEnabled] = useState(false);
  const [stopLossType, setStopLossType] = useState<'price' | 'percentage'>('percentage');
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [stopLossPercentage, setStopLossPercentage] = useState("5");

  const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
  const [takeProfitType, setTakeProfitType] = useState<'price' | 'percentage'>('percentage');
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [takeProfitPercentage, setTakeProfitPercentage] = useState("10");

  // Reset state when dialog opens with new order
  useEffect(() => {
    if (isOpen && initialOrder) {
      setShares("");
      setOrderType('market');
      setLimitPrice("");
      setStopPrice("");
      setTimeInForce('day');
      setStopLossEnabled(false);
      setStopLossPercentage("5");
      setTakeProfitEnabled(false);
      setTakeProfitPercentage("10");
    }
  }, [isOpen, initialOrder]);

  if (!initialOrder || !initialOrder.stock) return null;

  const stock = initialOrder.stock;
  const currentPrice = stock.price || 0;
  const sharesNum = parseInt(shares) || 0;
  const executionPrice = orderType === 'limit' ? (parseFloat(limitPrice) || currentPrice) : currentPrice;
  const totalCost = sharesNum * executionPrice;
  const canAfford = totalCost <= balance;

  const handleConfirm = () => {
    const order: OrderRequest = {
      ...initialOrder,
      shares: sharesNum,
      orderType,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      timeInForce,
      stopLoss: {
        enabled: stopLossEnabled,
        price: stopLossType === 'price' && stopLossEnabled ? parseFloat(stopLossPrice) : undefined,
        percentage: stopLossType === 'percentage' && stopLossEnabled ? parseFloat(stopLossPercentage) : undefined,
      },
      takeProfit: {
        enabled: takeProfitEnabled,
        price: takeProfitType === 'price' && takeProfitEnabled ? parseFloat(takeProfitPrice) : undefined,
        percentage: takeProfitType === 'percentage' && takeProfitEnabled ? parseFloat(takeProfitPercentage) : undefined,
      }
    };

    onConfirm(order);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Buy {stock.symbol}</span>
          </DialogTitle>
          <DialogDescription>
            {stock.shortName || stock.longName} • Current Price: {formatCurrency(currentPrice)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order">Order Details</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4 mt-4">
            {/* Shares Input */}
            <div>
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                step="1"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Enter number of shares..."
              />
              {sharesNum > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated total: {formatCurrency(totalCost)}
                </p>
              )}
            </div>

            {/* Order Type */}
            <div>
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={orderType} onValueChange={(val) => setOrderType(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order (Execute immediately at market price)</SelectItem>
                  <SelectItem value="limit">Limit Order (Execute at specified price or better)</SelectItem>
                  <SelectItem value="stop">Stop Order (Trigger when price reaches stop level)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limit Price */}
            {orderType === 'limit' && (
              <div>
                <Label htmlFor="limitPrice">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder={`e.g. ${currentPrice.toFixed(2)}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Order will only execute at this price or better
                </p>
              </div>
            )}

            {/* Stop Price */}
            {orderType === 'stop' && (
              <div>
                <Label htmlFor="stopPrice">Stop Price</Label>
                <Input
                  id="stopPrice"
                  type="number"
                  step="0.01"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder={`e.g. ${currentPrice.toFixed(2)}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Order becomes active when price reaches this level
                </p>
              </div>
            )}

            {/* Time in Force */}
            <div>
              <Label htmlFor="timeInForce">Time in Force</Label>
              <Select value={timeInForce} onValueChange={(val) => setTimeInForce(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day (Expires at end of trading day)</SelectItem>
                  <SelectItem value="gtc">GTC (Good 'til Canceled)</SelectItem>
                  <SelectItem value="ioc">IOC (Immediate or Cancel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Balance Warning */}
            {!canAfford && sharesNum > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Insufficient balance. You have {formatCurrency(balance)} but need {formatCurrency(totalCost)}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4 mt-4">
            {/* Stop Loss */}
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Stop Loss</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically sell if price drops below this level to limit losses
                  </p>
                </div>
                <Switch
                  checked={stopLossEnabled}
                  onCheckedChange={setStopLossEnabled}
                />
              </div>

              {stopLossEnabled && (
                <div className="space-y-3 pt-2 border-t">
                  <Select value={stopLossType} onValueChange={(val) => setStopLossType(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Below Entry</SelectItem>
                      <SelectItem value="price">Specific Price</SelectItem>
                    </SelectContent>
                  </Select>

                  {stopLossType === 'percentage' ? (
                    <div>
                      <Label htmlFor="stopLossPercentage">Stop Loss Percentage (%)</Label>
                      <Input
                        id="stopLossPercentage"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={stopLossPercentage}
                        onChange={(e) => setStopLossPercentage(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger at: {formatCurrency(currentPrice * (1 - parseFloat(stopLossPercentage || "0") / 100))}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="stopLossPrice">Stop Loss Price</Label>
                      <Input
                        id="stopLossPrice"
                        type="number"
                        step="0.01"
                        value={stopLossPrice}
                        onChange={(e) => setStopLossPrice(e.target.value)}
                        placeholder={`e.g. ${(currentPrice * 0.95).toFixed(2)}`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Take Profit */}
            <div className="p-4 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Take Profit</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically sell when price rises above this level to lock in gains
                  </p>
                </div>
                <Switch
                  checked={takeProfitEnabled}
                  onCheckedChange={setTakeProfitEnabled}
                />
              </div>

              {takeProfitEnabled && (
                <div className="space-y-3 pt-2 border-t">
                  <Select value={takeProfitType} onValueChange={(val) => setTakeProfitType(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Above Entry</SelectItem>
                      <SelectItem value="price">Specific Price</SelectItem>
                    </SelectContent>
                  </Select>

                  {takeProfitType === 'percentage' ? (
                    <div>
                      <Label htmlFor="takeProfitPercentage">Take Profit Percentage (%)</Label>
                      <Input
                        id="takeProfitPercentage"
                        type="number"
                        step="0.1"
                        min="0"
                        value={takeProfitPercentage}
                        onChange={(e) => setTakeProfitPercentage(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger at: {formatCurrency(currentPrice * (1 + parseFloat(takeProfitPercentage || "0") / 100))}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="takeProfitPrice">Take Profit Price</Label>
                      <Input
                        id="takeProfitPrice"
                        type="number"
                        step="0.01"
                        value={takeProfitPrice}
                        onChange={(e) => setTakeProfitPrice(e.target.value)}
                        placeholder={`e.g. ${(currentPrice * 1.1).toFixed(2)}`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!shares || parseInt(shares) <= 0 || !canAfford}
            className="bg-green-600 hover:bg-green-700"
          >
            Buy {shares} Shares
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

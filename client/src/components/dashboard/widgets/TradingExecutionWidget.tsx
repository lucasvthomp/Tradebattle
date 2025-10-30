import { TrendingUp, TrendingDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockSearchBar } from "@/components/trading/StockSearchBar";
import { useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface TradingExecutionWidgetProps {
  tournamentId?: number;
  holdings?: any[];
  onExecute: (order: OrderRequest) => void;
  onRemove?: () => void;
}

export interface OrderRequest {
  stock: any;
  action: 'buy' | 'short_sell' | 'short_cover';
  shares: number;
  orderType: 'market' | 'limit' | 'stop';
  limitPrice?: number;
  stopPrice?: number;
  stopLoss?: {
    enabled: boolean;
    price?: number;
    percentage?: number;
  };
  takeProfit?: {
    enabled: boolean;
    price?: number;
    percentage?: number;
  };
  timeInForce: 'day' | 'gtc' | 'ioc';
}

export function TradingExecutionWidget({
  tournamentId,
  holdings = [],
  onExecute,
  onRemove
}: TradingExecutionWidgetProps) {
  const { formatCurrency } = useUserPreferences();
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [action, setAction] = useState<'buy' | 'short_sell' | 'short_cover'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<'day' | 'gtc'>('day');

  const handleStockSelect = (stock: any) => {
    setSelectedStock(stock);
    setLimitPrice(stock.price?.toFixed(2) || '');
  };

  const calculateEstimatedCost = () => {
    if (!selectedStock || !quantity) return 0;
    const price = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : selectedStock.price;
    return price * parseFloat(quantity);
  };

  const handleSubmit = () => {
    if (!selectedStock || !quantity) return;

    onExecute({
      stock: selectedStock,
      action: action,
      shares: parseFloat(quantity),
      orderType: orderType,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      timeInForce: timeInForce === 'day' ? 'day' : 'gtc',
      stopLoss: { enabled: false },
      takeProfit: { enabled: false }
    });
  };

  // Check if selected stock has a short position
  const hasShortPosition = selectedStock && holdings.some(
    (h: any) => h.symbol === selectedStock.symbol && h.isShort === true
  );

  const isFormValid = selectedStock && quantity && parseFloat(quantity) > 0 &&
    (orderType === 'market' || (orderType === 'limit' && limitPrice && parseFloat(limitPrice) > 0));

  return (
    <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Stock Search */}
      <div className="p-3 border-b border-border/20">
        <StockSearchBar
          type="purchase"
          placeholder="Search symbol"
          tournamentId={tournamentId}
          onStockSelect={handleStockSelect}
        />
      </div>

      {selectedStock ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stock Header */}
          <div className="p-3 border-b border-border/20">
            <div className="text-lg font-bold mb-0.5">{selectedStock.symbol}</div>
            <div className="text-base font-semibold">${selectedStock.price?.toFixed(2)}</div>
            {selectedStock.changePercent !== undefined && (
              <div className={`text-xs ${selectedStock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}% Today
              </div>
            )}
          </div>

          {/* Trading Form */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Buy/Short/Cover Toggle */}
            <div className={`grid ${hasShortPosition ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5`}>
              <Button
                onClick={() => setAction('buy')}
                className={`h-8 text-xs font-semibold ${
                  action === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-transparent hover:bg-muted text-foreground border border-border/50'
                }`}
              >
                Buy
              </Button>
              <Button
                onClick={() => setAction('short_sell')}
                className={`h-8 text-xs font-semibold ${
                  action === 'short_sell'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-transparent hover:bg-muted text-foreground border border-border/50'
                }`}
              >
                Short
              </Button>
              {hasShortPosition && (
                <Button
                  onClick={() => setAction('short_cover')}
                  className={`h-8 text-xs font-semibold ${
                    action === 'short_cover'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-transparent hover:bg-muted text-foreground border border-border/50'
                  }`}
                >
                  Cover
                </Button>
              )}
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Order type</label>
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger className="h-8 text-xs bg-background border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Quantity</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-8 text-xs bg-background border-border/40"
                placeholder="0"
              />
            </div>

            {/* Limit Price (only for limit orders) */}
            {orderType === 'limit' && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Limit price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="h-8 text-xs bg-background border-border/40"
                  placeholder="$0.00"
                />
              </div>
            )}

            {/* Time in Force */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Time in force</label>
              <Select value={timeInForce} onValueChange={(value: any) => setTimeInForce(value)}>
                <SelectTrigger className="h-8 text-xs bg-background border-border/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Good for day</SelectItem>
                  <SelectItem value="gtc">Good till canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Cost */}
            <div className="pt-3 border-t border-border/30">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs text-muted-foreground">Estimated cost</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(calculateEstimatedCost())}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Order will be placed at market price
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-3 border-t border-border/30">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full h-9 text-xs font-semibold ${
                action === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'short_sell'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {action === 'buy'
                ? `Buy ${selectedStock.symbol}`
                : action === 'short_sell'
                ? `Short ${selectedStock.symbol}`
                : `Cover ${selectedStock.symbol}`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Search and select a stock to begin trading
          </p>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  stopLoss?: { enabled: boolean; price?: number; percentage?: number };
  takeProfit?: { enabled: boolean; price?: number; percentage?: number };
  timeInForce: 'day' | 'gtc' | 'ioc';
}

export function TradingExecutionWidget({
  tournamentId,
  holdings = [],
  onExecute
}: TradingExecutionWidgetProps) {
  const { formatCurrency } = useUserPreferences();
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [action, setAction] = useState<'buy' | 'short_sell' | 'short_cover'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

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
      timeInForce: 'day',
      stopLoss: { enabled: false },
      takeProfit: { enabled: false }
    });
  };

  const hasShortPosition = selectedStock && holdings.some(
    (h: any) => h.symbol === selectedStock.symbol && h.isShort === true
  );

  const isFormValid = selectedStock && quantity && parseFloat(quantity) > 0 &&
    (orderType === 'market' || (orderType === 'limit' && limitPrice && parseFloat(limitPrice) > 0));

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-border/20">
        <StockSearchBar
          type="purchase"
          placeholder="Search stocks..."
          tournamentId={tournamentId}
          onStockSelect={handleStockSelect}
        />
      </div>

      {selectedStock ? (
        <>
          {/* Stock Info - Compact */}
          <div className="px-3 py-2 bg-muted/20 border-b border-border/20">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold">{selectedStock.symbol}</span>
              <span className="text-sm font-semibold">${selectedStock.price?.toFixed(2)}</span>
            </div>
            {selectedStock.changePercent !== undefined && (
              <div className={`text-[10px] ${selectedStock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
              </div>
            )}
          </div>

          {/* Form - Ultra Compact */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {/* Action Buttons */}
            <div className={`grid ${hasShortPosition ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
              <Button
                onClick={() => setAction('buy')}
                size="sm"
                variant={action === 'buy' ? 'default' : 'outline'}
                className={action === 'buy' ? 'bg-green-600 hover:bg-green-700 h-7' : 'h-7'}
              >
                Buy
              </Button>
              <Button
                onClick={() => setAction('short_sell')}
                size="sm"
                variant={action === 'short_sell' ? 'default' : 'outline'}
                className={action === 'short_sell' ? 'bg-red-600 hover:bg-red-700 h-7' : 'h-7'}
              >
                Short
              </Button>
              {hasShortPosition && (
                <Button
                  onClick={() => setAction('short_cover')}
                  size="sm"
                  variant={action === 'short_cover' ? 'default' : 'outline'}
                  className={action === 'short_cover' ? 'bg-blue-600 hover:bg-blue-700 h-7' : 'h-7'}
                >
                  Cover
                </Button>
              )}
            </div>

            {/* Inputs - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-8"
                placeholder="Shares"
              />
              <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'limit' && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="h-8"
                placeholder="Limit price"
              />
            )}

            {/* Cost Display */}
            <div className="flex justify-between items-center py-2 px-2 bg-muted/30 rounded text-xs">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">{formatCurrency(calculateEstimatedCost())}</span>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full h-9 ${
                action === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'short_sell'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {action === 'buy' ? 'Place Buy Order' : action === 'short_sell' ? 'Place Short Order' : 'Cover Short'}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">
            Search for a stock to begin trading
          </p>
        </div>
      )}
    </div>
  );
}

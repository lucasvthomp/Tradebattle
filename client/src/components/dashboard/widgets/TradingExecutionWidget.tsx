import { TrendingUp, TrendingDown, Shield, LayoutList, ShoppingCart } from "lucide-react";
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
  showHoldings?: boolean;
  onToggleView?: () => void;
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
  onRemove,
  showHoldings = false,
  onToggleView
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
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#0C1A2E' }}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#0E2040', backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
            {showHoldings ? "Holdings" : "Trade"}
          </h3>
          {selectedStock && (
            <div className="flex items-baseline gap-2 ml-2 pl-2 border-l" style={{ borderColor: '#0E2040' }}>
              <span className="text-sm font-bold" style={{ color: '#00A3FF' }}>{selectedStock.symbol}</span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>${selectedStock.price?.toFixed(2)}</span>
            </div>
          )}
        </div>
        {onToggleView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleView}
            className="h-6 text-xs"
            style={{ color: '#94A3B8' }}
          >
            {showHoldings ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                Trade
              </>
            ) : (
              <>
                <LayoutList className="w-3 h-3 mr-1" />
                Holdings
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stock Search */}
      <div className="p-2 border-b" style={{ borderColor: '#0E2040' }}>
        <StockSearchBar
          type="purchase"
          placeholder="Search symbol..."
          tournamentId={tournamentId}
          onStockSelect={handleStockSelect}
        />
      </div>

      {selectedStock ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Trading Form */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Buy/Short/Cover Toggle */}
            <div className={`grid ${hasShortPosition ? 'grid-cols-3' : 'grid-cols-2'} gap-1`}>
              <Button
                onClick={() => setAction('buy')}
                className="h-7 text-xs font-semibold"
                style={action === 'buy'
                  ? { backgroundColor: '#10B981', color: '#FFFFFF', border: 'none' }
                  : { backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #0E2040' }
                }
              >
                Buy
              </Button>
              <Button
                onClick={() => setAction('short_sell')}
                className="h-7 text-xs font-semibold"
                style={action === 'short_sell'
                  ? { backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none' }
                  : { backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #0E2040' }
                }
              >
                Short
              </Button>
              {hasShortPosition && (
                <Button
                  onClick={() => setAction('short_cover')}
                  className="h-7 text-xs font-semibold"
                  style={action === 'short_cover'
                    ? { backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none' }
                    : { backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #0E2040' }
                  }
                >
                  Cover
                </Button>
              )}
            </div>

            {/* Order Type & Quantity - Compact Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <label className="text-[10px]" style={{ color: '#94A3B8' }}>Type</label>
                <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <SelectTrigger className="h-7 text-xs" style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#F1F5F9' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'transparent', borderColor: '#0E2040' }}>
                    <SelectItem value="market" style={{ color: '#F1F5F9' }}>Market</SelectItem>
                    <SelectItem value="limit" style={{ color: '#F1F5F9' }}>Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px]" style={{ color: '#94A3B8' }}>Shares</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-7 text-xs"
                  style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#F1F5F9' }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Limit Price & Time in Force - Compact Grid */}
            {orderType === 'limit' && (
              <div className="space-y-0.5">
                <label className="text-[10px]" style={{ color: '#94A3B8' }}>Limit Price</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="h-7 text-xs"
                  style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#F1F5F9' }}
                  placeholder="$0.00"
                />
              </div>
            )}

            <div className="space-y-0.5">
              <label className="text-[10px]" style={{ color: '#94A3B8' }}>Duration</label>
              <Select value={timeInForce} onValueChange={(value: any) => setTimeInForce(value)}>
                <SelectTrigger className="h-7 text-xs" style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#F1F5F9' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'transparent', borderColor: '#0E2040' }}>
                  <SelectItem value="day" style={{ color: '#F1F5F9' }}>Day</SelectItem>
                  <SelectItem value="gtc" style={{ color: '#F1F5F9' }}>GTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Cost - More Compact */}
            <div className="pt-1.5 border-t" style={{ borderColor: '#0E2040' }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px]" style={{ color: '#94A3B8' }}>Est. Total</span>
                <span className="text-sm font-semibold" style={{ color: '#00A3FF' }}>
                  {formatCurrency(calculateEstimatedCost())}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-2 border-t" style={{ borderColor: '#0E2040' }}>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="w-full h-8 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: action === 'buy' ? '#10B981' : action === 'short_sell' ? '#EF4444' : '#3B82F6',
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              {action === 'buy'
                ? 'Buy'
                : action === 'short_sell'
                ? 'Short'
                : 'Cover'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
            Search a stock to trade
          </p>
        </div>
      )}
    </div>
  );
}

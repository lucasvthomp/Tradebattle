import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { executeOrder, type OrderRequest } from "@/lib/orderEngine";
import { ReviewOrderDialog } from "./ReviewOrderDialog";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface OrderPanelProps {
  symbol: string;
  companyName: string;
  currentPrice: number;
  tournamentId: number | undefined;
  availableBuyingPower: number;
  ownedShares: number;
  onOrderExecuted: () => void;
  activeTournaments: any[];
  selectedTournament: any;
  onTournamentChange: (tournament: any) => void;
}

type OrderSide = "buy" | "sell";
type OrderType = "market" | "limit" | "stop" | "stop-limit" | "trailing-stop";

export function OrderPanel({
  symbol,
  companyName,
  currentPrice,
  tournamentId,
  availableBuyingPower,
  ownedShares,
  onOrderExecuted,
  activeTournaments,
  selectedTournament,
  onTournamentChange,
}: OrderPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatCurrency } = useUserPreferences();

  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [trailingAmount, setTrailingAmount] = useState("");
  const [trailingType, setTrailingType] = useState<"dollars" | "percent">("percent");
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedTotal = quantity * currentPrice;

  const canSubmit = (() => {
    if (!tournamentId || !symbol || quantity <= 0 || currentPrice <= 0) return false;
    if (orderSide === "buy" && estimatedTotal > availableBuyingPower) return false;
    if (orderSide === "sell" && quantity > ownedShares) return false;
    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) return false;
    if (orderType === "stop" && (!stopPrice || parseFloat(stopPrice) <= 0)) return false;
    if (orderType === "stop-limit" && (!limitPrice || !stopPrice || parseFloat(limitPrice) <= 0 || parseFloat(stopPrice) <= 0)) return false;
    if (orderType === "trailing-stop" && (!trailingAmount || parseFloat(trailingAmount) <= 0)) return false;
    return true;
  })();

  const buildOrder = (): OrderRequest => ({
    tournamentId: tournamentId!,
    symbol,
    companyName,
    side: orderSide,
    orderType,
    quantity,
    currentMarketPrice: currentPrice,
    ...(limitPrice && { limitPrice: parseFloat(limitPrice) }),
    ...(stopPrice && { stopPrice: parseFloat(stopPrice) }),
    ...(trailingAmount && {
      trailingAmount: parseFloat(trailingAmount),
      trailingType,
    }),
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await executeOrder(buildOrder());
      toast({ title: result.message });
      setShowReview(false);
      setQuantity(1);
      setLimitPrice("");
      setStopPrice("");
      setTrailingAmount("");
      onOrderExecuted();
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/tournament", tournamentId] });
    } catch (error: any) {
      toast({
        title: `${orderSide === "buy" ? "Buy" : "Sell"} failed`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order validation warnings (non-blocking)
  const orderWarning = (() => {
    if (!limitPrice && !stopPrice) return null;
    const lp = parseFloat(limitPrice);
    const sp = parseFloat(stopPrice);
    if (orderType === "limit" && orderSide === "buy" && lp > 0 && lp > currentPrice) {
      return "Limit price is above market price — you may overpay.";
    }
    if (orderType === "limit" && orderSide === "sell" && lp > 0 && lp < currentPrice) {
      return "Limit price is below market price — you may undersell.";
    }
    if (orderType === "stop" && orderSide === "sell" && sp > 0 && sp > currentPrice) {
      return "Stop price is above market price — will trigger immediately.";
    }
    if (orderType === "stop" && orderSide === "buy" && sp > 0 && sp < currentPrice) {
      return "Stop price is below market price — will trigger immediately.";
    }
    return null;
  })();

  return (
    <div className="flex flex-col" style={{ borderBottom: "1px solid #2B3A4C" }}>
      {/* Tournament Selector + Buying Power */}
      <div className="p-3 space-y-2" style={{ borderBottom: "1px solid #2B3A4C" }}>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
            Tournament
          </label>
          <Select
            value={selectedTournament?.id?.toString() || ""}
            onValueChange={(value) => {
              const t = activeTournaments.find((t: any) => t.id.toString() === value);
              if (t) onTournamentChange(t);
            }}
          >
            <SelectTrigger
              className="h-9"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#E3B341" }}
            >
              <SelectValue placeholder="Select Tournament" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#1E2D3F", borderColor: "#2B3A4C" }}>
              {activeTournaments.map((t: any) => (
                <SelectItem key={t.id} value={t.id.toString()} style={{ color: "#C9D1E2" }}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#8A93A6" }}>Buying Power</span>
          <span className="text-sm font-semibold" style={{ color: "#E3B341" }}>
            {formatCurrency(availableBuyingPower)}
          </span>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex">
        <button
          onClick={() => setOrderSide("buy")}
          className="flex-1 py-3 text-sm font-bold text-center transition-colors"
          style={{
            backgroundColor: orderSide === "buy" ? "rgba(40, 199, 111, 0.15)" : "transparent",
            color: orderSide === "buy" ? "#28C76F" : "#8A93A6",
            borderBottom: orderSide === "buy" ? "2px solid #28C76F" : "2px solid transparent",
          }}
        >
          Buy {symbol}
        </button>
        <button
          onClick={() => setOrderSide("sell")}
          className="flex-1 py-3 text-sm font-bold text-center transition-colors"
          style={{
            backgroundColor: orderSide === "sell" ? "rgba(255, 79, 88, 0.15)" : "transparent",
            color: orderSide === "sell" ? "#FF4F58" : "#8A93A6",
            borderBottom: orderSide === "sell" ? "2px solid #FF4F58" : "2px solid transparent",
          }}
        >
          Sell {symbol}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Type */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
            Order Type
          </label>
          <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
            <SelectTrigger
              className="h-9"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#1E2D3F", borderColor: "#2B3A4C" }}>
              <SelectItem value="market" style={{ color: "#C9D1E2" }}>Market</SelectItem>
              <SelectItem value="limit" style={{ color: "#C9D1E2" }}>Limit</SelectItem>
              <SelectItem value="stop" style={{ color: "#C9D1E2" }}>Stop</SelectItem>
              <SelectItem value="stop-limit" style={{ color: "#C9D1E2" }}>Stop Limit</SelectItem>
              <SelectItem value="trailing-stop" style={{ color: "#C9D1E2" }}>Trailing Stop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shares Input */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
            Shares
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9 p-0"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-9 text-center flex-1"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            />
            <Button
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 w-9 p-0"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {orderSide === "sell" && quantity > ownedShares && (
            <p className="text-xs mt-1" style={{ color: "#FF4F58" }}>
              You only own {ownedShares} shares
            </p>
          )}
        </div>

        {/* Limit Price (for limit & stop-limit) */}
        {(orderType === "limit" || orderType === "stop-limit") && (
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
              Limit Price
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={`$${currentPrice.toFixed(2)}`}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="h-9"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            />
          </div>
        )}

        {/* Stop Price (for stop & stop-limit) */}
        {(orderType === "stop" || orderType === "stop-limit") && (
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
              Stop Price
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={`$${currentPrice.toFixed(2)}`}
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="h-9"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            />
          </div>
        )}

        {/* Trailing Stop */}
        {orderType === "trailing-stop" && (
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
              Trail Amount
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={trailingType === "percent" ? "5" : "10.00"}
                value={trailingAmount}
                onChange={(e) => setTrailingAmount(e.target.value)}
                className="h-9 flex-1"
                style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
              />
              <Select value={trailingType} onValueChange={(v) => setTrailingType(v as "dollars" | "percent")}>
                <SelectTrigger
                  className="h-9 w-24"
                  style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "#1E2D3F", borderColor: "#2B3A4C" }}>
                  <SelectItem value="percent" style={{ color: "#C9D1E2" }}>%</SelectItem>
                  <SelectItem value="dollars" style={{ color: "#C9D1E2" }}>$</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Order Validation Warning */}
        {orderWarning && (
          <p className="text-xs px-2 py-1.5 rounded" style={{ color: "#E3B341", backgroundColor: "rgba(227, 179, 65, 0.1)" }}>
            {orderWarning}
          </p>
        )}

        {/* Market Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#8A93A6" }}>Market Price</span>
          <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        <Separator style={{ backgroundColor: "#2B3A4C" }} />

        {/* Estimated Cost / Credit */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "#C9D1E2" }}>
            Estimated {orderSide === "buy" ? "Cost" : "Credit"}
          </span>
          <span className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
            ${estimatedTotal.toFixed(2)}
          </span>
        </div>

        {/* Review Order Button */}
        <Button
          onClick={() => setShowReview(true)}
          disabled={!canSubmit}
          className="w-full h-11 font-bold text-sm disabled:opacity-40"
          style={{
            backgroundColor: orderSide === "buy" ? "#28C76F" : "#FF4F58",
            color: orderSide === "buy" ? "#000000" : "#FFFFFF",
            border: "none",
          }}
        >
          Review Order
        </Button>
      </div>

      {/* Review Dialog */}
      <ReviewOrderDialog
        open={showReview}
        onOpenChange={setShowReview}
        order={canSubmit ? buildOrder() : null}
        estimatedTotal={estimatedTotal}
        onConfirm={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

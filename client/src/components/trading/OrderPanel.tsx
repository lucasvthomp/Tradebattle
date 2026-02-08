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
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const estimatedTotal = quantity * currentPrice;

  const canSubmit = (() => {
    if (!tournamentId || !symbol || quantity <= 0 || currentPrice <= 0) return false;
    if (orderSide === "buy" && estimatedTotal > availableBuyingPower) return false;
    if (orderSide === "sell" && quantity > ownedShares) return false;
    return true;
  })();

  const handleSubmit = async () => {
    if (!awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }

    setIsSubmitting(true);
    setAwaitingConfirm(false);
    try {
      const order: OrderRequest = {
        tournamentId: tournamentId!,
        symbol,
        companyName,
        side: orderSide,
        quantity,
        currentMarketPrice: currentPrice,
      };
      const result = await executeOrder(order);
      toast({ title: result.message });
      setQuantity(1);
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

  // Reset confirm state when inputs change
  const handleSideChange = (side: OrderSide) => {
    setOrderSide(side);
    setAwaitingConfirm(false);
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    setAwaitingConfirm(false);
  };

  const buttonLabel = (() => {
    if (isSubmitting) return "Submitting...";
    if (awaitingConfirm) return `Confirm ${orderSide === "buy" ? "Buy" : "Sell"}`;
    return `${orderSide === "buy" ? "Buy" : "Sell"} ${symbol}`;
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
          onClick={() => handleSideChange("buy")}
          className="flex-1 py-3 text-sm font-bold text-center transition-colors"
          style={{
            backgroundColor: orderSide === "buy" ? "rgba(40, 199, 111, 0.15)" : "transparent",
            color: orderSide === "buy" ? "#28C76F" : "#8A93A6",
            borderBottom: orderSide === "buy" ? "2px solid #28C76F" : "2px solid transparent",
          }}
        >
          Buy
        </button>
        <button
          onClick={() => handleSideChange("sell")}
          className="flex-1 py-3 text-sm font-bold text-center transition-colors"
          style={{
            backgroundColor: orderSide === "sell" ? "rgba(255, 79, 88, 0.15)" : "transparent",
            color: orderSide === "sell" ? "#FF4F58" : "#8A93A6",
            borderBottom: orderSide === "sell" ? "2px solid #FF4F58" : "2px solid transparent",
          }}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Shares Input */}
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: "#8A93A6" }}>
            Shares
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
              className="h-9 w-9 p-0"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-9 text-center flex-1"
              style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#FFFFFF" }}
            />
            <Button
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
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
          {orderSide === "sell" && ownedShares > 0 && (
            <button
              onClick={() => handleQuantityChange(ownedShares)}
              className="text-xs mt-1 underline"
              style={{ color: "#E3B341" }}
            >
              Sell all ({ownedShares} shares)
            </button>
          )}
        </div>

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

        {orderSide === "buy" && estimatedTotal > availableBuyingPower && (
          <p className="text-xs" style={{ color: "#FF4F58" }}>
            Exceeds buying power by {formatCurrency(estimatedTotal - availableBuyingPower)}
          </p>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full h-11 font-bold text-sm disabled:opacity-40"
          style={{
            backgroundColor: awaitingConfirm
              ? (orderSide === "buy" ? "#1fa85c" : "#cc3f47")
              : (orderSide === "buy" ? "#28C76F" : "#FF4F58"),
            color: orderSide === "buy" ? "#000000" : "#FFFFFF",
            border: awaitingConfirm ? "2px solid #FFFFFF" : "none",
          }}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

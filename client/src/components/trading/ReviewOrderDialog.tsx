import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderRequest } from "@/lib/orderEngine";

interface ReviewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRequest | null;
  estimatedTotal: number;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  market: "Market",
  limit: "Limit",
  stop: "Stop",
  "stop-limit": "Stop Limit",
  "trailing-stop": "Trailing Stop",
};

export function ReviewOrderDialog({
  open,
  onOpenChange,
  order,
  estimatedTotal,
  onConfirm,
  isSubmitting,
}: ReviewOrderDialogProps) {
  if (!order) return null;

  const isBuy = order.side === "buy";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        style={{ backgroundColor: "#1E2D3F", border: "1px solid #2B3A4C" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: isBuy ? "#28C76F" : "#FF4F58" }}
          >
            Review {isBuy ? "Buy" : "Sell"} Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Row label="Symbol" value={order.symbol} />
          <Row label="Action" value={isBuy ? "Buy" : "Sell"} />
          <Row label="Order Type" value={ORDER_TYPE_LABELS[order.orderType] || order.orderType} />
          <Row label="Shares" value={order.quantity.toString()} />
          <Row label="Market Price" value={`$${order.currentMarketPrice.toFixed(2)}`} />

          {order.limitPrice !== undefined && (
            <Row label="Limit Price" value={`$${order.limitPrice.toFixed(2)}`} />
          )}
          {order.stopPrice !== undefined && (
            <Row label="Stop Price" value={`$${order.stopPrice.toFixed(2)}`} />
          )}
          {order.trailingAmount !== undefined && (
            <Row
              label="Trail Amount"
              value={
                order.trailingType === "percent"
                  ? `${order.trailingAmount}%`
                  : `$${order.trailingAmount.toFixed(2)}`
              }
            />
          )}

          <Separator style={{ backgroundColor: "#2B3A4C" }} />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "#C9D1E2" }}>
              Estimated {isBuy ? "Cost" : "Credit"}
            </span>
            <span className="text-lg font-bold" style={{ color: "#FFFFFF" }}>
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            style={{ backgroundColor: "#0A1A2F", borderColor: "#2B3A4C", color: "#C9D1E2" }}
          >
            Edit
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 font-semibold"
            style={{
              backgroundColor: isBuy ? "#28C76F" : "#FF4F58",
              color: isBuy ? "#000000" : "#FFFFFF",
              border: "none",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "#8A93A6" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{value}</span>
    </div>
  );
}

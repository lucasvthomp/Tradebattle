import { WidgetWrapper } from "./WidgetWrapper";
import { ShoppingCart } from "lucide-react";
import { StockSearchBar } from "@/components/trading/StockSearchBar";

interface BuyStocksWidgetProps {
  tournamentId?: number;
  onStockSelect: (stock: any) => void;
  onRemove?: () => void;
}

export function BuyStocksWidget({
  tournamentId,
  onStockSelect,
  onRemove
}: BuyStocksWidgetProps) {
  return (
    <WidgetWrapper
      title="Buy Stocks"
      icon={<ShoppingCart className="w-4 h-4" />}
      onRemove={onRemove}
    >
      <StockSearchBar
        type="purchase"
        placeholder="Search stocks to buy..."
        tournamentId={tournamentId}
        onStockSelect={onStockSelect}
      />
    </WidgetWrapper>
  );
}

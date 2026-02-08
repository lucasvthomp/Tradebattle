import { apiRequest } from "./queryClient";

export interface OrderRequest {
  tournamentId: number;
  symbol: string;
  companyName: string;
  side: "buy" | "sell";
  orderType: "market" | "limit" | "stop" | "stop-limit" | "trailing-stop";
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  trailingAmount?: number;
  trailingType?: "dollars" | "percent";
  currentMarketPrice: number;
}

export interface OrderResult {
  success: boolean;
  executedPrice: number;
  executedShares: number;
  totalValue: number;
  message: string;
}

/**
 * Execute an order. Currently all orders execute immediately at market price.
 * When real order matching is added, only this function's internals change.
 */
export async function executeOrder(order: OrderRequest): Promise<OrderResult> {
  const executionPrice = order.currentMarketPrice;
  const totalValue = order.quantity * executionPrice;

  if (order.side === "buy") {
    await apiRequest("POST", `/api/tournaments/${order.tournamentId}/purchase`, {
      symbol: order.symbol,
      companyName: order.companyName,
      shares: order.quantity,
      purchasePrice: executionPrice,
    });
  } else {
    await apiRequest("POST", `/api/tournaments/${order.tournamentId}/sell`, {
      symbol: order.symbol,
      sharesToSell: order.quantity,
      currentPrice: executionPrice,
    });
  }

  return {
    success: true,
    executedPrice: executionPrice,
    executedShares: order.quantity,
    totalValue,
    message: `${order.side === "buy" ? "Bought" : "Sold"} ${order.quantity} shares of ${order.symbol} at $${executionPrice.toFixed(2)}`,
  };
}

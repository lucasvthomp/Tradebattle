import { apiRequest } from "./queryClient";

export interface OrderRequest {
  tournamentId: number;
  symbol: string;
  companyName: string;
  side: "buy" | "sell";
  quantity: number;
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
 * Parse a server error into a human-readable message.
 * apiRequest throws Error("400: {json}") — extract the actual error text.
 */
function parseErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Order failed";
  const msg = error.message;
  // Try to extract JSON from "STATUS: {json}" format
  const colonIdx = msg.indexOf(": ");
  if (colonIdx > 0) {
    const jsonPart = msg.slice(colonIdx + 2);
    try {
      const parsed = JSON.parse(jsonPart);
      return parsed.error || parsed.message || jsonPart;
    } catch {
      // Not JSON, return the part after status code
      return jsonPart || msg;
    }
  }
  return msg;
}

/**
 * Execute a market order. All orders execute immediately at current market price.
 */
export async function executeOrder(order: OrderRequest): Promise<OrderResult> {
  const executionPrice = order.currentMarketPrice;
  const totalValue = order.quantity * executionPrice;

  try {
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
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }

  return {
    success: true,
    executedPrice: executionPrice,
    executedShares: order.quantity,
    totalValue,
    message: `${order.side === "buy" ? "Bought" : "Sold"} ${order.quantity} shares of ${order.symbol} at $${executionPrice.toFixed(2)}`,
  };
}

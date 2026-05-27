import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, ArrowUpRight, ArrowDownLeft, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const typeLabels: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  buy_in: "Tournament Buy-In",
  payout: "Tournament Payout",
  tip_sent: "Tip Sent",
  tip_received: "Tip Received",
  admin_adjustment: "Admin Adjustment",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: "rgba(40, 199, 111, 0.15)", text: "#28C76F" },
  pending: { bg: "rgba(227, 179, 65, 0.15)", text: "#E3B341" },
  failed: { bg: "rgba(255, 79, 88, 0.15)", text: "#FF4F58" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Transactions() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/transactions", typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      params.set("limit", "100");
      const res = await fetch(`/api/transactions?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load transactions");
      return res.json();
    },
  });

  const transactions = data?.data || [];

  const isCredit = (type: string) =>
    ["deposit", "payout", "tip_received", "admin_adjustment"].includes(type);

  return (
    <div className="container mx-auto py-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#C9D1E2' }}>Transaction History</h1>
          <p className="text-sm mt-1" style={{ color: '#8A93A6' }}>View all your account transactions</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]" style={{ background: '#0C1829', borderColor: '#0E2040', color: '#C9D1E2' }}>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="deposit">Deposits</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="buy_in">Tournament Buy-Ins</SelectItem>
            <SelectItem value="payout">Tournament Payouts</SelectItem>
            <SelectItem value="tip_sent">Tips Sent</SelectItem>
            <SelectItem value="tip_received">Tips Received</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card style={{ background: '#0C1829', borderColor: '#0E2040' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
            <DollarSign className="h-5 w-5" style={{ color: '#E3B341' }} />
            Transactions ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#E3B341' }}></div>
              <p className="mt-3 text-sm" style={{ color: '#8A93A6' }}>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#8A93A6' }} />
              <p className="text-sm" style={{ color: '#8A93A6' }}>No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: '#0E2040' }}>
                  <TableHead style={{ color: '#8A93A6' }}>Date</TableHead>
                  <TableHead style={{ color: '#8A93A6' }}>Type</TableHead>
                  <TableHead style={{ color: '#8A93A6' }}>Description</TableHead>
                  <TableHead className="text-right" style={{ color: '#8A93A6' }}>Amount</TableHead>
                  <TableHead className="text-right" style={{ color: '#8A93A6' }}>Balance</TableHead>
                  <TableHead style={{ color: '#8A93A6' }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => {
                  const credit = isCredit(tx.type);
                  const colors = statusColors[tx.status] || statusColors.pending;
                  return (
                    <TableRow key={tx.id} style={{ borderColor: '#0E2040' }}>
                      <TableCell>
                        <span className="text-sm" style={{ color: '#C9D1E2' }}>
                          {formatDate(tx.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {credit ? (
                            <ArrowDownLeft className="w-4 h-4" style={{ color: '#28C76F' }} />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" style={{ color: '#FF4F58' }} />
                          )}
                          <span className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                            {typeLabels[tx.type] || tx.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" style={{ color: '#8A93A6' }}>
                          {tx.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm font-medium" style={{ color: credit ? '#28C76F' : '#FF4F58' }}>
                          {credit ? "+" : "-"}${parseFloat(tx.amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm" style={{ color: '#C9D1E2' }}>
                          ${parseFloat(tx.balanceAfter).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ backgroundColor: colors.bg, borderColor: colors.text, color: colors.text }}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

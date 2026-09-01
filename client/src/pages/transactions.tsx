import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, DollarSign, Filter, RefreshCw } from "lucide-react";
import { useState } from "react";

const typeLabels: Record<string, string> = { deposit: "Capital added", withdrawal: "Cash out", buy_in: "Arena entry", payout: "Arena payout", tip_sent: "Boost sent", tip_received: "Boost received", admin_adjustment: "Account adjustment" };
const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: "rgba(103,231,191,.1)", text: "#67e7bf" },
  pending: { bg: "rgba(242,199,106,.1)", text: "#f2c76a" },
  failed: { bg: "rgba(239,143,154,.1)", text: "#ef8f9a" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Transactions() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const { data, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ["/api/transactions", typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (typeFilter !== "all") params.set("type", typeFilter);
      const response = await fetch(`/api/transactions?${params.toString()}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load ledger");
      return response.json();
    },
  });
  const transactions = data?.data || [];
  const isCredit = (type: string) => ["deposit", "payout", "tip_received", "admin_adjustment"].includes(type);

  return (
    <div className="arena-page-shell transactions-page">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 flex flex-col gap-4 border-b pb-7 md:flex-row md:items-end md:justify-between" style={{ borderColor: "var(--site-edge)" }}>
          <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Account activity / 01</p><h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Account ledger</h1><p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>A clear record of every virtual capital movement.</p></div>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })}><RefreshCw size={14} /> Refresh</Button>
        </header>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[220px]"><Filter size={14} /><SelectValue placeholder="Filter entries" /></SelectTrigger><SelectContent><SelectItem value="all">All ledger entries</SelectItem><SelectItem value="deposit">Capital added</SelectItem><SelectItem value="withdrawal">Cash outs</SelectItem><SelectItem value="buy_in">Arena entries</SelectItem><SelectItem value="payout">Arena payouts</SelectItem><SelectItem value="tip_sent">Boosts sent</SelectItem><SelectItem value="tip_received">Boosts received</SelectItem></SelectContent></Select><span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#7890a4" }}>{transactions.length} entries</span></div>

        <section className="overflow-hidden rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
          {isLoading ? <div className="space-y-2 p-5">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-md" style={{ background: "#081622" }} />)}</div> : transactions.length === 0 ? <div className="px-5 py-16 text-center"><DollarSign className="mx-auto mb-3" size={30} style={{ color: "#7890a4" }} /><p className="text-sm" style={{ color: "#8da2b5" }}>No ledger entries yet.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr style={{ borderBottom: "1px solid var(--site-edge)" }}>{["Date", "Type", "Description", "Amount", "Arena cash", "Status"].map((heading) => <th key={heading} className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "#7890a4" }}>{heading}</th>)}</tr></thead><tbody>{transactions.map((transaction: any) => { const credit = isCredit(transaction.type); const status = statusColors[transaction.status] || statusColors.pending; return <tr key={transaction.id} className="border-b last:border-b-0" style={{ borderColor: "rgba(118,169,198,.12)" }}><td className="whitespace-nowrap px-5 py-4 text-xs" style={{ color: "#afc2d0" }}>{formatDate(transaction.createdAt)}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: "#d7e5eb" }}>{credit ? <ArrowDownLeft size={14} style={{ color: "#67e7bf" }} /> : <ArrowUpRight size={14} style={{ color: "#ef8f9a" }} />}{typeLabels[transaction.type] || transaction.type}</span></td><td className="max-w-[220px] truncate px-5 py-4 text-sm" style={{ color: "#8da2b5" }}>{transaction.description || "—"}</td><td className="whitespace-nowrap px-5 py-4 font-mono text-sm font-bold" style={{ color: credit ? "#67e7bf" : "#ef8f9a" }}>{credit ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}</td><td className="whitespace-nowrap px-5 py-4 font-mono text-sm" style={{ color: "#c9d9e2" }}>${parseFloat(transaction.balanceAfter).toFixed(2)}</td><td className="px-5 py-4"><Badge variant="outline" className="text-[10px] uppercase" style={{ background: status.bg, borderColor: status.text, color: status.text }}>{transaction.status}</Badge></td></tr>; })}</tbody></table></div>}
        </section>
      </div>
    </div>
  );
}

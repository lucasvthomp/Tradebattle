import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, DollarSign, Crown, Award, Medal, Zap, ArrowUp, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type BoardType = "highwager" | "growth" | "active";

const boardMeta: Record<BoardType, { label: string; icon: LucideIcon; endpoint: string }> = {
  highwager: { label: "Biggest board", icon: DollarSign, endpoint: "/api/leaderboard/highest-wager" },
  growth: { label: "Best run", icon: TrendingUp, endpoint: "/api/leaderboard/most-growth" },
  active: { label: "Most reps", icon: Zap, endpoint: "/api/leaderboard/most-active" },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<BoardType>("highwager");
  const highWagerQuery = useQuery({ queryKey: [boardMeta.highwager.endpoint], refetchInterval: 30000 });
  const growthQuery = useQuery({ queryKey: [boardMeta.growth.endpoint], refetchInterval: 30000 });
  const activeQuery = useQuery({ queryKey: [boardMeta.active.endpoint], refetchInterval: 30000 });
  const queries = { highwager: highWagerQuery, growth: growthQuery, active: activeQuery } as Record<BoardType, typeof highWagerQuery>;
  const rankings = (queries[activeTab].data as any)?.data?.rankings || [];

  const rankColor = (rank: number) => rank === 1 ? "#f2c76a" : rank === 2 ? "#b9c8d0" : rank === 3 ? "#cf9c6a" : rank <= 10 ? "#67e7bf" : "#7890a4";
  const valueFor = (player: any) => activeTab === "highwager" ? formatCurrency(player.totalWagered || 0) : activeTab === "growth" ? `${player.growth >= 0 ? "+" : ""}${(player.growth || 0).toFixed(1)}%` : `${player.tournamentsEntered || 0} arena${player.tournamentsEntered === 1 ? "" : "s"}`;
  const ValueIcon = activeTab === "highwager" ? DollarSign : activeTab === "growth" ? ArrowUp : Users;

  return (
    <div className="arena-page-shell leaderboard-page">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 border-b pb-7" style={{ borderColor: "var(--site-edge)" }}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Competitive record / 01</p>
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}><Trophy size={20} /></div><div><h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Rankings</h1><p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>{rankings.length ? `${rankings.length} players on the board` : "Track the players setting the pace."}</p></div></div>
        </header>


        {rankings.length > 0 && (
          <section className="rankings-podium" aria-labelledby="podium-title">
            <div className="rankings-podium-copy">
              <span className="rankings-podium-kicker">THE TOP TABLE</span>
              <h2 id="podium-title">Own the board.</h2>
              <p>The players setting the pace this round.</p>
              <Trophy className="rankings-podium-trophy-icon" size={72} aria-hidden="true" />
            </div>
            <div className="rankings-podium-stage">
              {[1, 0, 2].map((index) => {
                const player = rankings[index];
                const place = index + 1;
                return (
                  <div key={`podium-${place}`} className={`ranking-podium-slot ranking-place-${place}`}>
                    <div className="ranking-podium-player">
                      <span className="ranking-podium-place">#{place}</span>
                      <strong>{player?.username ?? "Open slot"}</strong>
                      <span>{player ? valueFor(player) : "Waiting for a challenger"}</span>
                    </div>
                    <div className="ranking-podium-block"><span>{place}</span></div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BoardType)}>
          <TabsList className="mb-5 grid h-auto w-full grid-cols-3 gap-1 border p-1" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            {(Object.keys(boardMeta) as BoardType[]).map((key) => { const Icon = boardMeta[key].icon; return <TabsTrigger key={key} value={key} className="gap-1.5 py-2.5 text-xs font-bold"><Icon size={14} />{boardMeta[key].label}</TabsTrigger>; })}
          </TabsList>
          {(Object.keys(boardMeta) as BoardType[]).map((key) => (
            <TabsContent key={key} value={key} className="mt-0">
              {queries[key].isLoading ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }} />)}</div> : rankings.length === 0 ? <div className="rounded-lg border px-5 py-16 text-center" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}><Trophy className="mx-auto mb-3" size={30} style={{ color: "#7890a4" }} /><p className="text-sm" style={{ color: "#8da2b5" }}>No scores yet. Make the first move.</p></div> : <div className="space-y-2">{rankings.slice(0, 20).map((player: any, index: number) => { const rank = index + 1; const color = rankColor(rank); return <div key={player.userId} className="flex items-center gap-3 rounded-lg border px-3 py-3.5" style={{ background: rank <= 3 ? `${color}0d` : "#0b1b2a", borderColor: rank <= 3 ? `${color}45` : "var(--site-edge)" }}><div className="flex w-12 shrink-0 items-center gap-1.5"><span className="font-mono text-sm font-black" style={{ color }}>#{rank}</span>{rank === 1 ? <Crown size={14} style={{ color }} /> : rank === 2 ? <Medal size={14} style={{ color }} /> : rank === 3 ? <Award size={14} style={{ color }} /> : null}</div><Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="text-xs font-bold" style={{ background: "#081622", color }}>{player.username?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-bold" style={{ color: "#eaf3f7" }}>{player.username}</span>{player.userId === user?.id && <Badge variant="outline" className="text-[9px]" style={{ borderColor: "rgba(103,231,191,.3)", color: "#67e7bf" }}>You</Badge>}</div><span className="text-[10px]" style={{ color: "#7890a4" }}>Player profile</span></div><div className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-bold" style={{ color }}><ValueIcon size={14} />{valueFor(player)}</div></div>; })}</div>}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

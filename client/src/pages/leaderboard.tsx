import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { GameIcon, type GameIconName } from "@/components/game-icons";

type BoardType = "highwager" | "growth" | "active";

const boardMeta: Record<BoardType, { label: string; icon: GameIconName; endpoint: string }> = {
  highwager: { label: "Biggest board", icon: "coins", endpoint: "/api/leaderboard/highest-wager" },
  growth: { label: "Best run", icon: "chart", endpoint: "/api/leaderboard/most-growth" },
  active: { label: "Most reps", icon: "lightning", endpoint: "/api/leaderboard/most-active" },
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
  const valueIcon: GameIconName = activeTab === "highwager" ? "coins" : activeTab === "growth" ? "chart" : "medal";
  const podiumPlayers = [
    { place: 2, player: rankings[1] },
    { place: 1, player: rankings[0] },
    { place: 3, player: rankings[2] },
  ];

  return (
    <div className="arena-page-shell leaderboard-page">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 border-b pb-7" style={{ borderColor: "var(--site-edge)" }}>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Competitive record / 01</p>
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-lg"><GameIcon name="trophy" size={48} /></div><div><h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Rankings</h1><p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>{rankings.length ? `${rankings.length} players on the board` : "Track the players setting the pace."}</p></div></div>
        </header>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BoardType)}>
          <TabsList className="mb-5 grid h-auto w-full grid-cols-3 gap-1 border p-1" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            {(Object.keys(boardMeta) as BoardType[]).map((key) => <TabsTrigger key={key} value={key} className="gap-1.5 py-2.5 text-xs font-bold"><GameIcon name={boardMeta[key].icon} size={24} />{boardMeta[key].label}</TabsTrigger>)}
          </TabsList>
          {!queries[activeTab].isLoading && (
            <section className="rankings-podium" aria-label="Top three players">
              <div className="rankings-podium-confetti" aria-hidden="true" />
              <div className="rankings-podium-grid">
                {podiumPlayers.map(({ place, player }) => (
                  <div key={place} className={`rankings-podium-slot rankings-podium-place-${place}`}>
                    <div className="rankings-podium-player">
                      <GameIcon name={place === 1 ? "trophy" : "medal"} size={place === 1 ? 66 : 52} />
                      <AvatarWithStatus
                        className={place === 1 ? "h-14 w-14" : "h-11 w-11"}
                        src={player?.profilePicture}
                        alt={player?.username ? `${player.username} profile picture` : "Open podium place"}
                        fallback={player?.username?.slice(0, 2).toUpperCase() || "—"}
                        lastActivity={player?.lastActivity}
                        statusSize="sm"
                      />
                      <strong>{player?.username || "Open spot"}</strong>
                      <span>{player ? valueFor(player) : "Waiting for a run"}</span>
                    </div>
                    <div className="rankings-podium-step">
                      <span>#{place}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {(Object.keys(boardMeta) as BoardType[]).map((key) => (
            <TabsContent key={key} value={key} className="mt-0">
              {queries[key].isLoading ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }} />)}</div> : rankings.length === 0 ? <div className="rounded-lg border px-5 py-16 text-center" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}><GameIcon name="trophy" size={56} /><p className="text-sm" style={{ color: "#8da2b5" }}>No scores yet. Make the first move.</p></div> : <div className="space-y-2">{rankings.slice(0, 20).map((player: any, index: number) => { const rank = index + 1; const color = rankColor(rank); return <div key={player.userId} className="flex items-center gap-3 rounded-lg border px-3 py-3.5" style={{ background: rank <= 3 ? `${color}0d` : "#0b1b2a", borderColor: rank <= 3 ? `${color}45` : "var(--site-edge)" }}><div className="flex w-16 shrink-0 items-center gap-1.5"><span className="font-mono text-sm font-black" style={{ color }}>#{rank}</span>{rank <= 3 && <GameIcon name={rank === 1 ? "trophy" : "medal"} size={26} />}</div><Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="text-xs font-bold" style={{ background: "#081622", color }}>{player.username?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-bold" style={{ color: "#eaf3f7" }}>{player.username}</span>{player.userId === user?.id && <Badge variant="outline" className="text-[9px]" style={{ borderColor: "rgba(103,231,191,.3)", color: "#67e7bf" }}>You</Badge>}</div><span className="text-[10px]" style={{ color: "#7890a4" }}>Player profile</span></div><div className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-bold" style={{ color }}><GameIcon name={valueIcon} size={26} />{valueFor(player)}</div></div>; })}</div>}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

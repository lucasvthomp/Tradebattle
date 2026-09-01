import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight } from "lucide-react";
import { TradebattleIcon } from "@/components/tradebattle-icons";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface Participant {
  userId: number;
  name: string;
  finalBalance: number;
  portfolioValue: number;
  position: number;
}

interface ArchivedTournament {
  id: number;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  endedAt: string;
  participants: Participant[];
}

export default function ArchivePage() {
  const { t } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: archivedTournaments, isLoading } = useQuery({
    queryKey: ["/api/tournaments/archived"],
    queryFn: async () => {
      const response = await fetch("/api/tournaments/archived");
      if (!response.ok) throw new Error("Failed to fetch archive");
      return (await response.json()).data as ArchivedTournament[];
    },
  });
  const filtered = (archivedTournaments || []).filter((tournament) => tournament.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="arena-page-shell archive-page">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 flex items-end justify-between gap-4 border-b pb-7" style={{ borderColor: "var(--site-edge)" }}>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Past arenas / 01</p>
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}><TradebattleIcon name="archive" size={20} /></div><div><h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>{t("archive")}</h1><p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>Review finished rounds and the players who took the board.</p></div></div>
          </div>
          <span className="hidden items-center gap-2 text-xs sm:flex" style={{ color: "#7890a4" }}><TradebattleIcon name="rankings" size={14} style={{ color: "#f2c76a" }} /> Final rankings</span>
        </header>

        <div className="relative mb-5"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "#6f879d" }} /><Input placeholder={t("searchTournaments")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-11 pl-10" /></div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border px-5 py-16 text-center" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}><TradebattleIcon name="rankings" className="mx-auto mb-3" size={30} style={{ color: "#7890a4" }} /><p className="text-sm" style={{ color: "#8da2b5" }}>{searchQuery ? t("noMatchingTournaments") : t("noCompletedTournaments")}</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tournament) => {
              const winner = tournament.participants?.find((participant) => participant.position === 1);
              return <a key={tournament.id} href={`/archive/${tournament.id}`} className="group flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-[rgba(103,231,191,.38)]" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
                <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><h2 className="truncate text-sm font-bold" style={{ color: "#eef6fa" }}>{tournament.name}</h2><Badge variant="outline" className="text-[10px]" style={{ borderColor: "rgba(103,231,191,.25)", color: "#a8ead5" }}>Completed</Badge></div><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "#7890a4" }}><span className="inline-flex items-center gap-1"><TradebattleIcon name="players" size={13} />{tournament.currentPlayers}/{tournament.maxPlayers}</span><span>{tournament.endedAt ? new Date(tournament.endedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date"}</span>{winner && <span className="inline-flex items-center gap-1" style={{ color: "#f2c76a" }}><TradebattleIcon name="rankings" size={13} />{winner.name}</span>}</div></div><ArrowUpRight size={17} className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100" style={{ color: "#67e7bf" }} />
              </a>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

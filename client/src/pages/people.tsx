import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Users, Search, Crown, ArrowUpRight, RefreshCw } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

export default function People() {
  const queryClient = useQueryClient();
  const { t } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: allUsers, isLoading, error } = useQuery({
    queryKey: ["/api/users/public"],
    retry: 3,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const users = (allUsers as any)?.data || [];
  const visibleUsers = [...users]
    .filter((person: any) => person.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "trades") return (b.totalTrades || 0) - (a.totalTrades || 0);
      if (sortBy === "name") return (a.username || "").localeCompare(b.username || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="arena-page-shell people-page min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 flex flex-col gap-5 border-b pb-7 md:flex-row md:items-end md:justify-between" style={{ borderColor: "var(--site-edge)" }}>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Player directory / 01</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}><Users size={20} /></div>
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Players</h1>
                <p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>{visibleUsers.length} {visibleUsers.length === 1 ? t("personUnit") : t("peopleUnit")} in the field</p>
              </div>
            </div>
          </div>
          <div className="people-header-art" aria-hidden="true"><img src="/assets/tradebattle-chest-medal-v2.png" alt="" /></div>
        </header>

        <section className="mb-6 flex flex-col gap-3 rounded-lg border p-3 md:flex-row" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }} aria-label="Find players">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "#6f879d" }} />
            <Input placeholder={t("searchByName")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 pl-10" />
          </div>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-10 rounded-lg border px-3 text-sm outline-none" style={{ background: "#081622", borderColor: "rgba(118,169,198,.18)", color: "#afc2d0" }} aria-label="Sort players">
            <option value="newest">{t("newestMembers")}</option>
            <option value="oldest">{t("oldestMembers")}</option>
            <option value="trades">{t("mostTrades")}</option>
            <option value="name">{t("alphabetical")}</option>
          </select>
        </section>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }} />)}
          </div>
        ) : error ? (
          <div className="rounded-lg border px-5 py-14 text-center" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <Users className="mx-auto mb-3" size={28} style={{ color: "#ef8f9a" }} />
            <p className="text-sm" style={{ color: "#afc2d0" }}>The directory could not load.</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "#67e7bf" }} onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users/public"] })}><RefreshCw size={14} /> Try again</button>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="rounded-lg border px-5 py-14 text-center" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <Search className="mx-auto mb-3" size={28} style={{ color: "#7890a4" }} />
            <p className="text-sm" style={{ color: "#afc2d0" }}>{t("noPeopleFound")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleUsers.map((person: any) => (
              <button key={person.id} type="button" onClick={() => setSelectedUserId(String(person.id))} className="group rounded-lg border p-4 text-left transition-colors hover:border-[rgba(103,231,191,.4)]" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
                <div className="mb-5 flex items-start justify-between">
                  <div className="player-avatar-frame flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: "#081622" }}>
                    <AvatarWithStatus className="h-12 w-12" src={person.profilePicture} alt={person.username} fallback={`${person.username?.[0]?.toUpperCase() || ""}${person.username?.[1]?.toUpperCase() || ""}`} lastActivity={person.lastActivity} statusSize="sm" />
                  </div>
                  <ArrowUpRight size={15} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "#67e7bf" }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold" style={{ color: "#eef6fa" }}>{person.username}</span>
                  {person.subscriptionTier === "administrator" && <Crown size={13} style={{ color: "#f2c76a" }} />}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: "rgba(118,169,198,.14)" }}>
                  <div><span className="block text-[9px] font-black uppercase tracking-wider" style={{ color: "#6f879d" }}>Trades</span><strong className="font-mono text-sm" style={{ color: "#c9d9e2" }}>{person.totalTrades || 0}</strong></div>
                  <div><span className="block text-[9px] font-black uppercase tracking-wider" style={{ color: "#6f879d" }}>Wins</span><strong className="font-mono text-sm" style={{ color: "#67e7bf" }}>{person.tournamentWins || 0}</strong></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}

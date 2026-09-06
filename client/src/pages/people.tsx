import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Users, Search, Crown, RefreshCw } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

function initials(username?: string) {
  return (username || "player").slice(0, 2).toUpperCase();
}

function joinedYear(value?: string | null) {
  if (!value) return "—";
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? String(year) : "—";
}

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
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleUsers = [...users]
    .filter((person: any) => person.username?.toLowerCase().includes(normalizedSearch))
    .sort((a: any, b: any) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "trades") return (b.totalTrades || 0) - (a.totalTrades || 0);
      if (sortBy === "name") return (a.username || "").localeCompare(b.username || "");
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="arena-page-shell people-page min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="people-page-header">
          <div>
            <p className="people-kicker">PLAYERS</p>
            <h1 className="people-title">Find a player</h1>
          </div>
          <div className="people-header-note">
            <span><Users size={15} /> {visibleUsers.length} {visibleUsers.length === 1 ? "player" : "players"}</span>
          </div>
        </header>

        <section className="people-toolbar" aria-label="Find players">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "#6f879d" }} />
            <Input
              placeholder={t("searchByName")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="people-sort-trigger" aria-label="Sort players">
              <SelectValue placeholder="Sort players" />
            </SelectTrigger>
            <SelectContent className="people-sort-menu">
              <SelectItem value="newest">{t("newestMembers")}</SelectItem>
              <SelectItem value="oldest">{t("oldestMembers")}</SelectItem>
              <SelectItem value="trades">{t("mostTrades")}</SelectItem>
              <SelectItem value="name">{t("alphabetical")}</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {isLoading ? (
          <div className="people-grid" aria-label="Loading players">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="people-card people-card-skeleton animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="people-empty-state">
            <Users className="mx-auto mb-3" size={28} style={{ color: "#ef8f9a" }} />
            <p>The player list could not load.</p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users/public"] })}><RefreshCw size={14} /> Try again</button>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="people-empty-state">
            <Search className="mx-auto mb-3" size={28} style={{ color: "#7890a4" }} />
            <p>{normalizedSearch ? "No players match that search." : t("noPeopleFound")}</p>
          </div>
        ) : (
          <div className="people-grid">
            {visibleUsers.map((person: any) => (
              <button
                key={person.id}
                type="button"
                onClick={() => setSelectedUserId(String(person.id))}
                className="people-card group"
                aria-label={`View ${person.username || "player"}'s profile`}
              >
                <div className="people-card-avatar">
                  <AvatarWithStatus
                    className="h-16 w-16"
                    src={person.profilePicture}
                    alt={person.username}
                    fallback={initials(person.username)}
                    lastActivity={person.lastActivity}
                    statusSize="sm"
                  />
                </div>
                <div className="people-card-body">
                  <div className="people-card-heading">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="people-card-name truncate">{person.username}</span>
                      {person.subscriptionTier === "administrator" && <Crown size={14} style={{ color: "#f2c76a" }} aria-label="Administrator" />}
                    </div>
                  </div>
                  <div className="people-card-stats">
                    <div><span>Trades</span><strong>{person.totalTrades || 0}</strong></div>
                    <div><span>Wins</span><strong className="is-positive">{person.tournamentWins || 0}</strong></div>
                    <div><span>Joined</span><strong>{joinedYear(person.createdAt)}</strong></div>
                  </div>
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

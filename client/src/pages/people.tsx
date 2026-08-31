import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Users, Search, Crown } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const cardStyle = {
  backgroundColor: "#0C1829",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
};

export default function People() {
  const queryClient = useQueryClient();
  const { t } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch all users
  const { data: allUsers, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ["/api/users/public"],
    retry: 3,
    staleTime: 30000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const filteredAndSortedUsers = (() => {
    let users = (allUsers as any)?.data || [];
    if (searchQuery) users = users.filter((u: any) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case "newest": return [...users].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest": return [...users].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "trades": return [...users].sort((a: any, b: any) => (b.totalTrades || 0) - (a.totalTrades || 0));
      case "name": return [...users].sort((a: any, b: any) => (a.username || "").localeCompare(b.username || ""));
      default: return users;
    }
  })();

  return (
    <div className="arena-page-shell min-h-[calc(100dvh-4rem)]" style={{ backgroundColor: "transparent" }}>
      <div className="container mx-auto py-6 lg:py-8">
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>

          {/* Header */}
          <motion.div className="mb-6 lg:mb-8" variants={fadeInUp}>
            <h1 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: "#F1F5F9" }}>{t("people")}</h1>
            <p className="text-sm" style={{ color: "#4B5563" }}>
              {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? t("personUnit") : t("peopleUnit")}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </motion.div>

          {/* Search + Sort */}
          <motion.div className="mb-6 flex flex-col sm:flex-row gap-3" variants={fadeInUp}>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#4B5563" }} />
              <Input
                placeholder={t("searchByName")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
                style={{ backgroundColor: "#0C1829", borderColor: "rgba(255,255,255,0.08)", color: "#F1F5F9" }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: "#0C1829", border: "1px solid rgba(255,255,255,0.08)", color: "#8A93A6" }}
            >
              <option value="newest">{t("newestMembers")}</option>
              <option value="oldest">{t("oldestMembers")}</option>
              <option value="trades">{t("mostTrades")}</option>
              <option value="name">{t("alphabetical")}</option>
            </select>
          </motion.div>

          {/* Grid */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoadingUsers ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={cardStyle} className="p-5 animate-pulse">
                    <div className="w-14 h-14 rounded-xl mb-4 shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
                    <div className="space-y-2">
                      <div className="h-3 rounded w-1/2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                      <div className="h-2.5 rounded w-1/3" style={{ backgroundColor: "rgba(255,255,255,0.03)" }} />
                    </div>
                  </div>
                ))
              ) : usersError ? (
                <div className="col-span-full text-center py-16">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#FF4F58", opacity: 0.5 }} />
                  <p className="text-sm mb-3" style={{ color: "#4B5563" }}>Failed to load users</p>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users/public"] })}
                    className="text-sm font-semibold"
                    style={{ color: "#00A3FF" }}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredAndSortedUsers.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#4B5563" }} />
                  <p className="text-sm" style={{ color: "#4B5563" }}>{t("noPeopleFound")}</p>
                </div>
              ) : (
                filteredAndSortedUsers.map((person: any) => (
                  <button
                    key={person.id}
                    onClick={() => setSelectedUserId(String(person.id))}
                    className="text-left transition-all"
                    style={{
                      ...cardStyle,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "rgba(0,163,255,0.2)";
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(0,163,255,0.04)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Avatar — rounded square, slightly lighter bg */}
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.07)",
                        overflow: "hidden",
                        marginBottom: "14px",
                        flexShrink: 0,
                      }}
                    >
                      <AvatarWithStatus
                        className="w-14 h-14"
                        src={person.profilePicture}
                        alt={person.username}
                        fallback={`${person.username?.[0]?.toUpperCase() || ""}${person.username?.[1]?.toUpperCase() || ""}`}
                        lastActivity={person.lastActivity}
                        statusSize="sm"
                      />
                    </div>

                    {/* Username + crown */}
                    <div className="flex items-center gap-1.5 mb-auto">
                      <span className="text-sm font-bold truncate" style={{ color: "#F1F5F9" }}>{person.username}</span>
                      {person.subscriptionTier === "administrator" && (
                        <Crown className="w-3 h-3 shrink-0" style={{ color: "#00A3FF" }} />
                      )}
                    </div>

                    {/* Bottom stats strip */}
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#4B5563",
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {person.totalTrades || 0} trades
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}

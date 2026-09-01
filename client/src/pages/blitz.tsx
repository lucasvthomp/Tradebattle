import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { ArrowRight, Clock3, DollarSign, X } from "lucide-react";
import { TradebattleIcon } from "@/components/tradebattle-icons";

type MatchState = "idle" | "queued" | "vs" | "matched";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function Blitz() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [tournamentId, setTournamentId] = useState<number | null>(null);
  const [queueSeconds, setQueueSeconds] = useState(0);
  const [vsCountdown, setVsCountdown] = useState(3);
  const [opponentName, setOpponentName] = useState("Opponent");
  const [queueExpired, setQueueExpired] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: activeTournamentsData } = useQuery({ queryKey: ["/api/tournaments"], enabled: !!user });
  const activeBlitz = (activeTournamentsData as any)?.data?.find((t: any) => t.tournamentType === "blitz" && t.status === "active");

  const clearPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  };

  const triggerVsScreen = (id: number) => {
    setTournamentId(id);
    setMatchState("vs");
    setVsCountdown(3);
    let count = 3;
    const countdownTimer = window.setInterval(() => {
      count -= 1;
      setVsCountdown(count);
      if (count <= 0) {
        window.clearInterval(countdownTimer);
        setMatchState("matched");
      }
    }, 1000);
  };

  const startPolling = () => {
    clearPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data: any = await (await apiRequest("GET", "/api/blitz/status")).json();
        if (data.matched) {
          clearPolling();
          if (data.opponentName) setOpponentName(data.opponentName);
          triggerVsScreen(data.tournamentId);
        }
      } catch {}
    }, 2000);
    timerRef.current = setInterval(() => setQueueSeconds((current) => current + 1), 1000);
  };

  const queueMutation = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/blitz/queue")).json(),
    onSuccess: (data: any) => {
      if (data.status === "matched") {
        setTournamentId(data.tournamentId);
        if (data.opponentName) setOpponentName(data.opponentName);
        triggerVsScreen(data.tournamentId);
        clearPolling();
      } else {
        setMatchState("queued");
        startPolling();
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/blitz/queue"),
    onSuccess: () => {
      clearPolling();
      setMatchState("idle");
      setQueueSeconds(0);
    },
  });

  useEffect(() => () => {
    clearPolling();
    apiRequest("DELETE", "/api/blitz/queue").catch(() => {});
  }, []);

  useEffect(() => {
    if (matchState !== "queued" || queueSeconds < 300) return;
    clearPolling();
    apiRequest("DELETE", "/api/blitz/queue").catch(() => {});
    setMatchState("idle");
    setQueueSeconds(0);
    setQueueExpired(true);
    const timeout = window.setTimeout(() => setQueueExpired(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [matchState, queueSeconds]);

  const startQueue = () => {
    setQueueExpired(false);
    queueMutation.mutate();
  };

  if (!user) {
    return (
      <div className="arena-page-shell blitz-page">
        <div className="blitz-shell">
          <BlitzHeader />
          <section className="blitz-card blitz-auth-card">
            <div className="blitz-icon-box"><TradebattleIcon name="arena" size={25} /></div>
            <p className="blitz-kicker">Private match queue</p>
            <h2>Step into Blitz.</h2>
            <p>Sign in to find a live opponent and play a focused five-minute market round.</p>
            <div className="blitz-actions"><Link href="/login" className="blitz-primary-link">Enter arena <ArrowRight size={16} /></Link><Link href="/signup" className="blitz-secondary-link">Create profile</Link></div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="arena-page-shell blitz-page">
      <div className="blitz-shell">
        <BlitzHeader />

        {activeBlitz && (
          <section className="blitz-resume-row">
            <div><span className="blitz-live-dot" />You have a live Blitz arena</div>
            <button type="button" onClick={() => navigate(`/dashboard?tournament=${activeBlitz.id}`)}>Resume arena <ArrowRight size={15} /></button>
          </section>
        )}

        <section className="blitz-card blitz-stage-card" aria-live="polite">
          {matchState === "idle" && (
            <div className="blitz-stage-content">
              <div className="blitz-icon-box"><TradebattleIcon name="blitz" size={25} /></div>
              <p className="blitz-kicker">One opponent · five minutes</p>
              <h2>Ready for a clean read?</h2>
              <p>Get matched with one player. The board opens with $10,000 in virtual capital and closes when the clock runs out.</p>
              {queueExpired && <div className="blitz-alert">No match found this time. The queue is open again.</div>}
              <button type="button" className="blitz-primary-button" onClick={startQueue} disabled={queueMutation.isPending}>
                <TradebattleIcon name="arena" size={17} /> {queueMutation.isPending ? "Opening queue…" : "Find a matchup"}
              </button>
            </div>
          )}

          {matchState === "queued" && (
            <div className="blitz-stage-content">
              <div className="blitz-queue-mark"><span /></div>
              <p className="blitz-kicker">Queue open</p>
              <h2>Finding your matchup</h2>
              <div className="blitz-timer">{formatTime(queueSeconds)}</div>
              <p>We’ll drop you into the arena as soon as another player is ready.</p>
              <button type="button" className="blitz-cancel-button" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}><X size={15} /> Leave queue</button>
            </div>
          )}

          {matchState === "vs" && (
            <div className="blitz-stage-content">
              <p className="blitz-kicker">Match found</p>
              <div className="blitz-versus-row">
                <PlayerBadge label="You" name={user.username || "Player"} tone="mint" />
                <span className="blitz-versus">VS</span>
                <PlayerBadge label="Opponent" name={opponentName} tone="rose" />
              </div>
              <div className="blitz-countdown">{vsCountdown > 0 ? vsCountdown : "GO"}</div>
              <p>Opening the market board…</p>
            </div>
          )}

          {matchState === "matched" && tournamentId && (
            <div className="blitz-stage-content">
              <div className="blitz-icon-box blitz-icon-success"><TradebattleIcon name="success" size={25} /></div>
              <p className="blitz-kicker">The board is live</p>
              <h2>Matchup found.</h2>
              <p>Your five-minute arena is ready. Make the first move count.</p>
              <Link href={`/dashboard?tournament=${tournamentId}`} className="blitz-primary-link">Enter arena <ArrowRight size={16} /></Link>
            </div>
          )}
        </section>

        <div className="blitz-info-grid">
          <BlitzInfo icon={<Clock3 size={16} />} label="Round timer" value="5 minutes" />
          <BlitzInfo icon={<TradebattleIcon name="cash" size={16} />} label="Starting stack" value="$10,000 virtual" />
          <BlitzInfo icon={<TradebattleIcon name="rankings" size={16} />} label="Win line" value="Highest board value" />
        </div>
      </div>
    </div>
  );
}

function BlitzHeader() {
  return (
    <header className="blitz-header">
      <div><p className="blitz-kicker">LIVE FORMAT</p><h1>Blitz</h1><p>One board. One rival. Five minutes.</p></div>
      <div className="blitz-header-mark"><TradebattleIcon name="blitz" size={19} /></div>
    </header>
  );
}


function PlayerBadge({ label, name, tone }: { label: string; name: string; tone: "mint" | "rose" }) {
  return <div className={`blitz-player blitz-player-${tone}`}><div className="blitz-avatar">{name[0]?.toUpperCase() || "?"}</div><strong>{name}</strong><span>{label}</span></div>;
}

function BlitzInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="blitz-info-item"><span className="blitz-info-icon">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div>;
}

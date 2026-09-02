import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Trophy, Zap, WalletCards, Users, ArrowRight, Check } from "lucide-react";

const statItems = [
  { label: "Buying power", key: "cash", icon: WalletCards },
  { label: "Arena wins", key: "wins", icon: Trophy },
  { label: "Trade reps", key: "trades", icon: Zap },
] as const;

export default function Shop() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");

  const redeemMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/codes/redeem", { code });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Reward added", description: data.message });
      setPromoCode("");
    },
    onError: (error: any) => {
      toast({
        title: "That code did not work",
        description: error.message || "Check the code and try again.",
        variant: "destructive",
      });
    },
  });

  const handleRedeem = () => {
    const code = promoCode.trim().toUpperCase();
    if (code) redeemMutation.mutate(code);
  };

  const statValue = (key: (typeof statItems)[number]["key"]) => {
    if (key === "cash") return `$${Number(user?.siteCash || 0).toFixed(2)}`;
    if (key === "wins") return String(user?.tournamentWins || 0);
    return String(user?.totalTrades || 0);
  };

  return (
    <div className="arena-page-shell shop-page min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-8 flex flex-col gap-4 border-b pb-7 md:flex-row md:items-end md:justify-between" style={{ borderColor: "var(--site-edge)" }}>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>Player rewards / 01</p>
            <div className="flex items-center gap-3">
              <div className="reward-icon-3d flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}>
                <img src="/assets/tradebattle-reward-soft.png" alt="" className="shop-header-art" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Rewards desk</h1>
                <p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>Keep your edge stocked between arenas.</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase tracking-wider" style={{ borderColor: "rgba(103,231,191,.25)", color: "#a8ead5" }}>
            Virtual perks only
          </Badge>
        </header>

        <section className="shop-spotlight" aria-labelledby="shop-spotlight-title">
          <div className="shop-spotlight-copy">
            <p>DROP ZONE / 01</p>
            <h2 id="shop-spotlight-title">Keep your edge stocked.</h2>
            <span>Redeem codes, collect virtual cash, and show up ready for the next round.</span>
            <div className="shop-spotlight-pills"><strong>FREE TO CLAIM</strong><strong>NO DEPOSITS</strong></div>
          </div>
          <img src="/assets/tradebattle-reward-soft.png" alt="" className="shop-spotlight-art" />
        </section>

        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Player totals">
          {statItems.map(({ label, key, icon: Icon }) => (
            <div key={key} className="rounded-lg border p-4" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: "#7890a4" }}>{label}</span>
                <span className="reward-icon-3d flex h-8 w-8 items-center justify-center rounded-md"><Icon size={16} style={{ color: "#67e7bf" }} /></span>
              </div>
              <strong className="font-mono text-xl" style={{ color: "#eef6fa" }}>{statValue(key)}</strong>
            </div>
          ))}
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <section className="rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <div className="border-b px-5 py-5" style={{ borderColor: "var(--site-edge)" }}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "#67e7bf" }}>Claim a drop</p>
              <h2 className="text-lg font-extrabold" style={{ color: "#eef6fa" }}>Enter a reward code</h2>
              <p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>Codes can unlock virtual cash, cosmetics, or arena boosts.</p>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "#6f879d" }} />
                  <Input
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => event.key === "Enter" && handleRedeem()}
                    placeholder="ENTER CODE"
                    maxLength={20}
                    className="h-11 pl-10 font-mono tracking-[0.18em]"
                    aria-label="Reward code"
                  />
                </div>
                <Button onClick={handleRedeem} disabled={!promoCode.trim() || redeemMutation.isPending} className="h-11 px-6">
                  {redeemMutation.isPending ? "Checking…" : "Redeem"}<ArrowRight size={16} />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Follow the field", "Join the player crew", "Special event drops", "Product updates"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs" style={{ background: "#081622", borderColor: "rgba(118,169,198,.14)", color: "#afc2d0" }}>
                    <Check size={14} style={{ color: "#67e7bf" }} />{item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border p-5" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <div className="reward-icon-3d mb-5 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}>
              <Users size={19} />
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "#eef6fa" }}>Build your crew</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "#8da2b5" }}>The best rewards are easier to find when you stay close to the players you compete with.</p>
            <div className="mt-6 space-y-3 border-t pt-5" style={{ borderColor: "var(--site-edge)" }}>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#67e7bf" }} />Share a match recap</div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#67e7bf" }} />Invite a new player</div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: "#67e7bf" }} />Watch the rankings</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

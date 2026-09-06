import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarCheck2, Gift, KeyRound, Sparkles, Trophy } from "lucide-react";

export default function Shop() {
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

  return (
    <div className="arena-page-shell rewards-page min-h-[calc(100dvh-4rem)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <header className="mb-7 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: "var(--site-edge)" }}>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#67e7bf" }}>PLAYER REWARDS</p>
            <div className="flex items-center gap-3">
              <div className="reward-icon-3d flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(103,231,191,.1)", color: "#67e7bf" }}>
                <Gift size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl" style={{ color: "#eef6fa" }}>Rewards</h1>
                <p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>Virtual perks only.</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="w-fit font-mono text-[10px] uppercase tracking-wider" style={{ borderColor: "rgba(103,231,191,.25)", color: "#a8ead5" }}>
            Virtual only
          </Badge>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]">
          <section className="rounded-lg border" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <div className="border-b px-5 py-5" style={{ borderColor: "var(--site-edge)" }}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "#67e7bf" }}>CLAIM A REWARD</p>
              <h2 className="text-lg font-extrabold" style={{ color: "#eef6fa" }}>Redeem a code</h2>
              <p className="mt-1 text-sm" style={{ color: "#8da2b5" }}>Enter a code to add a virtual reward to your account.</p>
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
                  {redeemMutation.isPending ? "Checking…" : "Redeem"} <ArrowRight size={16} />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Daily login", "Tournament finish", "Event drop", "Referral reward"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs" style={{ background: "#081622", borderColor: "rgba(118,169,198,.14)", color: "#afc2d0" }}>
                    <Sparkles size={14} style={{ color: "#67e7bf" }} />{item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border p-5" style={{ background: "#0b1b2a", borderColor: "var(--site-edge)" }}>
            <div className="flex min-h-[210px] items-center justify-center overflow-hidden rounded-lg" style={{ background: "linear-gradient(145deg, rgba(103,231,191,.08), rgba(8,22,34,.7))", border: "1px solid rgba(103,231,191,.14)" }}>
              <img src="/assets/tradebattle-reward-soft.png" alt="Reward chest" className="h-[205px] w-[245px] object-contain object-center" />
            </div>
            <div className="mt-5 flex items-start gap-3">
              <div className="reward-icon-3d flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(242,199,106,.1)", color: "#f2c76a" }}>
                <Trophy size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: "#67e7bf" }}>DROP TRACK</p>
                <h2 className="mt-1 text-lg font-extrabold" style={{ color: "#eef6fa" }}>Reward drops</h2>
                <p className="mt-1 text-sm leading-6" style={{ color: "#8da2b5" }}>Simple perks for showing up and playing.</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t pt-4" style={{ borderColor: "var(--site-edge)" }}>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><CalendarCheck2 size={15} style={{ color: "#67e7bf" }} /><span>Daily login</span></div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><Trophy size={15} style={{ color: "#f2c76a" }} /><span>Finish an arena</span></div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#c9d9e2" }}><Sparkles size={15} style={{ color: "#67e7bf" }} /><span>Event drops</span></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

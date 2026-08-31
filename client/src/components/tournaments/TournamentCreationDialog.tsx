import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trophy, TrendingUp, Bitcoin, Globe, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TournamentSuccessDialog } from "./TournamentSuccessDialog";

interface TournamentCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [
  { value: "1 day", label: "1 Day" },
  { value: "3 days", label: "3 Days" },
  { value: "1 week", label: "1 Week" },
  { value: "2 weeks", label: "2 Weeks" },
  { value: "1 month", label: "1 Month" },
];

const START_OPTIONS = [
  { value: "5 minutes", label: "In 5 minutes" },
  { value: "30 minutes", label: "In 30 minutes" },
  { value: "1 hour", label: "In 1 hour" },
  { value: "6 hours", label: "In 6 hours" },
  { value: "1 day", label: "Tomorrow" },
  { value: "tomorrow_9am", label: "Tomorrow 9am" },
  { value: "next_monday_9am", label: "Next Monday 9am" },
  { value: "custom", label: "Custom time..." },
];

const PAYOUT_OPTIONS = [
  { value: "winner_take_all", label: "Winner take all" },
  { value: "top_3", label: "Top 3 (60/25/15%)" },
  { value: "top_5", label: "Top 5 (40/25/15/12/8%)" },
  { value: "top_half", label: "Top half (proportional)" },
];

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: '#0F1E35',
  border: '1px solid #1E3050',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '14px',
  outline: 'none',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#8A93A6',
  display: 'block',
  marginBottom: '6px',
};

export function TournamentCreationDialog({ isOpen, onClose }: TournamentCreationDialogProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    maxPlayers: 10,
    tournamentType: "stocks",
    startingBalance: 10000,
    duration: "1 week",
    startDelay: "5 minutes",
    isPublic: true,
    buyInAmount: 0,
    payoutStructure: "winner_take_all",
    customStartTime: "",
  });
  const [buyInRaw, setBuyInRaw] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdTournament, setCreatedTournament] = useState<{ id: number; name: string; code: string } | null>(null);

  const set = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let scheduledStartTime: Date;
      if (form.startDelay === 'custom' && form.customStartTime) {
        scheduledStartTime = new Date(form.customStartTime);
      } else if (form.startDelay === 'tomorrow_9am') {
        const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0);
        scheduledStartTime = d;
      } else if (form.startDelay === 'next_monday_9am') {
        const d = new Date();
        const days = (1 + 7 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + days); d.setHours(9, 0, 0, 0);
        scheduledStartTime = d;
      } else {
        const delayMs: Record<string, number> = {
          '5 minutes': 5 * 60 * 1000, '30 minutes': 30 * 60 * 1000,
          '1 hour': 60 * 60 * 1000, '6 hours': 6 * 60 * 60 * 1000,
          '1 day': 24 * 60 * 60 * 1000,
        };
        scheduledStartTime = new Date(Date.now() + (delayMs[form.startDelay] ?? 5 * 60 * 1000));
      }

      const res = await apiRequest("POST", "/api/tournaments", {
        name: form.name,
        maxPlayers: form.maxPlayers,
        tournamentType: form.tournamentType,
        startingBalance: form.startingBalance,
        duration: form.duration,
        scheduledStartTime: scheduledStartTime.toISOString(),
        buyInAmount: form.buyInAmount,
        tradingRestriction: 'none',
        isPublic: form.isPublic,
        payoutStructure: form.payoutStructure,
      });
      return res.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      onClose();
      setCreatedTournament({ id: response.data.id, name: response.data.name, code: response.data.code });
      setSuccessDialogOpen(true);
      setForm({ name: "", maxPlayers: 10, tournamentType: "stocks", startingBalance: 10000, duration: "1 week", startDelay: "5 minutes", isPublic: true, buyInAmount: 0, payoutStructure: "winner_take_all", customStartTime: "" });
      setBuyInRaw("0");
    },
    onError: (error: Error) => {
      toast({ title: "Couldn’t open the arena", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Arena name is required";
    if (form.maxPlayers < 2 || form.maxPlayers > 50) errs.maxPlayers = "2–50 players";
    if (form.startingBalance < 1000) errs.startingBalance = "Min $1,000";
    if (form.buyInAmount > 0) {
      const bal = parseFloat(user?.siteCash?.toString() || '0');
      if (form.buyInAmount > bal) errs.buyInAmount = `Insufficient balance ($${bal.toFixed(2)} available)`;
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) createMutation.mutate();
  };

  const card = {
    background: '#172035',
    border: '1px solid #1E3050',
    borderRadius: '10px',
    padding: '12px',
    cursor: 'pointer' as const,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          style={{ background: '#0D1B2E', border: '1px solid #1E3050', borderRadius: '14px', padding: '24px', maxWidth: '440px', width: '95vw' }}
        >
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E2E8F0', fontSize: '16px', fontWeight: '700' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,163,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={16} color="#00A3FF" />
              </div>
              Open arena
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Arena name</label>
              <input
                style={{ ...inputStyle, borderColor: errors.name ? '#EF4444' : '#1E3050' }}
                placeholder="e.g. Friday Night Tape"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { value: 'stocks', label: 'Stocks', sub: 'Market hours', icon: <TrendingUp size={15} />, color: '#3B82F6' },
                  { value: 'crypto', label: 'Crypto', sub: '24/7 trading', icon: <Bitcoin size={15} />, color: '#00A3FF' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => set('tournamentType', opt.value)}
                    style={{
                      ...card,
                      display: 'flex', alignItems: 'center', gap: '10px',
                      borderColor: form.tournamentType === opt.value ? opt.color : '#1E3050',
                      borderWidth: form.tournamentType === opt.value ? '2px' : '1px',
                    }}
                  >
                    <span style={{ color: opt.color }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#E2E8F0' }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: '#8A93A6' }}>{opt.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Players + Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Player cap</label>
                <input
                  type="number" min="2" max="50"
                  style={{ ...inputStyle, borderColor: errors.maxPlayers ? '#EF4444' : '#1E3050' }}
                  value={form.maxPlayers}
                  onChange={e => set('maxPlayers', Math.min(50, Math.max(2, parseInt(e.target.value) || 2)))}
                />
                {errors.maxPlayers && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.maxPlayers}</p>}
              </div>
              <div>
                <label style={labelStyle}>Starting capital</label>
                <input
                  type="number" min="1000" step="1000"
                  style={{ ...inputStyle, borderColor: errors.startingBalance ? '#EF4444' : '#1E3050' }}
                  value={form.startingBalance}
                  onChange={e => set('startingBalance', Math.max(1000, parseInt(e.target.value) || 1000))}
                />
                {errors.startingBalance && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.startingBalance}</p>}
              </div>
            </div>

            {/* Duration + Start */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Duration</label>
                <Select value={form.duration} onValueChange={v => set('duration', v)}>
                  <SelectTrigger style={{ ...inputStyle, height: '38px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0D1B2E', border: '1px solid #1E3050' }}>
                    {DURATION_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} style={{ color: '#E2E8F0' }}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Starts</label>
                <Select value={form.startDelay} onValueChange={v => set('startDelay', v)}>
                  <SelectTrigger style={{ ...inputStyle, height: '38px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0D1B2E', border: '1px solid #1E3050' }}>
                    {START_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} style={{ color: '#E2E8F0' }}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.startDelay === 'custom' && (
              <div>
                <label style={labelStyle}>Custom opening time</label>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.customStartTime}
                  min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                  onChange={e => set('customStartTime', e.target.value)}
                />
              </div>
            )}

            {/* Buy-in */}
            <div>
              <label style={labelStyle}>Entry fee (optional)</label>
              <input
                type="number" min="0" step="0.01"
                style={{ ...inputStyle, borderColor: errors.buyInAmount ? '#EF4444' : '#1E3050' }}
                placeholder="0.00 — free to join"
                value={buyInRaw}
                onChange={e => {
                  const raw = e.target.value;
                  setBuyInRaw(raw);
                  const parsed = parseFloat(raw);
                  set('buyInAmount', isNaN(parsed) ? 0 : Math.max(0, parsed));
                }}
              />
              {errors.buyInAmount && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.buyInAmount}</p>}
              {form.buyInAmount > 0 && (
                <p style={{ fontSize: '11px', color: '#28C76F', marginTop: '4px' }}>
                  Prize pool: {formatCurrency(form.buyInAmount * form.maxPlayers * 0.95)} (5% platform fee)
                </p>
              )}
            </div>

            {/* Payout + Visibility */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Payout</label>
                <Select value={form.payoutStructure} onValueChange={v => set('payoutStructure', v)}>
                  <SelectTrigger style={{ ...inputStyle, height: '38px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0D1B2E', border: '1px solid #1E3050' }}>
                    {PAYOUT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} style={{ color: '#E2E8F0' }}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label style={labelStyle}>Visibility</label>
                <div style={{
                  ...card, cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  height: '38px', padding: '0 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {form.isPublic
                      ? <Globe size={13} color="#28C76F" />
                      : <Shield size={13} color="#00A3FF" />
                    }
                    <span style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      {form.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <Switch checked={form.isPublic} onCheckedChange={v => set('isPublic', v)} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: '10px',
                  background: 'transparent', border: '1px solid #1E3050',
                  borderRadius: '8px', color: '#8A93A6',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                style={{
                  flex: 2, padding: '10px',
                  background: createMutation.isPending ? '#1E3050' : '#00A3FF',
                  border: 'none', borderRadius: '8px',
                  color: createMutation.isPending ? '#8A93A6' : '#091628',
                  fontSize: '13px', fontWeight: '700', cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {createMutation.isPending ? 'Opening...' : 'Open arena'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {createdTournament && (
        <TournamentSuccessDialog
          isOpen={successDialogOpen}
          onClose={() => { setSuccessDialogOpen(false); setCreatedTournament(null); }}
          tournamentId={createdTournament.id}
          tournamentName={createdTournament.name}
          tournamentCode={createdTournament.code}
        />
      )}
    </>
  );
}

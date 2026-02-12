import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trophy,
  Users,
  DollarSign,
  Clock,
  Shield,
  Globe,
  TrendingUp,
  Bitcoin,
  Timer,
  Crown,
  Info,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import TournamentSuccessDialog from "./TournamentSuccessDialog";

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

const START_DELAY_OPTIONS = [
  { value: "5 minutes", label: "5 Minutes" },
  { value: "10 minutes", label: "10 Minutes" },
  { value: "30 minutes", label: "30 Minutes" },
  { value: "1 hour", label: "1 Hour" },
  { value: "2 hours", label: "2 Hours" },
  { value: "6 hours", label: "6 Hours" },
  { value: "12 hours", label: "12 Hours" },
  { value: "1 day", label: "1 Day" },
  { value: "tomorrow_9am", label: "Tomorrow 9am" },
  { value: "tomorrow_6pm", label: "Tomorrow 6pm" },
  { value: "next_monday_9am", label: "Next Monday 9am" },
  { value: "next_saturday_12pm", label: "Next Saturday 12pm" },
  { value: "3 days", label: "3 Days" },
  { value: "1 week", label: "1 Week" },
  { value: "custom", label: "Custom Date/Time" },
];

// Info tooltip component
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function TournamentCreationDialog({ isOpen, onClose }: TournamentCreationDialogProps) {
  const { user } = useAuth();
  const { formatCurrency, t } = useUserPreferences();
  const { toast } = useToast();

  // Tournament form state
  const [formData, setFormData] = useState({
    name: "", // 1. Tournament title
    maxPlayers: 10, // 2. Max amount of players
    tournamentType: "stocks", // 3. Stock or Crypto tournament
    startingBalance: 10000, // 4. Starting Fake Cash amount
    duration: "1 week", // 5. Duration of the tournament
    startDelay: "5 minutes", // 6. In how many minutes, hours, or days the tournament will start
    isPublic: true, // 7. Private or Public
    buyInAmount: 0, // Buy-in amount
    payoutStructure: "winner_take_all", // Payout structure
    agreeToTerms: false, // Terms of service agreement
    customStartTime: "" // Custom datetime for "custom" start delay
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [createdTournament, setCreatedTournament] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let scheduledStartTime: Date;

      if (data.startDelay === 'custom' && data.customStartTime) {
        scheduledStartTime = new Date(data.customStartTime);
      } else if (data.startDelay === 'tomorrow_9am') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        scheduledStartTime = tomorrow;
      } else if (data.startDelay === 'tomorrow_6pm') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(18, 0, 0, 0);
        scheduledStartTime = tomorrow;
      } else if (data.startDelay === 'next_monday_9am') {
        const nextMonday = new Date();
        const daysUntilMonday = (1 + 7 - nextMonday.getDay()) % 7 || 7;
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        scheduledStartTime = nextMonday;
      } else if (data.startDelay === 'next_saturday_12pm') {
        const nextSaturday = new Date();
        const daysUntilSaturday = (6 + 7 - nextSaturday.getDay()) % 7 || 7;
        nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
        nextSaturday.setHours(12, 0, 0, 0);
        scheduledStartTime = nextSaturday;
      } else {
        scheduledStartTime = new Date(Date.now() + (
          data.startDelay === 'immediately' ? 0 :
          data.startDelay === '1 minute' ? 1 * 60 * 1000 :
          data.startDelay === '5 minutes' ? 5 * 60 * 1000 :
          data.startDelay === '10 minutes' ? 10 * 60 * 1000 :
          data.startDelay === '30 minutes' ? 30 * 60 * 1000 :
          data.startDelay === '1 hour' ? 60 * 60 * 1000 :
          data.startDelay === '2 hours' ? 2 * 60 * 60 * 1000 :
          data.startDelay === '6 hours' ? 6 * 60 * 60 * 1000 :
          data.startDelay === '12 hours' ? 12 * 60 * 60 * 1000 :
          data.startDelay === '1 day' ? 24 * 60 * 60 * 1000 :
          data.startDelay === '3 days' ? 3 * 24 * 60 * 60 * 1000 :
          7 * 24 * 60 * 60 * 1000
        ));
      }

      const res = await apiRequest("POST", "/api/tournaments", {
        name: data.name,
        maxPlayers: data.maxPlayers,
        tournamentType: data.tournamentType,
        startingBalance: data.startingBalance,
        duration: data.duration,
        scheduledStartTime: scheduledStartTime.toISOString(),
        buyInAmount: data.buyInAmount,
        tradingRestriction: 'none',
        isPublic: data.isPublic,
        payoutStructure: data.payoutStructure
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCreatedTournament(data.data);
      setShowSuccessDialog(true);
      onClose();
      setFormData({
        name: "",
        maxPlayers: 10,
        tournamentType: "stocks",
        startingBalance: 10000,
        duration: "1 week",
        startDelay: "5 minutes",
        isPublic: true,
        buyInAmount: 0,
        payoutStructure: "winner_take_all",
        agreeToTerms: false,
        customStartTime: ""
      });
      setErrors({});
      setStep('form');
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tournament title is required";
    }

    if (formData.maxPlayers < 2) {
      newErrors.maxPlayers = "Minimum 2 players required";
    }

    if (formData.maxPlayers > 50) {
      newErrors.maxPlayers = "Maximum 50 players allowed";
    }

    if (formData.startingBalance < 1000) {
      newErrors.startingBalance = "Minimum starting balance is $1,000";
    }

    if (formData.startingBalance > 1000000) {
      newErrors.startingBalance = "Maximum starting balance is $1,000,000";
    }

    // Buy-in validation
    if (formData.buyInAmount > 0) {
      const userBalance = parseFloat(user?.siteCash?.toString() || '0');
      if (formData.buyInAmount > userBalance) {
        newErrors.buyInAmount = `Insufficient funds. You need $${formData.buyInAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} but only have $${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in your account.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createTournamentMutation.mutate(formData);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Determine if the form is ready to submit
  const isFormReady = formData.name.trim() !== "" && !createTournamentMutation.isPending;

  // Calculate prize pool for preview
  const prizePool = formData.buyInAmount > 0
    ? formData.buyInAmount * formData.maxPlayers * 0.95
    : 0;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={step === 'form' ? "max-w-7xl max-h-[90vh] overflow-hidden p-0" : "max-w-lg p-0"} style={{ backgroundColor: step === 'form' ? '#080C14' : '#0F172A', borderColor: '#E3B341', borderWidth: '2px' }}>
        {step === 'form' ? (
        <div className="grid grid-cols-5 gap-0 h-full">
          {/* Left Side - Form (3/5 width) */}
          <div className="col-span-3 overflow-y-auto p-6" style={{ backgroundColor: '#0F172A' }}>
            <DialogHeader>
              <div className="flex items-center justify-between mb-3">
                <DialogTitle className="flex items-center space-x-3">
                  <motion.div
                    className="p-2 rounded-lg relative overflow-hidden"
                    style={{ backgroundColor: '#E3B341' }}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-transparent animate-pulse" />
                    <Trophy className="w-5 h-5 relative z-10" style={{ color: '#080C14' }} />
                  </motion.div>
                  <div>
                    <span className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Create Tournament</span>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>Configure your competition</p>
                  </div>
                </DialogTitle>
                <Badge className="font-bold" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
                  <Gift className="w-3 h-3 mr-1" />
                  Free
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-2.5 pt-2">


          {/* Tournament Title */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
              <Label htmlFor="tournament-name" className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                Tournament Title
              </Label>
              <InfoTooltip content="Choose a unique and descriptive name for your tournament that participants will see when browsing." />
            </div>
            <Input
              id="tournament-name"
              placeholder="Enter tournament name..."
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`${errors.name ? "border-red-500" : ""} focus:border-yellow-500 transition-all`}
              style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Tournament Settings Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Max Players */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                <Label htmlFor="max-players" className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                  Players
                </Label>
                <InfoTooltip content="Set the maximum number of participants (2-50)." />
              </div>
              <Input
                id="max-players"
                type="number"
                min="2"
                max="50"
                value={formData.maxPlayers}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 2;
                  updateField("maxPlayers", Math.min(50, Math.max(2, val)));
                }}
                className={`${errors.maxPlayers ? "border-red-500" : ""} text-center font-bold`}
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              {errors.maxPlayers && <p className="text-xs text-red-500">{errors.maxPlayers}</p>}
            </div>

            {/* Starting Cash */}
            <div className="space-y-1.5 col-span-2">
              <div className="flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                <Label htmlFor="starting-balance" className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                  Starting Cash
                </Label>
                <InfoTooltip content="Virtual currency amount each participant starts with." />
              </div>
              <Input
                id="starting-balance"
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={formData.startingBalance}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 10000;
                  updateField("startingBalance", Math.min(1000000, Math.max(1000, val)));
                }}
                className={`${errors.startingBalance ? "border-red-500" : ""} font-bold`}
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              {errors.startingBalance && <p className="text-xs text-red-500">{errors.startingBalance}</p>}
            </div>
          </div>

          {/* Tournament Type */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Label className="text-xs font-medium" style={{ color: '#F1F5F9' }}>Tournament Type</Label>
              <InfoTooltip content="Stocks: Trade traditional stock markets during market hours. Crypto: Trade cryptocurrencies 24/7." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
                style={{
                  backgroundColor: formData.tournamentType === "stocks" ? '#111827' : '#0F172A',
                  borderColor: formData.tournamentType === "stocks" ? '#3B82F6' : '#1F2937',
                  borderWidth: formData.tournamentType === "stocks" ? '2px' : '1px',
                  boxShadow: formData.tournamentType === "stocks" ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
                }}
                onClick={() => updateField("tournamentType", "stocks")}
              >
                <CardContent className="flex items-center space-x-2.5 p-2.5">
                  <div className="p-1.5 rounded" style={{ backgroundColor: '#3B82F620' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#F1F5F9' }}>Stocks</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>Market hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
                style={{
                  backgroundColor: formData.tournamentType === "crypto" ? '#111827' : '#0F172A',
                  borderColor: formData.tournamentType === "crypto" ? '#E3B341' : '#1F2937',
                  borderWidth: formData.tournamentType === "crypto" ? '2px' : '1px',
                  boxShadow: formData.tournamentType === "crypto" ? '0 0 20px rgba(227, 179, 65, 0.3)' : 'none'
                }}
                onClick={() => updateField("tournamentType", "crypto")}
              >
                <CardContent className="flex items-center space-x-2.5 p-2.5">
                  <div className="p-1.5 rounded" style={{ backgroundColor: '#E3B34120' }}>
                    <Bitcoin className="w-4 h-4" style={{ color: '#E3B341' }} />
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#F1F5F9' }}>Crypto</p>
                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>24/7 trading</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Duration and Start Time Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Duration */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                <Label className="text-xs font-medium" style={{ color: '#F1F5F9' }}>Duration</Label>
                <InfoTooltip content="How long the tournament will run." />
              </div>
              <Select value={formData.duration} onValueChange={(value) => updateField("duration", value)}>
                <SelectTrigger className="h-9 text-xs font-medium" style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs" style={{ color: '#F1F5F9' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Delay */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Timer className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                <Label className="text-xs font-medium" style={{ color: '#F1F5F9' }}>Start Time</Label>
                <InfoTooltip content="When the tournament will begin." />
              </div>
              <Select value={formData.startDelay} onValueChange={(value) => updateField("startDelay", value)}>
                <SelectTrigger className="h-9 text-xs font-medium" style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                  {START_DELAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs" style={{ color: '#F1F5F9' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.startDelay === 'custom' && (
                <Input
                  type="datetime-local"
                  value={formData.customStartTime}
                  onChange={(e) => updateField("customStartTime", e.target.value)}
                  min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                  className="h-9 text-xs mt-1.5"
                  style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
                />
              )}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Label className="text-xs font-medium" style={{ color: '#F1F5F9' }}>Visibility</Label>
              <InfoTooltip content="Public: Anyone can find and join. Private: Only people with the join code can participate." />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg transition-all" style={{
              backgroundColor: '#111827',
              borderColor: formData.isPublic ? '#10B981' : '#E3B341',
              borderWidth: '2px',
              borderStyle: 'solid'
            }}>
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded" style={{ backgroundColor: formData.isPublic ? '#10B98120' : '#E3B34120' }}>
                  {formData.isPublic ? (
                    <Globe className="w-4 h-4" style={{ color: '#10B981' }} />
                  ) : (
                    <Shield className="w-4 h-4" style={{ color: '#E3B341' }} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs" style={{ color: '#F1F5F9' }}>
                    {formData.isPublic ? "Public" : "Private"}
                  </p>
                  <p className="text-[10px]" style={{ color: '#94A3B8' }}>
                    {formData.isPublic ? "Anyone can join" : "Code required"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateField("isPublic", checked)}
              />
            </div>
          </div>

          {/* Buy-in Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
              <Label htmlFor="buy-in-amount" className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                Buy-in (Optional)
              </Label>
              <InfoTooltip content="Optional entry fee that creates a prize pool. Platform takes a 5% commission." />
            </div>
            <Input
              id="buy-in-amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.buyInAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateField("buyInAmount", Math.min(10000, Math.max(0, val)));
              }}
              placeholder="0.00"
              className={`${errors.buyInAmount ? "border-red-500" : ""} font-bold`}
              style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
            />
            {errors.buyInAmount && (
              <p className="text-xs text-red-500">{errors.buyInAmount}</p>
            )}
            {formData.buyInAmount > 0 && (
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#10B98115', borderColor: '#10B981', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-[10px] font-medium" style={{ color: '#10B981' }}>
                  💰 Prize Pool: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.95)} • Fee: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.05)}
                </p>
              </div>
            )}
          </div>

          {/* Payout Structure */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
              <Label className="text-xs font-medium" style={{ color: '#F1F5F9' }}>Payout Structure</Label>
              <InfoTooltip content="How the prize pool is split among winners. Creator always receives 5%." />
            </div>
            <Select value={formData.payoutStructure} onValueChange={(value) => updateField("payoutStructure", value)}>
              <SelectTrigger className="h-9 text-xs font-medium" style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
                <SelectItem value="winner_take_all" className="text-xs" style={{ color: '#F1F5F9' }}>Winner Take All</SelectItem>
                <SelectItem value="top_3" className="text-xs" style={{ color: '#F1F5F9' }}>Top 3 (60/25/15)</SelectItem>
                <SelectItem value="top_5" className="text-xs" style={{ color: '#F1F5F9' }}>Top 5 (40/25/15/12/8)</SelectItem>
                <SelectItem value="top_half" className="text-xs" style={{ color: '#F1F5F9' }}>Top Half (proportional)</SelectItem>
              </SelectContent>
            </Select>
            {formData.buyInAmount > 0 && (
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3B34115', borderColor: '#E3B341', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-[10px] font-medium" style={{ color: '#E3B341' }}>
                  {formData.payoutStructure === 'winner_take_all' && '🥇 100% to 1st place'}
                  {formData.payoutStructure === 'top_3' && '🥇 60% 1st • 🥈 25% 2nd • 🥉 15% 3rd'}
                  {formData.payoutStructure === 'top_5' && '🥇 40% • 🥈 25% • 🥉 15% • 4th 12% • 5th 8%'}
                  {formData.payoutStructure === 'top_half' && `Top ${Math.ceil(formData.maxPlayers / 2)} players split proportionally`}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2.5 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                className="h-9"
                style={{ borderColor: '#1F2937', color: '#F1F5F9' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!formData.name.trim()) {
                    setErrors({ name: "Tournament name is required" });
                    return;
                  }
                  setStep('confirmation');
                }}
                className="h-9 font-bold"
                style={{ backgroundColor: '#E3B341', color: '#080C14' }}
              >
                Next
              </Button>
            </div>
        </div>
      </div>

      {/* Right Side - Live Preview (2/5 width) */}
      <div className="col-span-2 p-6 overflow-y-auto" style={{ backgroundColor: '#080C14', borderLeft: '2px solid #1F2937' }}>
        <div className="sticky top-0">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: '#E3B341' }} />
            <span className="text-xs font-bold" style={{ color: '#E3B341' }}>LIVE PREVIEW</span>
            <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: '#E3B341' }} />
          </div>

          {/* Animated Tournament Card Preview */}
          <motion.div
            key={`${formData.name}-${formData.tournamentType}-${formData.buyInAmount}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className="relative overflow-hidden"
              style={{
                backgroundColor: '#0F172A',
                borderColor: formData.tournamentType === 'stocks' ? '#3B82F6' : '#E3B341',
                borderWidth: '2px',
                boxShadow: formData.tournamentType === 'stocks'
                  ? '0 0 30px rgba(59, 130, 246, 0.2)'
                  : '0 0 30px rgba(227, 179, 65, 0.2)'
              }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    background: formData.tournamentType === 'stocks'
                      ? 'linear-gradient(135deg, #3B82F6 0%, transparent 100%)'
                      : 'linear-gradient(135deg, #E3B341 0%, transparent 100%)'
                  }}
                />
              </div>

              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="p-1.5 rounded-lg shadow-lg"
                        style={{
                          backgroundColor: formData.tournamentType === 'stocks' ? '#3B82F6' : '#E3B341'
                        }}
                      >
                        {formData.tournamentType === 'stocks' ? (
                          <TrendingUp className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Bitcoin className="w-3.5 h-3.5 text-white" />
                        )}
                      </motion.div>
                      {formData.isPublic ? (
                        <Badge
                          className="text-[10px] font-bold"
                          style={{ backgroundColor: '#10B98120', color: '#10B981', borderColor: '#10B981', borderWidth: '1px' }}
                        >
                          <Globe className="w-2.5 h-2.5 mr-0.5" />
                          PUBLIC
                        </Badge>
                      ) : (
                        <Badge
                          className="text-[10px] font-bold"
                          style={{ backgroundColor: '#E3B34120', color: '#E3B341', borderColor: '#E3B341', borderWidth: '1px' }}
                        >
                          <Shield className="w-2.5 h-2.5 mr-0.5" />
                          PRIVATE
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground mb-1.5 truncate">
                      {formData.name || "Untitled Tournament"}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 relative z-10">
                {/* Prize Pool Display */}
                <motion.div
                  animate={{
                    scale: prizePool > 0 ? [1, 1.02, 1] : 1,
                    boxShadow: prizePool > 0
                      ? [
                          '0 0 20px rgba(227, 179, 65, 0.3)',
                          '0 0 30px rgba(227, 179, 65, 0.5)',
                          '0 0 20px rgba(227, 179, 65, 0.3)'
                        ]
                      : 'none'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative text-center py-3 rounded-xl border-2"
                  style={{
                    backgroundColor: prizePool > 0 ? '#E3B34120' : '#11182710',
                    borderColor: prizePool > 0 ? '#E3B341' : '#1F2937'
                  }}
                >
                  <div className="relative z-10">
                    <motion.div
                      className="text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent mb-1"
                      style={{
                        backgroundImage: prizePool > 0
                          ? 'linear-gradient(90deg, #E3B341 0%, #FFD700 50%, #E3B341 100%)'
                          : 'linear-gradient(90deg, #94A3B8 0%, #F1F5F9 50%, #94A3B8 100%)'
                      }}
                    >
                      {prizePool > 0 ? formatCurrency(prizePool) : formatCurrency(formData.startingBalance)}
                    </motion.div>
                    <p className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
                      {prizePool > 0 ? 'Prize Pool' : 'Starting Balance'}
                    </p>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-lg text-center"
                    style={{ backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Users className="w-3 h-3" style={{ color: '#3B82F6' }} />
                      <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                        {formData.maxPlayers}
                      </span>
                    </div>
                    <p className="text-[9px]" style={{ color: '#94A3B8' }}>Max Players</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-lg text-center"
                    style={{ backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3" style={{ color: '#10B981' }} />
                      <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                        {formData.duration}
                      </span>
                    </div>
                    <p className="text-[9px]" style={{ color: '#94A3B8' }}>Duration</p>
                  </motion.div>
                </div>

                {/* Start Time Indicator */}
                <div
                  className="p-2 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: '#111827', borderColor: '#1F2937', borderWidth: '1px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3 h-3" style={{ color: '#E3B341' }} />
                    <span className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                      {formData.startDelay === 'immediately' ? 'Starts Immediately' : `Starts in ${formData.startDelay}`}
                    </span>
                  </div>
                </div>

                {/* Buy-in Badge if applicable */}
                {formData.buyInAmount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: '#10B98120', borderColor: '#10B981', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: '#10B981' }}>
                        Buy-in: {formatCurrency(formData.buyInAmount)}
                      </span>
                      <Crown className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <div className="mt-4 space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#0F172A20', borderColor: '#E3B341', borderWidth: '1px' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                <span className="text-xs font-bold" style={{ color: '#E3B341' }}>
                  Tournament Type
                </span>
              </div>
              <p className="text-[11px]" style={{ color: '#F1F5F9' }}>
                {formData.tournamentType === 'stocks'
                  ? 'Trade stocks during market hours'
                  : 'Trade cryptocurrencies 24/7'}
              </p>
            </motion.div>

            {!formData.isPublic && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#0F172A20', borderColor: '#E3B341', borderWidth: '1px' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                  <span className="text-xs font-bold" style={{ color: '#E3B341' }}>
                    Private Tournament
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: '#F1F5F9' }}>
                  You'll receive a code to share with participants
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
        ) : (
        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3B341' }}>
                <Trophy className="w-5 h-5" style={{ color: '#080C14' }} />
              </div>
              <div>
                <span className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Confirm Tournament</span>
                <p className="text-xs" style={{ color: '#94A3B8' }}>Review terms before creating</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Tournament Summary */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#080C14', border: '1px solid #1F2937' }}>
            <h4 className="text-xs font-bold mb-2" style={{ color: '#E3B341' }}>Tournament Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span style={{ color: '#94A3B8' }}>Name: </span>
                <span style={{ color: '#F1F5F9' }}>{formData.name || 'Untitled'}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Type: </span>
                <span style={{ color: '#F1F5F9' }}>{formData.tournamentType === 'stocks' ? 'Stocks' : 'Crypto'}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Players: </span>
                <span style={{ color: '#F1F5F9' }}>{formData.maxPlayers}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Duration: </span>
                <span style={{ color: '#F1F5F9' }}>{formData.duration}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Balance: </span>
                <span style={{ color: '#F1F5F9' }}>{formatCurrency(formData.startingBalance)}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Buy-in: </span>
                <span style={{ color: '#F1F5F9' }}>{formData.buyInAmount > 0 ? formatCurrency(formData.buyInAmount) : 'Free'}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#080C14', border: '1px solid #1F2937' }}>
            <h4 className="text-xs font-bold mb-2" style={{ color: '#F1F5F9' }}>Terms & Conditions</h4>
            <ul className="text-[10px] space-y-1" style={{ color: '#94A3B8' }}>
              <li>• This is a virtual paper trading tournament — no real money is at risk during trading.</li>
              <li>• Buy-in amounts are deducted from your site cash balance upon joining.</li>
              <li>• Tournament results are final. Winners receive payouts to their site cash.</li>
              <li>• Manipulation, exploits, or unfair practices will result in disqualification.</li>
            </ul>
          </div>

          {/* Owner Powers */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#080C14', border: '1px solid #1F2937' }}>
            <h4 className="text-xs font-bold mb-2" style={{ color: '#F1F5F9' }}>Your Powers as Tournament Owner</h4>
            <ul className="text-[10px] space-y-1" style={{ color: '#94A3B8' }}>
              {formData.isPublic ? (
                <>
                  <li>• You can cancel the tournament before it starts.</li>
                  <li>• You earn a 5% creator reward from the prize pool.</li>
                  <li>• You cannot remove participants from public tournaments.</li>
                </>
              ) : (
                <>
                  <li>• You can cancel the tournament at any time.</li>
                  <li>• You can start the tournament early once enough players join.</li>
                  <li>• You control who gets the join code to enter.</li>
                  <li>• You earn a 5% creator reward from the prize pool.</li>
                </>
              )}
              {formData.buyInAmount === 0 && (
                <li>• This is a free tournament — no buy-in required from participants.</li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-1">
            <Button
              variant="outline"
              onClick={() => setStep('form')}
              className="h-9"
              style={{ borderColor: '#1F2937', color: '#F1F5F9' }}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTournamentMutation.isPending}
              className="h-9 font-bold"
              style={{ backgroundColor: '#10B981', color: '#FFFFFF', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
            >
              {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Tournament Success Dialog */}
    {createdTournament && (
      <TournamentSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setCreatedTournament(null);
        }}
        tournament={createdTournament}
        onNavigate={() => {
          // Navigation handled by the dialog itself
        }}
      />
    )}
    </>
  );
}
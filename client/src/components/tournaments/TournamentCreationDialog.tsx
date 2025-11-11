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
  { value: "immediately", label: "Start Immediately" },
  { value: "1 minute", label: "1 Minute" },
  { value: "5 minutes", label: "5 Minutes" },
  { value: "10 minutes", label: "10 Minutes" },
  { value: "30 minutes", label: "30 Minutes" },
  { value: "1 hour", label: "1 Hour" },
  { value: "2 hours", label: "2 Hours" },
  { value: "6 hours", label: "6 Hours" },
  { value: "12 hours", label: "12 Hours" },
  { value: "1 day", label: "1 Day" },
  { value: "3 days", label: "3 Days" },
  { value: "1 week", label: "1 Week" },
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

  // Tournament form state - exactly 7 options as specified
  const [formData, setFormData] = useState({
    name: "", // 1. Tournament title
    maxPlayers: 10, // 2. Max amount of players
    tournamentType: "stocks", // 3. Stock or Crypto tournament
    startingBalance: 10000, // 4. Starting Fake Cash amount
    duration: "1 week", // 5. Duration of the tournament
    startDelay: "immediately", // 6. In how many minutes, hours, or days the tournament will start
    isPublic: true, // 7. Private or Public
    buyInAmount: 0, // Buy-in amount
    agreeToTerms: false // Terms of service agreement
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/tournaments", {
        name: data.name,
        maxPlayers: data.maxPlayers,
        tournamentType: data.tournamentType,
        startingBalance: data.startingBalance,
        duration: data.duration,
        scheduledStartTime: new Date(Date.now() + (
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
          7 * 24 * 60 * 60 * 1000 // 1 week default
        )).toISOString(),
        buyInAmount: data.buyInAmount,
        tradingRestriction: 'none',
        isPublic: data.isPublic
      });
      return res.json();
    },
    onSuccess: () => {
      onClose();
      setFormData({
        name: "",
        maxPlayers: 10,
        tournamentType: "stocks",
        startingBalance: 10000,
        duration: "1 week",
        startDelay: "immediately",
        isPublic: true,
        buyInAmount: 0,
        agreeToTerms: false
      });
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      toast({
        title: "Success",
        description: "Tournament created successfully!",
      });
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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms of service";
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

  // Calculate prize pool for preview
  const prizePool = formData.buyInAmount > 0
    ? formData.buyInAmount * formData.maxPlayers * 0.95
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0" style={{ backgroundColor: '#0A1A2F', borderColor: '#E3B341', borderWidth: '2px' }}>
        <div className="grid grid-cols-5 gap-0 h-full">
          {/* Left Side - Form (3/5 width) */}
          <div className="col-span-3 overflow-y-auto p-6" style={{ backgroundColor: '#142538' }}>
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
                    <Trophy className="w-5 h-5 relative z-10" style={{ color: '#06121F' }} />
                  </motion.div>
                  <div>
                    <span className="text-lg font-bold" style={{ color: '#C9D1E2' }}>Create Tournament</span>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Configure your competition</p>
                  </div>
                </DialogTitle>
                <Badge className="font-bold" style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}>
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
              <Label htmlFor="tournament-name" className="text-xs font-medium" style={{ color: '#C9D1E2' }}>
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
              style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Tournament Settings Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Max Players */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                <Label htmlFor="max-players" className="text-xs font-medium" style={{ color: '#C9D1E2' }}>
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
                onChange={(e) => updateField("maxPlayers", parseInt(e.target.value) || 2)}
                className={`${errors.maxPlayers ? "border-red-500" : ""} text-center font-bold`}
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              {errors.maxPlayers && <p className="text-xs text-red-500">{errors.maxPlayers}</p>}
            </div>

            {/* Starting Cash */}
            <div className="space-y-1.5 col-span-2">
              <div className="flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5" style={{ color: '#28C76F' }} />
                <Label htmlFor="starting-balance" className="text-xs font-medium" style={{ color: '#C9D1E2' }}>
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
                onChange={(e) => updateField("startingBalance", parseInt(e.target.value) || 10000)}
                className={`${errors.startingBalance ? "border-red-500" : ""} font-bold`}
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              {errors.startingBalance && <p className="text-xs text-red-500">{errors.startingBalance}</p>}
            </div>
          </div>

          {/* Tournament Type */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Label className="text-xs font-medium" style={{ color: '#C9D1E2' }}>Tournament Type</Label>
              <InfoTooltip content="Stocks: Trade traditional stock markets during market hours. Crypto: Trade cryptocurrencies 24/7." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
                style={{
                  backgroundColor: formData.tournamentType === "stocks" ? '#1E2D3F' : '#142538',
                  borderColor: formData.tournamentType === "stocks" ? '#3B82F6' : '#2B3A4C',
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
                    <p className="font-bold text-xs" style={{ color: '#C9D1E2' }}>Stocks</p>
                    <p className="text-[10px]" style={{ color: '#8A93A6' }}>Market hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
                style={{
                  backgroundColor: formData.tournamentType === "crypto" ? '#1E2D3F' : '#142538',
                  borderColor: formData.tournamentType === "crypto" ? '#E3B341' : '#2B3A4C',
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
                    <p className="font-bold text-xs" style={{ color: '#C9D1E2' }}>Crypto</p>
                    <p className="text-[10px]" style={{ color: '#8A93A6' }}>24/7 trading</p>
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
                <Label className="text-xs font-medium" style={{ color: '#C9D1E2' }}>Duration</Label>
                <InfoTooltip content="How long the tournament will run." />
              </div>
              <Select value={formData.duration} onValueChange={(value) => updateField("duration", value)}>
                <SelectTrigger className="h-9 text-xs font-medium" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs" style={{ color: '#C9D1E2' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Delay */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5">
                <Timer className="w-3.5 h-3.5" style={{ color: '#28C76F' }} />
                <Label className="text-xs font-medium" style={{ color: '#C9D1E2' }}>Start Time</Label>
                <InfoTooltip content="When the tournament will begin." />
              </div>
              <Select value={formData.startDelay} onValueChange={(value) => updateField("startDelay", value)}>
                <SelectTrigger className="h-9 text-xs font-medium" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                  {START_DELAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs" style={{ color: '#C9D1E2' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Label className="text-xs font-medium" style={{ color: '#C9D1E2' }}>Visibility</Label>
              <InfoTooltip content="Public: Anyone can find and join. Private: Only people with the join code can participate." />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg transition-all" style={{
              backgroundColor: '#1E2D3F',
              borderColor: formData.isPublic ? '#28C76F' : '#E3B341',
              borderWidth: '2px',
              borderStyle: 'solid'
            }}>
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded" style={{ backgroundColor: formData.isPublic ? '#28C76F20' : '#E3B34120' }}>
                  {formData.isPublic ? (
                    <Globe className="w-4 h-4" style={{ color: '#28C76F' }} />
                  ) : (
                    <Shield className="w-4 h-4" style={{ color: '#E3B341' }} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs" style={{ color: '#C9D1E2' }}>
                    {formData.isPublic ? "Public" : "Private"}
                  </p>
                  <p className="text-[10px]" style={{ color: '#8A93A6' }}>
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
              <DollarSign className="w-3.5 h-3.5" style={{ color: '#28C76F' }} />
              <Label htmlFor="buy-in-amount" className="text-xs font-medium" style={{ color: '#C9D1E2' }}>
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
              onChange={(e) => updateField("buyInAmount", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={`${errors.buyInAmount ? "border-red-500" : ""} font-bold`}
              style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
            />
            {errors.buyInAmount && (
              <p className="text-xs text-red-500">{errors.buyInAmount}</p>
            )}
            {formData.buyInAmount > 0 && (
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#28C76F15', borderColor: '#28C76F', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-[10px] font-medium" style={{ color: '#28C76F' }}>
                  💰 Prize Pool: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.95)} • Fee: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.05)}
                </p>
              </div>
            )}
          </div>

          {/* Terms of Service */}
          <div className="flex items-start space-x-2.5 p-2.5 rounded-lg" style={{
            backgroundColor: '#1E2D3F',
            borderColor: formData.agreeToTerms ? '#28C76F' : '#2B3A4C',
            borderWidth: '2px',
            borderStyle: 'solid'
          }}>
            <Checkbox
              id="agree-terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => updateField("agreeToTerms", checked)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label
                htmlFor="agree-terms"
                className="text-[11px] font-medium cursor-pointer"
                style={{ color: '#C9D1E2' }}
              >
                I agree to the Terms of Service
              </Label>
              <p className="text-[10px] mt-0.5" style={{ color: '#8A93A6' }}>
                Virtual trading only - no real money risk
              </p>
            </div>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms}</p>}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2.5 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createTournamentMutation.isPending}
              className="h-9"
              style={{ borderColor: '#2B3A4C', color: '#C9D1E2' }}
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSubmit}
                disabled={createTournamentMutation.isPending || !formData.agreeToTerms}
                className="h-9 font-bold disabled:opacity-50 transition-all"
                style={{ backgroundColor: '#E3B341', color: '#06121F', boxShadow: '0 0 20px rgba(227, 179, 65, 0.3)' }}
              >
                {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Live Preview (2/5 width) */}
      <div className="col-span-2 p-6 overflow-y-auto" style={{ backgroundColor: '#0A1A2F', borderLeft: '2px solid #2B3A4C' }}>
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
                backgroundColor: '#142538',
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
                          style={{ backgroundColor: '#28C76F20', color: '#28C76F', borderColor: '#28C76F', borderWidth: '1px' }}
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
                    backgroundColor: prizePool > 0 ? '#E3B34120' : '#1E2D3F10',
                    borderColor: prizePool > 0 ? '#E3B341' : '#2B3A4C'
                  }}
                >
                  <div className="relative z-10">
                    <motion.div
                      className="text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent mb-1"
                      style={{
                        backgroundImage: prizePool > 0
                          ? 'linear-gradient(90deg, #E3B341 0%, #FFD700 50%, #E3B341 100%)'
                          : 'linear-gradient(90deg, #8A93A6 0%, #C9D1E2 50%, #8A93A6 100%)'
                      }}
                    >
                      {prizePool > 0 ? formatCurrency(prizePool) : formatCurrency(formData.startingBalance)}
                    </motion.div>
                    <p className="text-[10px] font-medium" style={{ color: '#8A93A6' }}>
                      {prizePool > 0 ? 'Prize Pool' : 'Starting Balance'}
                    </p>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-lg text-center"
                    style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Users className="w-3 h-3" style={{ color: '#3B82F6' }} />
                      <span className="text-sm font-bold" style={{ color: '#C9D1E2' }}>
                        {formData.maxPlayers}
                      </span>
                    </div>
                    <p className="text-[9px]" style={{ color: '#8A93A6' }}>Max Players</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-2 rounded-lg text-center"
                    style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Clock className="w-3 h-3" style={{ color: '#28C76F' }} />
                      <span className="text-sm font-bold" style={{ color: '#C9D1E2' }}>
                        {formData.duration}
                      </span>
                    </div>
                    <p className="text-[9px]" style={{ color: '#8A93A6' }}>Duration</p>
                  </motion.div>
                </div>

                {/* Start Time Indicator */}
                <div
                  className="p-2 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3 h-3" style={{ color: '#E3B341' }} />
                    <span className="text-xs font-medium" style={{ color: '#C9D1E2' }}>
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
                    style={{ backgroundColor: '#28C76F20', borderColor: '#28C76F', borderWidth: '1px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: '#28C76F' }}>
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
              style={{ backgroundColor: '#14253820', borderColor: '#E3B341', borderWidth: '1px' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                <span className="text-xs font-bold" style={{ color: '#E3B341' }}>
                  Tournament Type
                </span>
              </div>
              <p className="text-[11px]" style={{ color: '#C9D1E2' }}>
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
                style={{ backgroundColor: '#14253820', borderColor: '#E3B341', borderWidth: '1px' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: '#E3B341' }} />
                  <span className="text-xs font-bold" style={{ color: '#E3B341' }}>
                    Private Tournament
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: '#C9D1E2' }}>
                  You'll receive a code to share with participants
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
      </DialogContent>
    </Dialog>
  );
}
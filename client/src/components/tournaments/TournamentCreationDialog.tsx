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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3B341' }}>
                <Trophy className="w-5 h-5" style={{ color: '#06121F' }} />
              </div>
              <span style={{ color: '#C9D1E2' }}>Create New Tournament</span>
            </DialogTitle>
            <Badge style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}>Free to Create</Badge>
          </div>
          <p className="text-sm mt-2" style={{ color: '#8A93A6' }}>
            Set up your tournament and compete for glory
          </p>
        </DialogHeader>

        <div className="space-y-4">


          {/* Tournament Info Grid - Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Tournament Title */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="tournament-name" className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                  Tournament Title
                </Label>
                <InfoTooltip content="Choose a unique and descriptive name for your tournament that participants will see when browsing." />
              </div>
              <Input
                id="tournament-name"
                placeholder="Enter tournament name..."
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* 2. Max Players */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" style={{ color: '#E3B341' }} />
                <Label htmlFor="max-players" className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                  Max Players
                </Label>
                <InfoTooltip content="Set the maximum number of participants (2-50). Tournament starts when this limit is reached or manually started." />
              </div>
              <Input
                id="max-players"
                type="number"
                min="2"
                max="50"
                value={formData.maxPlayers}
                onChange={(e) => updateField("maxPlayers", parseInt(e.target.value) || 2)}
                className={errors.maxPlayers ? "border-red-500" : ""}
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              {errors.maxPlayers && <p className="text-sm text-red-500">{errors.maxPlayers}</p>}
            </div>

            {/* 4. Starting Cash */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" style={{ color: '#28C76F' }} />
                <Label htmlFor="starting-balance" className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                  Starting Cash
                </Label>
                <InfoTooltip content="Virtual currency amount each participant starts with. This is paper money for practice trading - no real money involved." />
              </div>
              <Input
                id="starting-balance"
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={formData.startingBalance}
                onChange={(e) => updateField("startingBalance", parseInt(e.target.value) || 10000)}
                className={errors.startingBalance ? "border-red-500" : ""}
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              {errors.startingBalance && <p className="text-sm text-red-500">{errors.startingBalance}</p>}
            </div>
          </div>

          {/* 3. Tournament Type */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Tournament Type</Label>
              <InfoTooltip content="Stocks: Trade traditional stock markets during market hours. Crypto: Trade cryptocurrencies 24/7." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all`}
                style={{
                  backgroundColor: formData.tournamentType === "stocks" ? '#1E2D3F' : '#142538',
                  borderColor: formData.tournamentType === "stocks" ? '#3B82F6' : '#2B3A4C',
                  borderWidth: formData.tournamentType === "stocks" ? '2px' : '1px'
                }}
                onClick={() => updateField("tournamentType", "stocks")}
              >
                <CardContent className="flex items-center space-x-3 p-3">
                  <TrendingUp className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#C9D1E2' }}>Stocks</p>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>Trade markets</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all`}
                style={{
                  backgroundColor: formData.tournamentType === "crypto" ? '#1E2D3F' : '#142538',
                  borderColor: formData.tournamentType === "crypto" ? '#E3B341' : '#2B3A4C',
                  borderWidth: formData.tournamentType === "crypto" ? '2px' : '1px'
                }}
                onClick={() => updateField("tournamentType", "crypto")}
              >
                <CardContent className="flex items-center space-x-3 p-3">
                  <Bitcoin className="w-5 h-5" style={{ color: '#E3B341' }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#C9D1E2' }}>Crypto</p>
                    <p className="text-xs" style={{ color: '#8A93A6' }}>24/7 trading</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 5 & 6. Duration and Start Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* 5. Duration */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" style={{ color: '#E3B341' }} />
                <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Duration</Label>
                <InfoTooltip content="How long the tournament will run. Participants can trade within this timeframe to compete." />
              </div>
              <Select value={formData.duration} onValueChange={(value) => updateField("duration", value)}>
                <SelectTrigger style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} style={{ color: '#C9D1E2' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 6. Start Delay */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" style={{ color: '#28C76F' }} />
                <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Start Time</Label>
                <InfoTooltip content="When the tournament will begin. You can start immediately or schedule for later to allow time for participant registration." />
              </div>
              <Select value={formData.startDelay} onValueChange={(value) => updateField("startDelay", value)}>
                <SelectTrigger style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                  {START_DELAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} style={{ color: '#C9D1E2' }}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 7. Privacy Setting */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium" style={{ color: '#C9D1E2' }}>Tournament Visibility</Label>
              <InfoTooltip content="Public: Anyone can find and join. Private: Only people with the join code can participate. Private tournaments give you more control." />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <Globe className="w-5 h-5" style={{ color: '#28C76F' }} />
                ) : (
                  <Shield className="w-5 h-5" style={{ color: '#E3B341' }} />
                )}
                <div>
                  <p className="font-medium text-sm" style={{ color: '#C9D1E2' }}>
                    {formData.isPublic ? "Public Tournament" : "Private Tournament"}
                  </p>
                  <p className="text-xs" style={{ color: '#8A93A6' }}>
                    {formData.isPublic
                      ? "Anyone can join"
                      : "Code required to join"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateField("isPublic", checked)}
              />
            </div>
          </div>

          {/* Buy-in Amount Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" style={{ color: '#28C76F' }} />
              <Label htmlFor="buy-in-amount" className="text-sm font-medium" style={{ color: '#C9D1E2' }}>
                Buy-in (Optional)
              </Label>
              <InfoTooltip content="Optional entry fee that creates a prize pool. Participants pay this amount to join, and the platform takes a 5% commission." />
            </div>
            <Input
              id="buy-in-amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.buyInAmount}
              onChange={(e) => updateField("buyInAmount", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.buyInAmount ? "border-red-500" : ""}
              style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
            />
            {errors.buyInAmount && (
              <p className="text-sm text-red-500">{errors.buyInAmount}</p>
            )}
            {formData.buyInAmount > 0 && (
              <div className="p-2 rounded" style={{ backgroundColor: '#28C76F20', borderColor: '#28C76F', borderWidth: '1px', borderStyle: 'solid' }}>
                <p className="text-xs font-medium" style={{ color: '#28C76F' }}>
                  Prize Pool: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.95)} • Platform Fee: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.05)}
                </p>
              </div>
            )}
          </div>

          {/* Terms of Service Agreement */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', borderWidth: '1px', borderStyle: 'solid' }}>
              <Checkbox
                id="agree-terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateField("agreeToTerms", checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="agree-terms"
                  className="text-xs font-medium cursor-pointer"
                  style={{ color: '#C9D1E2' }}
                >
                  I agree to the Terms of Service
                </Label>
                <p className="text-xs mt-1" style={{ color: '#8A93A6' }}>
                  Virtual trading only - no real money risk
                </p>
              </div>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createTournamentMutation.isPending}
              style={{ borderColor: '#2B3A4C', color: '#C9D1E2' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTournamentMutation.isPending || !formData.agreeToTerms}
              style={{ backgroundColor: '#E3B341', color: '#06121F' }}
              className="font-bold disabled:opacity-50"
            >
              {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
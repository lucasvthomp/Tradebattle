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
        newErrors.buyInAmount = `Insufficient funds. You need $${formData.buyInAmount.toFixed(2)} but only have $${userBalance.toFixed(2)} in your account.`;
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Create New Tournament</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">


          {/* 1. Tournament Title */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="tournament-name" className="text-sm font-medium">
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
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* 2. Max Players */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="max-players" className="text-sm font-medium">
                Maximum Players
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
            />
            {errors.maxPlayers && <p className="text-sm text-red-500">{errors.maxPlayers}</p>}
          </div>

          {/* 3. Tournament Type */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Tournament Type</Label>
              <InfoTooltip content="Stocks: Trade traditional stock markets during market hours. Crypto: Trade cryptocurrencies 24/7." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  formData.tournamentType === "stocks" 
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => updateField("tournamentType", "stocks")}
              >
                <CardContent className="flex items-center space-x-3 p-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Stocks</p>
                    <p className="text-sm text-muted-foreground">Trade stock markets</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  formData.tournamentType === "crypto" 
                    ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => updateField("tournamentType", "crypto")}
              >
                <CardContent className="flex items-center space-x-3 p-4">
                  <Bitcoin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Crypto</p>
                    <p className="text-sm text-muted-foreground">Trade cryptocurrencies</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 4. Starting Cash */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="starting-balance" className="text-sm font-medium">
                Starting Fake Money
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
            />
            <p className="text-sm text-muted-foreground">
              Amount: {formatCurrency(formData.startingBalance)}
            </p>
            {errors.startingBalance && <p className="text-sm text-red-500">{errors.startingBalance}</p>}
          </div>

          {/* 5. Duration */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Tournament Duration</Label>
              <InfoTooltip content="How long the tournament will run. Participants can trade within this timeframe to compete." />
            </div>
            <Select value={formData.duration} onValueChange={(value) => updateField("duration", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6. Start Delay */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Tournament Start Time</Label>
              <InfoTooltip content="When the tournament will begin. You can start immediately or schedule for later to allow time for participant registration." />
            </div>
            <Select value={formData.startDelay} onValueChange={(value) => updateField("startDelay", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {START_DELAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 7. Privacy Setting */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Tournament Visibility</Label>
              <InfoTooltip content="Public: Anyone can find and join. Private: Only people with the join code can participate. Private tournaments give you more control." />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <Shield className="w-5 h-5 text-blue-600" />
                )}
                <div>
                  <p className="font-medium">
                    {formData.isPublic ? "Public Tournament" : "Private Tournament"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.isPublic 
                      ? "Anyone can join this tournament" 
                      : "Only users with invite code can join"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateField("isPublic", checked)}
              />
            </div>

            {/* Creator Powers Notice */}
            {!formData.isPublic && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Private Tournament Creator Powers:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Kick participants before tournament starts</li>
                  <li>• Start tournament early</li>
                  <li>• Cancel tournament (only before it starts)</li>
                </ul>
              </div>
            )}
          </div>

          {/* Buy-in Amount Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="buy-in-amount" className="text-sm font-medium">
                Buy-in Amount (Optional)
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
            />
            {errors.buyInAmount && (
              <p className="text-sm text-red-500">{errors.buyInAmount}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Entry Fee: {formatCurrency(formData.buyInAmount)} {formData.buyInAmount > 0 && `(Prize Pool: ${formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.95)})`}
            </p>

            {/* Buy-in Incentive Box */}
            {formData.buyInAmount > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Buy-in Tournament Benefits
                  </p>
                </div>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Creates competitive prize pool for winners</li>
                  <li>• Attracts more serious traders</li>
                  <li>• Platform takes only 5% commission</li>
                  <li>• Winner takes 95% of total prize pool</li>
                </ul>
                <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-800 dark:text-green-200">
                  <strong>Prize Breakdown:</strong> Total pot: {formatCurrency(formData.buyInAmount * formData.maxPlayers)} → Winner gets: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.95)} (Platform fee: {formatCurrency(formData.buyInAmount * formData.maxPlayers * 0.05)})
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Terms of Service Agreement */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="agree-terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateField("agreeToTerms", checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="agree-terms" 
                  className="text-sm font-medium cursor-pointer"
                >
                  I agree to the Terms of Service
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  By creating this tournament, you agree to our platform rules, fair play policies, and understand that this is virtual trading with no real money risk.
                </p>
              </div>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createTournamentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTournamentMutation.isPending || !formData.agreeToTerms}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
  Crown
} from "lucide-react";
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
  { value: "immediate", label: "Start Immediately" },
  { value: "30 minutes", label: "30 Minutes" },
  { value: "1 hour", label: "1 Hour" },
  { value: "2 hours", label: "2 Hours" },
  { value: "6 hours", label: "6 Hours" },
  { value: "12 hours", label: "12 Hours" },
  { value: "1 day", label: "1 Day" },
  { value: "3 days", label: "3 Days" },
  { value: "1 week", label: "1 Week" },
];

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
    startDelay: "immediate", // 6. In how many minutes, hours, or days the tournament will start (max one week)
    isPublic: true // 7. Private or Public
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/tournaments", data);
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
        startDelay: "immediate",
        isPublic: true
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
          {/* Premium Notice */}
          {user?.subscriptionTier === 'free' && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                  <Crown className="w-5 h-5" />
                  <span>Premium Feature</span>
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Tournament creation requires a premium subscription. Joining tournaments is always free!
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* 1. Tournament Title */}
          <div className="space-y-2">
            <Label htmlFor="tournament-name" className="text-sm font-medium">
              Tournament Title
            </Label>
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
            <Label htmlFor="max-players" className="text-sm font-medium">
              Maximum Players
            </Label>
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
            <Label className="text-sm font-medium">Tournament Type</Label>
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
            <Label htmlFor="starting-balance" className="text-sm font-medium">
              Starting Fake Cash Amount
            </Label>
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
            <Label className="text-sm font-medium">Tournament Duration</Label>
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
            <Label className="text-sm font-medium">Tournament Start Time</Label>
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
            <Label className="text-sm font-medium">Tournament Visibility</Label>
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

          <Separator />

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
              disabled={createTournamentMutation.isPending || user?.subscriptionTier === 'free'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
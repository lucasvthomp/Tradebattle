import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Sparkles, DollarSign, Trophy, Star } from "lucide-react";

interface CodeRedemptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodeRedemptionDialog({ open, onOpenChange }: CodeRedemptionDialogProps) {
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  // Code redemption mutation
  const redeemCodeMutation = useMutation({
    mutationFn: async (redeemCode: string) => {
      const response = await apiRequest("POST", "/api/codes/redeem", { code: redeemCode });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to redeem code");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Code Redeemed Successfully! 🎉",
        description: data.message || `You've received ${data.reward}!`,
      });
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Code Redemption Failed",
        description: error.message || "Invalid or expired code. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  const handleRedeemCode = () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid redemption code.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedCode.length < 4) {
      toast({
        title: "Code Too Short",
        description: "Redemption codes must be at least 4 characters long.",
        variant: "destructive",
      });
      return;
    }
    redeemCodeMutation.mutate(trimmedCode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRedeemCode();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Redeem Code
          </DialogTitle>
        </DialogHeader>

        {/* Header Description */}
        <Card className="border-dashed border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Got a Code?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your redemption code below to unlock exclusive rewards!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redemption-code" className="text-base font-medium">
              Redemption Code
            </Label>
            <Input
              id="redemption-code"
              type="text"
              placeholder="Enter your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground text-center">
              Codes are case-insensitive and will be automatically converted to uppercase
            </p>
          </div>

          <Button 
            onClick={handleRedeemCode}
            disabled={redeemCodeMutation.isPending || !code.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
            size="lg"
          >
            {redeemCodeMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Redeeming Code...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Redeem Code
              </>
            )}
          </Button>
        </div>

        {/* Possible Rewards Info */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Possible Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>Balance Boosts</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Tournament Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500" />
                <span>Premium Features</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Exclusive Items</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
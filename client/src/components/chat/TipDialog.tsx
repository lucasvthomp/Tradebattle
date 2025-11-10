import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, User } from "lucide-react";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientUserId: number;
  recipientUsername: string;
}

export function TipDialog({ open, onOpenChange, recipientUserId, recipientUsername }: TipDialogProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const tipMutation = useMutation({
    mutationFn: async (tipAmount: number) => {
      const response = await apiRequest("POST", "/api/users/tip", {
        recipientUserId,
        amount: tipAmount
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tip sent successfully!",
        description: `You sent ${formatCurrency(parseFloat(amount))} to ${recipientUsername}`,
      });
      setAmount("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send tip",
        description: error.message || "Unable to send tip",
        variant: "destructive",
      });
    },
  });

  const handleSendTip = () => {
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(user?.siteCash?.toString() || "0");
    if (tipAmount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: `You only have ${formatCurrency(userBalance)} available`,
        variant: "destructive",
      });
      return;
    }

    tipMutation.mutate(tipAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Send Tip to {recipientUsername}</span>
          </DialogTitle>
          <DialogDescription>
            Send site balance as a tip to support this user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{recipientUsername}</p>
              <p className="text-xs text-muted-foreground">User ID: {recipientUserId}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="tip-amount">Tip Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="tip-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your balance: {formatCurrency(parseFloat(user?.siteCash?.toString() || "0"))}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 25].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                className="text-xs"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setAmount("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTip}
              disabled={!amount || parseFloat(amount) <= 0 || tipMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {tipMutation.isPending ? "Sending..." : "Send Tip"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

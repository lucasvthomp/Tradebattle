import { useLocation } from "wouter";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  Bitcoin,
  ArrowRight,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function BalanceDialog({ open, onOpenChange, currentBalance }: BalanceDialogProps) {
  const { formatCurrency } = useUserPreferences();
  const [, navigate] = useLocation();

  const handleDeposit = () => {
    onOpenChange(false);
    navigate("/deposit");
  };

  const handleWithdraw = () => {
    onOpenChange(false);
    navigate("/withdraw");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Manage arena cash
          </DialogTitle>
        </DialogHeader>

        {/* Current Balance Display */}
        <Card className="p-6 border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">Buying power</p>
          <p className="text-4xl font-bold text-primary">
            {formatCurrency(currentBalance)}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDeposit}
            className="w-full h-14 text-base"
            size="lg"
          >
            <Bitcoin className="w-5 h-5 mr-2" />
            Add arena cash
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <Button
            onClick={handleWithdraw}
            variant="outline"
            className="w-full h-14 text-base"
            size="lg"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Cash out
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Cash adds:</strong> Crypto deposits with QR codes<br />
            <strong>Cash outs:</strong> Subject to admin approval (28% fee)
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}

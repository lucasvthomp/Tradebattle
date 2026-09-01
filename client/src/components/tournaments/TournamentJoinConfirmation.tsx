import { TradebattleIcon } from "@/components/tradebattle-icons";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, DollarSign, Trophy, Clock, Users, ShieldAlert } from "lucide-react";

interface TournamentJoinConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tournament: {
    name: string;
    buyIn: number;
    prizePool: number;
    startingBalance: number;
    startsAt?: string;
    endsAt: string;
  };
  isLoading?: boolean;
}

export function TournamentJoinConfirmation({
  isOpen,
  onClose,
  onConfirm,
  tournament,
  isLoading = false
}: TournamentJoinConfirmationProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(false);

  const canConfirm = acceptedTerms && acceptedGuidelines && !isLoading;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ backgroundColor: '#0B1B2A', borderColor: '#67E7BF' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl" style={{ color: '#67E7BF' }}>
            <ShieldAlert className="w-8 h-8" />
            Confirm arena entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tournament Details */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#C9D1E2' }}>
              {tournament.name}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" style={{ color: '#FF4F58' }} />
                  <span className="text-sm" style={{ color: '#8A93A6' }}>Entry fee</span>
                </div>
                <p className="text-xl font-bold" style={{ color: '#FF4F58' }}>
                  ${tournament.buyIn.toFixed(2)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TradebattleIcon name="rankings" className="w-4 h-4" style={{ color: '#67E7BF' }} />
                  <span className="text-sm" style={{ color: '#8A93A6' }}>Prize pool</span>
                </div>
                <p className="text-xl font-bold" style={{ color: '#67E7BF' }}>
                  ${tournament.prizePool.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" style={{ color: '#67E7BF' }} />
                  <span className="text-sm" style={{ color: '#8A93A6' }}>Starting capital</span>
                </div>
                <p className="text-xl font-bold" style={{ color: '#67E7BF' }}>
                  ${tournament.startingBalance.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" style={{ color: '#6366F1' }} />
                  <span className="text-sm" style={{ color: '#8A93A6' }}>Ends</span>
                </div>
                <p className="text-sm font-bold" style={{ color: '#6366F1' }}>
                  {formatDate(tournament.endsAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 p-4 rounded-xl"
            style={{ backgroundColor: 'rgba(255, 79, 88, 0.1)', border: '1px solid rgba(255, 79, 88, 0.3)' }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF4F58' }} />
            <div>
              <p className="font-semibold mb-1" style={{ color: '#FF4F58' }}>
                Entry fee will be deducted
              </p>
              <p className="text-sm" style={{ color: '#C9D1E2' }}>
                ${tournament.buyIn.toFixed(2)} will be immediately deducted from your arena cash when you confirm. This fee is non-refundable.
              </p>
            </div>
          </motion.div>

          {/* Agreement Checkboxes */}
          <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: 'transparent' }}>
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
                style={{ color: '#C9D1E2' }}
              >
                I agree to the{' '}
                <a href="/terms" target="_blank" className="underline font-semibold" style={{ color: '#67E7BF' }}>
                  Arena Terms
                </a>{' '}
                and understand that the entry fee is non-refundable.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="guidelines"
                checked={acceptedGuidelines}
                onCheckedChange={(checked) => setAcceptedGuidelines(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="guidelines"
                className="text-sm leading-relaxed cursor-pointer"
                style={{ color: '#C9D1E2' }}
              >
                I have read and agree to the{' '}
                <span className="font-semibold" style={{ color: '#67E7BF' }}>
                  Arena playbook
                </span>
                , including fair play rules and trading restrictions.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12"
              disabled={isLoading}
              style={{ borderColor: '#0E2040', color: '#8A93A6' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 h-12 font-bold"
              style={{
                background: canConfirm
                  ? 'linear-gradient(135deg, #67E7BF, #67E7BF)'
                  : '#0E2040',
                color: canConfirm ? '#091525' : '#5A6572',
                opacity: canConfirm ? 1 : 0.6,
              }}
            >
              {isLoading ? 'Joining the board...' : `Confirm entry · $${tournament.buyIn.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

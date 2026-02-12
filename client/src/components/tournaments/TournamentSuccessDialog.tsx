import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Copy, Users, ExternalLink, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import TournamentInviteModal from "./TournamentInviteModal";

interface TournamentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  tournament: {
    id: number;
    name: string;
    code: string;
    buyInAmount: string;
    maxPlayers: number;
    startingBalance: string;
  };
  onNavigate: () => void;
}

export default function TournamentSuccessDialog({
  open,
  onClose,
  tournament,
  onNavigate
}: TournamentSuccessDialogProps) {
  const { toast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const tournamentUrl = `${window.location.origin}/tournaments?join=${tournament.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tournamentUrl);
    setLinkCopied(true);
    toast({
      title: "Link Copied!",
      description: "Tournament link copied to clipboard",
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleGoToTournament = () => {
    onNavigate();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl" style={{
          background: 'linear-gradient(135deg, #1E2D3F 0%, #0A1929 100%)',
          border: '1px solid rgba(227, 179, 65, 0.3)'
        }}>
          {/* Confetti Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? '#E3B341' : i % 3 === 1 ? '#28C76F' : '#3B82F6',
                  left: `${Math.random() * 100}%`,
                  top: -10
                }}
                animate={{
                  y: [0, 600],
                  rotate: [0, 360],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Success Content */}
          <div className="relative z-10 space-y-6 pt-6">
            {/* Header with Trophy Icon */}
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex justify-center"
              >
                <div
                  className="p-6 rounded-full"
                  style={{
                    background: 'rgba(227, 179, 65, 0.2)',
                    border: '2px solid #E3B341'
                  }}
                >
                  <Trophy size={48} style={{ color: '#E3B341' }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold" style={{ color: '#E3B341' }}>
                  Tournament Created!
                </h2>
                <p className="text-lg mt-2" style={{ color: '#C9D1E2' }}>
                  Your tournament is ready to go
                </p>
              </motion.div>
            </div>

            {/* Tournament Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card style={{
                background: '#1E2D3F',
                border: '1px solid #2B3A4C'
              }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold" style={{ color: '#C9D1E2' }}>
                      {tournament.name}
                    </h3>
                    <Badge
                      style={{
                        background: 'rgba(227, 179, 65, 0.2)',
                        color: '#E3B341',
                        border: '1px solid #E3B341'
                      }}
                    >
                      CODE: {tournament.code}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p style={{ color: '#8A93A6' }}>Buy-in</p>
                      <p className="font-semibold" style={{ color: '#C9D1E2' }}>
                        ${tournament.buyInAmount}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p style={{ color: '#8A93A6' }}>Max Players</p>
                      <p className="font-semibold" style={{ color: '#C9D1E2' }}>
                        {tournament.maxPlayers}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p style={{ color: '#8A93A6' }}>Starting Balance</p>
                      <p className="font-semibold" style={{ color: '#C9D1E2' }}>
                        ${parseFloat(tournament.startingBalance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <Button
                onClick={handleCopyLink}
                className="w-full"
                style={{
                  background: linkCopied ? '#28C76F' : 'rgba(227, 179, 65, 0.2)',
                  color: linkCopied ? '#FFFFFF' : '#E3B341',
                  border: `1px solid ${linkCopied ? '#28C76F' : '#E3B341'}`,
                  fontWeight: 600
                }}
              >
                {linkCopied ? (
                  <>
                    <CheckCircle2 className="mr-2" size={18} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2" size={18} />
                    Copy Invite Link
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowInviteModal(true)}
                className="w-full"
                variant="outline"
                style={{
                  background: 'transparent',
                  color: '#E3B341',
                  border: '1px solid #E3B341'
                }}
              >
                <Users className="mr-2" size={18} />
                Invite Friends
              </Button>

              <Button
                onClick={handleGoToTournament}
                className="w-full"
                style={{
                  background: '#E3B341',
                  color: '#06121F',
                  fontWeight: 600
                }}
              >
                <ExternalLink className="mr-2" size={18} />
                Go to Tournament
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <TournamentInviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        tournament={tournament}
      />
    </>
  );
}

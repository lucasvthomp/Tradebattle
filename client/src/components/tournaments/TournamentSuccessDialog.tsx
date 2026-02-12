import { useState } from "react";
<<<<<<< HEAD
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Copy,
  Check,
  X,
  Users,
  Share2,
  UserPlus,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TournamentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: number;
  tournamentName: string;
  tournamentCode: string;
}

export function TournamentSuccessDialog({
  isOpen,
  onClose,
  tournamentId,
  tournamentName,
  tournamentCode
}: TournamentSuccessDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // Fetch user's friends
  const { data: friendsData } = useQuery({
    queryKey: ["/api/friends"],
    enabled: isOpen,
  });

  const friends = friendsData?.data || [];
  const tournamentLink = `${window.location.origin}/tournaments?code=${tournamentCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tournamentLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Tournament link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFriend = (friendId: number) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInviteFriends = async () => {
    if (selectedFriends.length === 0) {
      toast({
        title: "No friends selected",
        description: "Please select at least one friend to invite",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/tournaments/${tournamentId}/invite`, {
        userIds: selectedFriends
      });

      toast({
        title: "Invites sent!",
        description: `Tournament invites sent to ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''}`,
      });

      setSelectedFriends([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invites",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0" style={{ backgroundColor: '#0F172A', borderColor: '#E3B341', borderWidth: '2px' }}>
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent" />
          <div className="relative p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#10B981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}
            >
              <Trophy className="w-8 h-8" style={{ color: '#FFFFFF' }} />
            </motion.div>
            <DialogTitle className="text-2xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
              🎉 Tournament Created!
            </DialogTitle>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {tournamentName}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" style={{ color: '#E3B341' }} />
              <Label className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                Share Tournament Link
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={tournamentLink}
                className="flex-1 text-sm"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              <Button
                onClick={handleCopyLink}
                className="px-4"
                style={{ backgroundColor: copied ? '#10B981' : '#E3B341', color: '#080C14' }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs" style={{ color: '#8A93A6' }}>
              Anyone with this link can join your tournament using code: <span className="font-bold" style={{ color: '#E3B341' }}>{tournamentCode}</span>
            </p>
          </div>

          <Separator style={{ backgroundColor: '#1F2937' }} />

          {/* Invite Friends Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" style={{ color: '#E3B341' }} />
                <Label className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                  Invite Friends
                </Label>
              </div>
              {selectedFriends.length > 0 && (
                <Badge style={{ backgroundColor: '#10B98120', color: '#10B981', borderColor: '#10B981', borderWidth: '1px' }}>
                  {selectedFriends.length} selected
                </Badge>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#8A93A6' }} />
                <p className="text-sm" style={{ color: '#8A93A6' }}>
                  No friends to invite yet
                </p>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {friends.map((friend: any) => (
                    <div
                      key={friend.id}
                      onClick={() => handleToggleFriend(friend.id)}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5"
                      style={{
                        backgroundColor: selectedFriends.includes(friend.id) ? '#E3B34115' : '#111827',
                        borderColor: selectedFriends.includes(friend.id) ? '#E3B341' : '#1F2937',
                        borderWidth: '1px',
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          {friend.profilePicture && (
                            <AvatarImage src={friend.profilePicture} className="object-cover" />
                          )}
                          <AvatarFallback style={{ backgroundColor: '#1F2937', color: '#E3B341' }}>
                            {friend.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                            {friend.username}
                          </p>
                        </div>
                      </div>
                      {selectedFriends.includes(friend.id) && (
                        <Check className="w-5 h-5" style={{ color: '#10B981' }} />
                      )}
                    </div>
                  ))}
                </div>

                {selectedFriends.length > 0 && (
                  <Button
                    onClick={handleInviteFriends}
                    className="w-full font-bold"
                    style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                  >
                    Send Invites ({selectedFriends.length})
                  </Button>
                )}
              </>
            )}
          </div>

          <Separator style={{ backgroundColor: '#1F2937' }} />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm"
              style={{ color: '#8A93A6' }}
            >
              <X className="w-4 h-4 mr-2" />
              Skip for now
            </Button>
            <Button
              onClick={() => window.open(`/tournaments/${tournamentId}`, '_blank')}
              className="font-bold"
              style={{ backgroundColor: '#E3B341', color: '#080C14' }}
            >
              View Tournament
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
=======
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
>>>>>>> 61aee8ab2311c8dfc94d416a78f6abb7ee41d000
  );
}

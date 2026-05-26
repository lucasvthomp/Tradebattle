import { useState } from "react";
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
      <DialogContent className="max-w-[95vw] md:max-w-2xl p-0" style={{ backgroundColor: '#1E2D3F', borderColor: '#E3B341', borderWidth: '2px' }}>
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent" />
          <div className="relative p-4 md:p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4"
              style={{ backgroundColor: '#10B981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' }}
            >
              <Trophy className="w-7 h-7 md:w-8 md:h-8" style={{ color: '#FFFFFF' }} />
            </motion.div>
            <DialogTitle className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#F1F5F9' }}>
              Tournament Created!
            </DialogTitle>
            <p className="text-sm md:text-base" style={{ color: '#94A3B8' }}>
              {tournamentName}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" style={{ color: '#E3B341' }} />
              <Label className="text-sm md:text-base font-medium" style={{ color: '#F1F5F9' }}>
                Share Tournament Link
              </Label>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                readOnly
                value={tournamentLink}
                className="flex-1 text-sm"
                style={{ backgroundColor: '#1E2D3F', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              <Button
                onClick={handleCopyLink}
                className="px-4 min-h-[44px] md:min-h-0"
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

          <Separator style={{ backgroundColor: '#1E2D3F' }} />

          {/* Invite Friends Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" style={{ color: '#E3B341' }} />
                <Label className="text-sm md:text-base font-medium" style={{ color: '#F1F5F9' }}>
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
                <p className="text-sm md:text-base" style={{ color: '#8A93A6' }}>
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
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 min-h-[44px]"
                      style={{
                        backgroundColor: selectedFriends.includes(friend.id) ? '#E3B34115' : '#111827',
                        borderColor: selectedFriends.includes(friend.id) ? '#E3B341' : '#1F2937',
                        borderWidth: '1px',
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-9 h-9 md:w-10 md:h-10">
                          {friend.profilePicture && (
                            <AvatarImage src={friend.profilePicture} className="object-cover" />
                          )}
                          <AvatarFallback style={{ backgroundColor: '#1E2D3F', color: '#E3B341' }}>
                            {friend.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm md:text-base font-medium" style={{ color: '#F1F5F9' }}>
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
                    className="w-full font-bold min-h-[44px]"
                    style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                  >
                    Send Invites ({selectedFriends.length})
                  </Button>
                )}
              </>
            )}
          </div>

          <Separator style={{ backgroundColor: '#1E2D3F' }} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-sm md:text-base min-h-[44px] order-2 sm:order-1"
              style={{ color: '#8A93A6' }}
            >
              <X className="w-4 h-4 mr-2" />
              Skip for now
            </Button>
            <Button
              onClick={() => window.open(`/tournaments/${tournamentId}`, '_blank')}
              className="font-bold min-h-[44px] order-1 sm:order-2"
              style={{ backgroundColor: '#E3B341', color: '#080C14' }}
            >
              View Tournament
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Send, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TournamentInviteModalProps {
  open: boolean;
  onClose: () => void;
  tournament: {
    id: number;
    name: string;
    participantUserIds?: number[];
  };
}

interface Friend {
  id: number;
  username: string;
  profilePicture?: string;
}

export default function TournamentInviteModal({
  open,
  onClose,
  tournament
}: TournamentInviteModalProps) {
  const { toast } = useToast();
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  // Fetch friends list
  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/friends');
      const json = await response.json();
      return (json.data ?? json) as Friend[];
    },
    enabled: open
  });

  // Send invites mutation
  const inviteMutation = useMutation({
    mutationFn: async (friendIds: number[]) => {
      const response = await apiRequest('POST', `/api/tournaments/${tournament.id}/invite`, { friendIds });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invites Sent!",
        description: `Invited ${data.invited} friend${data.invited !== 1 ? 's' : ''} to the tournament`,
      });
      setSelectedFriends([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invites",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleToggleFriend = (friendId: number) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleInvite = () => {
    if (selectedFriends.length === 0) {
      toast({
        title: "No friends selected",
        description: "Please select at least one friend to invite",
        variant: "destructive"
      });
      return;
    }
    inviteMutation.mutate(selectedFriends);
  };

  // Filter out participants
  const participantIds = tournament.participantUserIds || [];
  const inviteableFriends = friendsData?.filter(f => !participantIds.includes(f.id)) || [];
  const participantFriends = friendsData?.filter(f => participantIds.includes(f.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: '#0C1829',
          border: '1px solid #0E2040'
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#C9D1E2' }}>
            <Users size={20} />
            Invite Friends to {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8" style={{ color: '#8A93A6' }}>
              Loading friends...
            </div>
          ) : inviteableFriends.length === 0 && participantFriends.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#8A93A6' }}>
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p>No friends to invite</p>
              <p className="text-sm mt-1">Add crew members to invite them to the arena</p>
            </div>
          ) : (
            <>
              {/* Inviteable Friends */}
              {inviteableFriends.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: '#8A93A6' }}>
                    Available to Invite
                  </p>
                  {inviteableFriends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        background: selectedFriends.includes(friend.id)
                          ? 'rgba(0, 163, 255, 0.1)'
                          : '#091525',
                        border: `1px solid ${selectedFriends.includes(friend.id) ? '#00A3FF' : '#0E2040'}`
                      }}
                      onClick={() => handleToggleFriend(friend.id)}
                    >
                      <Checkbox
                        checked={selectedFriends.includes(friend.id)}
                        onCheckedChange={() => handleToggleFriend(friend.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.profilePicture} />
                        <AvatarFallback style={{ background: '#0E2040', color: '#C9D1E2' }}>
                          {friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span style={{ color: '#C9D1E2' }}>{friend.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Already Joined */}
              {participantFriends.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: '#8A93A6' }}>
                    Already Joined
                  </p>
                  {participantFriends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-3 rounded-lg opacity-60"
                      style={{
                        background: 'transparent',
                        border: '1px solid #0E2040'
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.profilePicture} />
                        <AvatarFallback style={{ background: '#0E2040', color: '#C9D1E2' }}>
                          {friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1" style={{ color: '#C9D1E2' }}>
                        {friend.username}
                      </span>
                      <Badge
                        variant="outline"
                        style={{
                          background: 'rgba(40, 199, 111, 0.1)',
                          color: '#28C76F',
                          border: '1px solid #28C76F'
                        }}
                      >
                        <UserCheck size={12} className="mr-1" />
                        Joined
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {inviteableFriends.length > 0 && (
          <div className="flex gap-2 pt-4 border-t" style={{ borderColor: '#0E2040' }}>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              style={{
                background: 'transparent',
                color: '#8A93A6',
                border: '1px solid #0E2040'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedFriends.length === 0 || inviteMutation.isPending}
              className="flex-1"
              style={{
                background: selectedFriends.length === 0 ? '#0E2040' : '#00A3FF',
                color: selectedFriends.length === 0 ? '#8A93A6' : '#091525',
                border: 'none'
              }}
            >
              <Send className="mr-2" size={16} />
              {inviteMutation.isPending ? 'Sending...' : `Invite crew ${selectedFriends.length || ''}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

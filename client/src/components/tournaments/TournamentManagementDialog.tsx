import React, { useState, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  DollarSign,
  Target,
  Shield,
  Play,
  X,
  UserX,
  AlertTriangle,
  Crown,
  MessageSquare,
  Settings,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TournamentInviteModal from "./TournamentInviteModal";

const TournamentChat = React.lazy(() => import("@/components/chat/TournamentChat"));

interface TournamentManagementDialogProps {
  tournament: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TournamentManagementDialog({
  tournament,
  isOpen,
  onClose
}: TournamentManagementDialogProps) {
  const { user } = useAuth();
  const { formatCurrency } = useUserPreferences();
  const { toast } = useToast();

  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("manage");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isCreator = user?.id === tournament?.creatorId;
  const isPrivate = !tournament?.isPublic;
  const hasStarted = tournament?.status === 'active';
  const isWaiting = tournament?.status === 'waiting';

  // Kick participant mutation
  const kickParticipantMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const res = await apiRequest("DELETE", `/api/tournaments/${tournament.id}/participants/${participantId}`, {});
      return res.json();
    },
    onSuccess: () => {
      setKickDialogOpen(false);
      setSelectedParticipant(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournament.id}/participants`] });
      toast({
        title: "Player removed",
        description: "The player was removed from the arena.",
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

  // Start tournament early mutation
  const startEarlyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tournaments/${tournament.id}/start-early`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      toast({
        title: "Arena live",
        description: "The arena is now on the board.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel tournament mutation
  const cancelTournamentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/tournaments/${tournament.id}/cancel`, {});
      return res.json();
    },
    onSuccess: () => {
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/public"] });
      toast({
        title: "Arena cancelled",
        description: "The arena was cancelled successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isCreator) {
    return null;
  }

  const getStartTime = () => {
    if (tournament.scheduledStartTime) {
      const startTime = new Date(tournament.scheduledStartTime);
      const now = new Date();
      const timeDiff = startTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `Starts in ${hours}h ${minutes}m`;
      }
      return "Ready to start";
    }
    return "Immediate start";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span>Manage arena: {tournament.name}</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="mt-4">
              <div className="space-y-6">
                {/* Tournament Status */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={hasStarted ? "default" : isWaiting ? "secondary" : "outline"}>
                      {tournament.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getStartTime()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPrivate && <Shield className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium">
                      {isPrivate ? "Closed" : "Open"} arena
                    </span>
                  </div>
                </div>

                {/* Tournament Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{tournament.currentPlayers}/{tournament.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{tournament.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{formatCurrency(tournament.startingBalance)} starting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span>{formatCurrency(tournament.currentPlayers * tournament.buyInAmount)} pot</span>
                  </div>
                  {/* Show tournament code for private tournaments */}
                  {isPrivate && (
                    <>
                      <div className="flex items-center space-x-2 col-span-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <span className="font-medium text-blue-800 dark:text-blue-200">Arena code: </span>
                          <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-900 dark:text-blue-100 font-mono text-sm">
                            {tournament.code || 'CODE_NOT_FOUND'}
                          </code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900"
                          onClick={() => {
                            if (tournament.code) {
                              navigator.clipboard.writeText(tournament.code);
                              toast({
                                title: "Copied",
                                description: "Arena code copied to clipboard",
                              });
                            } else {
                              toast({
                                title: "Error",
                                description: "No arena code available to copy",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Creator Powers */}
                <div className="space-y-4">
              <h3 className="font-semibold">Arena controls</h3>

                  {/* Tournament Powers - Available for all creators */}
                  {isWaiting && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Invite your crew</p>
                          <p className="text-sm text-muted-foreground">Send arena invites to your friends</p>
                        </div>
                        <Button
                          onClick={() => setInviteModalOpen(true)}
                          variant="outline"
                          style={{
                            background: 'rgba(0, 163, 255, 0.1)',
                            color: '#00A3FF',
                            border: '1px solid #00A3FF'
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Open the arena early</p>
                          <p className="text-sm text-muted-foreground">Start the arena immediately</p>
                        </div>
                        <Button
                          onClick={() => startEarlyMutation.mutate()}
                          disabled={startEarlyMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {startEarlyMutation.isPending ? "Opening..." : "Open now"}
                        </Button>
                      </div>

                      {isPrivate && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Cancel arena</p>
                            <p className="text-sm text-muted-foreground">Delete the arena before it starts</p>
                          </div>
                          <Button
                            onClick={() => setCancelDialogOpen(true)}
                            disabled={hasStarted}
                            variant="destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel arena
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participant Management (Private only) */}
                  {isPrivate && isWaiting && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium">Manage players</p>
                        <Badge variant="outline">{tournament.currentPlayers} players</Badge>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-auto">
                        {tournament.participants?.map((participant: any) => (
                          <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{participant.displayName || participant.username}</span>
                              {participant.id === tournament.creatorId && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            {participant.id !== tournament.creatorId && (
                              <Button
                                onClick={() => {
                                  setSelectedParticipant(participant);
                                  setKickDialogOpen(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Kick
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tournament Started Notice */}
                  {hasStarted && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">Arena in progress</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          Arena controls are limited once play has started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              {activeTab === "chat" && (
                <Suspense fallback={
                  <div className="flex items-center justify-center h-[400px]" style={{ backgroundColor: 'transparent' }}>
                    <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00A3FF', borderTopColor: 'transparent' }} />
                  </div>
                }>
                  <TournamentChat tournamentId={tournament.id} />
                </Suspense>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Kick Participant Confirmation */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedParticipant?.displayName || selectedParticipant?.username}" from this arena?
              They will need to rejoin using the arena code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kickParticipantMutation.mutate(selectedParticipant?.id)}
              disabled={kickParticipantMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {kickParticipantMutation.isPending ? "Removing..." : "Remove player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Tournament Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>Cancel arena</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{tournament.name}"? This action cannot be undone and all players will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep arena</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTournamentMutation.mutate()}
              disabled={cancelTournamentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelTournamentMutation.isPending ? "Cancelling..." : "Cancel arena"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Modal */}
      <TournamentInviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        tournament={tournament}
      />
    </>
  );
}

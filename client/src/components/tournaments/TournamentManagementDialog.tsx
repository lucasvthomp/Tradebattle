import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Crown
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
        title: "Success",
        description: "Participant removed from tournament",
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
        title: "Success",
        description: "Tournament started successfully!",
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
        title: "Success",
        description: "Tournament cancelled successfully",
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
              <span>Manage Tournament: {tournament.name}</span>
            </DialogTitle>
          </DialogHeader>

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
                  {isPrivate ? "Private" : "Public"} Tournament
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
            </div>

            <Separator />

            {/* Creator Powers */}
            <div className="space-y-4">
              <h3 className="font-semibold">Creator Actions</h3>
              
              {/* Private Tournament Powers */}
              {isPrivate && isWaiting && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Start Tournament Early</p>
                      <p className="text-sm text-muted-foreground">Begin the tournament immediately</p>
                    </div>
                    <Button
                      onClick={() => startEarlyMutation.mutate()}
                      disabled={startEarlyMutation.isPending || tournament.currentPlayers < 2}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {startEarlyMutation.isPending ? "Starting..." : "Start Now"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cancel Tournament</p>
                      <p className="text-sm text-muted-foreground">Delete the tournament before it starts</p>
                    </div>
                    <Button
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={hasStarted}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Tournament
                    </Button>
                  </div>
                </div>
              )}

              {/* Participant Management (Private only) */}
              {isPrivate && isWaiting && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">Manage Participants</p>
                    <Badge variant="outline">{tournament.currentPlayers} participants</Badge>
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
                    <p className="font-medium text-blue-800 dark:text-blue-200">Tournament in Progress</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Management options are limited once a tournament has started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kick Participant Confirmation */}
      <AlertDialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedParticipant?.displayName || selectedParticipant?.username}" from this tournament? 
              They will need to rejoin using the tournament code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => kickParticipantMutation.mutate(selectedParticipant?.id)}
              disabled={kickParticipantMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {kickParticipantMutation.isPending ? "Removing..." : "Remove Participant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Tournament Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{tournament.name}"? This action cannot be undone and all participants will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Tournament</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTournamentMutation.mutate()}
              disabled={cancelTournamentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelTournamentMutation.isPending ? "Cancelling..." : "Cancel Tournament"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
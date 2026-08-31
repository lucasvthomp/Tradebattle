import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Edit,
  DollarSign,
  Plus,
  Minus,
  Trophy,
  Users,
  Clock,
  Target,
  Crown,
  AlertCircle,
  TrendingUp,
  Activity,
  Calendar,
  Award,
  Ban
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TournamentManagementDialogProps {
  tournament: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TournamentManagementDialog({ tournament, open, onOpenChange }: TournamentManagementDialogProps) {
  const [newName, setNewName] = useState(tournament?.name || "");
  const [newPrizeMultiplier, setNewPrizeMultiplier] = useState(tournament?.prizeMultiplier || 1);
  const [adminNote, setAdminNote] = useState("");
  const [extensionHours, setExtensionHours] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tournament participants
  const { data: participants } = useQuery({
    queryKey: [`/api/admin/tournaments/${tournament?.id}/participants`],
    enabled: !!tournament?.id && open,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/tournaments/${tournament.id}/participants`);
      return response.json();
    }
  });

  const updateTournamentNameMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; name: string }) => {
      return await apiRequest("PATCH", `/api/admin/tournaments/${data.tournamentId}/name`, { name: data.name });
    },
    onSuccess: () => {
      toast({ title: "Arena name updated", description: "Arena name updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message || "Couldn’t update the arena name", variant: "destructive" });
    },
  });

  const updatePrizeMultiplierMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; multiplier: number }) => {
      return await apiRequest("PATCH", `/api/admin/tournaments/${data.tournamentId}/prize-multiplier`, { multiplier: data.multiplier });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Prize multiplier updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update prize multiplier", variant: "destructive" });
    },
  });

  const extendTournamentMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; hours: number }) => {
      return await apiRequest("PATCH", `/api/admin/tournaments/${data.tournamentId}/extend`, { hours: data.hours });
    },
    onSuccess: () => {
      toast({ title: "Arena extended", description: "Arena duration updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      setExtensionHours("");
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message || "Couldn’t extend the arena", variant: "destructive" });
    },
  });

  const endTournamentMutation = useMutation({
    mutationFn: async (tournamentId: number) => {
      return await apiRequest("POST", `/api/admin/tournaments/${tournamentId}/end`);
    },
    onSuccess: () => {
      toast({ title: "Arena ended", description: "Arena results are now final" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Action failed", description: error.message || "Couldn’t end the arena", variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (data: { tournamentId: number; userId: number }) => {
      return await apiRequest("DELETE", `/api/admin/tournaments/${data.tournamentId}/participants/${data.userId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Participant removed successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tournaments/${tournament.id}/participants`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tournaments"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove participant", variant: "destructive" });
    },
  });

  if (!tournament) return null;

  const timeLeft = new Date(tournament.endsAt).getTime() - new Date().getTime();
  const isActive = timeLeft > 0;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Manage arena: {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Arena ID</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="font-mono font-semibold">{tournament.id}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Ended"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Time Remaining</Label>
              <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {isActive ? (
                  <span className="font-semibold text-green-500">
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {minutes}m
                  </span>
                ) : (
                  <span className="text-muted-foreground">Arena has ended</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Members
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="font-semibold">{tournament.memberCount || 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Entry fee
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="font-semibold">${parseFloat(tournament.buyInAmount || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Prize Pot
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <span className="font-semibold text-primary">${parseFloat(tournament.currentPot || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Arena code</Label>
              <div className="p-3 rounded-lg bg-muted">
                <code className="font-mono font-semibold">{tournament.code}</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Created</Label>
              <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(tournament.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants && participants.length > 0 ? (
                    participants.map((participant: any, index: number) => (
                      <TableRow key={participant.userId}>
                        <TableCell className="font-mono">{participant.userId}</TableCell>
                        <TableCell className="font-semibold">{participant.username || `User ${participant.userId}`}</TableCell>
                        <TableCell>${parseFloat(participant.balance || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={index === 0 ? "default" : "outline"}>
                            {index === 0 && <Crown className="h-3 w-3 mr-1" />}
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMemberMutation.mutate({ tournamentId: tournament.id, userId: participant.userId })}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No participants yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Arena name</Label>
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new arena name"
                  />
                  <Button
                    onClick={() => updateTournamentNameMutation.mutate({ tournamentId: tournament.id, name: newName })}
                    disabled={newName === tournament.name || !newName.trim()}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Prize Multiplier</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={newPrizeMultiplier}
                    onChange={(e) => setNewPrizeMultiplier(parseFloat(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground">x</span>
                  <Button
                    onClick={() => updatePrizeMultiplierMutation.mutate({ tournamentId: tournament.id, multiplier: newPrizeMultiplier })}
                    disabled={newPrizeMultiplier === tournament.prizeMultiplier}
                  >
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current pot: ${parseFloat(tournament.currentPot || 0).toFixed(2)} × {newPrizeMultiplier} = ${(parseFloat(tournament.currentPot || 0) * newPrizeMultiplier).toFixed(2)}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add internal notes about this tournament..."
                  rows={4}
                />
                <Button size="sm" disabled={!adminNote.trim()}>
                  Save Note
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-4">
              {isActive && (
                <>
                  <div className="space-y-2">
                    <Label>Extend arena duration</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Hours to extend"
                        value={extensionHours}
                        onChange={(e) => setExtensionHours(e.target.value)}
                        min="1"
                      />
                      <Button
                        onClick={() => extendTournamentMutation.mutate({
                          tournamentId: tournament.id,
                          hours: parseInt(extensionHours)
                        })}
                        disabled={!extensionHours || parseInt(extensionHours) < 1}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Extend
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      New end time: {new Date(new Date(tournament.endsAt).getTime() + (parseInt(extensionHours) || 0) * 60 * 60 * 1000).toLocaleString()}
                    </p>
                  </div>

                  <Separator />
                </>
              )}

              <div className="space-y-2">
                <Label className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Danger Zone
                </Label>
                <div className="p-4 rounded-lg border-2 border-destructive/50 bg-destructive/5 space-y-3">
                  {isActive && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        if (confirm(`Are you sure you want to end "${tournament.name}"? This will immediately calculate winners and distribute prizes.`)) {
                          endTournamentMutation.mutate(tournament.id);
                        }
                      }}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      End arena now
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isActive
                      ? "This will immediately end the arena and calculate winners."
                      : "This arena has already ended."}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

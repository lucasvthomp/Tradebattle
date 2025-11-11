import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, MessageSquare, X, User, Trophy, Users, DollarSign, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useChatContext } from "@/contexts/ChatContext";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
}

interface Tournament {
  id: number;
  name: string;
  status: string;
  isParticipating?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { user } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const { selectedChatRoom, setSelectedChatRoom } = useChatContext();
  const [newMessage, setNewMessage] = useState("");
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Use selectedChatRoom from context
  const selectedChat = selectedChatRoom;

  // Fetch user's tournaments for chat selection
  const { data: userTournamentsResponse } = useQuery<{data: Tournament[]}>({
    queryKey: ['/api/tournaments'],
    enabled: !!user && isOpen,
  });

  const userTournaments = userTournamentsResponse?.data?.filter(t => 
    t.status === "active" || t.status === "waiting"
  ) || [];

  // Determine current chat endpoint
  const isGlobalChat = selectedChat === "global";
  const tournamentId = isGlobalChat ? undefined : parseInt(selectedChat);

  // Fetch chat messages with optimized polling
  const { data: chatResponse, isLoading } = useQuery({
    queryKey: ['/api/chat', selectedChat],
    queryFn: async () => {
      const endpoint = isGlobalChat 
        ? '/api/chat/global' 
        : `/api/chat/tournament/${tournamentId}`;
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    refetchInterval: 1500, // Faster refresh - every 1.5 seconds
    enabled: isOpen && !!user,
    staleTime: 500, // Consider data stale after 0.5 seconds
    gcTime: 2000, // Garbage collect after 2 seconds
  });

  const messages: ChatMessage[] = chatResponse?.data || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; tournamentId?: number }) => {
      const endpoint = isGlobalChat
        ? '/api/chat/global'
        : `/api/chat/tournament/${tournamentId}`;
      const response = await apiRequest("POST", endpoint, messageData);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat', selectedChat] });
    }
  });

  // Send tip mutation
  const sendTipMutation = useMutation({
    mutationFn: async ({ recipientId, amount }: { recipientId: number; amount: number }) => {
      const response = await apiRequest("POST", "/api/tips", {
        recipientId,
        amount
      });
      return response.json();
    },
    onSuccess: () => {
      setTipDialogOpen(false);
      setTipAmount("");
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      message: newMessage.trim(),
      tournamentId: isGlobalChat ? undefined : tournamentId
    });
  };

  const handleSendTip = () => {
    if (!selectedUser || !tipAmount || parseFloat(tipAmount) <= 0) return;
    sendTipMutation.mutate({
      recipientId: selectedUser.id,
      amount: parseFloat(tipAmount)
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCurrentChatInfo = () => {
    if (isGlobalChat) {
      return {
        name: "Global Chat",
        description: "Chat with all platform users",
        icon: <MessageSquare className="w-4 h-4" />,
        color: "bg-blue-500"
      };
    }

    const tournament = userTournaments.find(t => t.id === tournamentId);
    if (tournament) {
      return {
        name: tournament.name,
        description: "Tournament chat",
        icon: <Trophy className="w-4 h-4" />,
        color: "bg-orange-500"
      };
    }

    return {
      name: "Tournament Chat",
      description: "Tournament discussion",
      icon: <Trophy className="w-4 h-4" />,
      color: "bg-orange-500"
    };
  };

  const chatInfo = getCurrentChatInfo();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="h-full w-full backdrop-blur-md shadow-xl flex flex-col overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 4rem)', backgroundColor: '#142538', borderLeft: '2px solid #2B3A4C' }}
    >
            {/* Compact Header with Chat Selector */}
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid #2B3A4C', backgroundColor: '#0A1A2F' }}>
              <div className="flex items-center flex-1">
                {/* Compact Chat Selector */}
                <Select value={selectedChat} onValueChange={setSelectedChatRoom}>
                  <SelectTrigger className="w-full h-8 text-sm" style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                    <SelectItem value="global" style={{ color: '#C9D1E2' }}>
                      <div className="flex items-center space-x-2">
                        <span>Global Chat</span>
                      </div>
                    </SelectItem>
                    {userTournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id.toString()} style={{ color: '#C9D1E2' }}>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-3 h-3" style={{ color: '#E3B341' }} />
                          <span className="truncate max-w-[180px]">{tournament.name}</span>
                          <Badge variant="secondary" className="text-xs shrink-0" style={{ backgroundColor: '#2B3A4C', color: '#C9D1E2' }}>
                            {tournament.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                    {userTournaments.length === 0 && (
                      <SelectItem value="no-tournaments" disabled style={{ color: '#8A93A6' }}>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-3 h-3" style={{ color: '#8A93A6' }} />
                          <span>No tournaments</span>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 ml-2 hover:bg-background/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages Area - Semi-transparent */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full p-3" style={{ backgroundColor: 'rgba(10, 26, 47, 0.5)' }}>
                <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E3B341', borderTopColor: 'transparent' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: '#8A93A6', opacity: 0.5 }} />
                    <p className="text-sm" style={{ color: '#8A93A6' }}>
                      {isGlobalChat ? "No messages yet. Start the conversation!" : "No tournament messages yet."}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      {/* Clickable Avatar with Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="cursor-pointer">
                            <Avatar className="w-8 h-8" style={{ border: '2px solid #2B3A4C' }}>
                              <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: '#1E2D3F', color: '#E3B341' }}>
                                {message.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
                          <DropdownMenuItem
                            onClick={() => navigate(`/people/${message.userId}`)}
                            className="cursor-pointer"
                            style={{ color: '#C9D1E2' }}
                          >
                            <UserCircle className="w-4 h-4 mr-2" style={{ color: '#E3B341' }} />
                            View Full Profile
                          </DropdownMenuItem>
                          {message.userId !== user?.id && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser({ id: message.userId, username: message.username });
                                setTipDialogOpen(true);
                              }}
                              className="cursor-pointer"
                              style={{ color: '#C9D1E2' }}
                            >
                              <DollarSign className="w-4 h-4 mr-2" style={{ color: '#28C76F' }} />
                              Send Tip
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-xs font-semibold" style={{ color: '#C9D1E2' }}>
                            {message.username}
                          </span>
                          {message.userId === user?.id && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0" style={{ backgroundColor: '#E3B341', color: '#06121F' }}>You</Badge>
                          )}
                          <span className="text-[10px]" style={{ color: '#8A93A6' }}>
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                        <div className="backdrop-blur-sm rounded-md px-2 py-1.5" style={{ backgroundColor: '#1E2D3F', border: '1px solid #2B3A4C' }}>
                          <p className="text-xs break-words leading-snug" style={{ color: '#C9D1E2' }}>{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input - Semi-transparent */}
            <div className="p-3" style={{ borderTop: '1px solid #2B3A4C', backgroundColor: 'rgba(10, 26, 47, 0.9)' }}>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${isGlobalChat ? 'everyone' : 'tournament'}...`}
                  className="flex-1 text-sm h-9"
                  style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-3 h-9"
                  style={{ backgroundColor: '#E3B341', color: '#06121F' }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs" style={{ color: '#8A93A6' }}>
                <span>{messages.length} messages</span>
                <span>{newMessage.length}/500</span>
              </div>
            </div>

      {/* Tip Dialog */}
      <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
        <DialogContent style={{ backgroundColor: '#142538', borderColor: '#2B3A4C' }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#28C76F' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#06121F' }} />
              </div>
              <div>
                <DialogTitle style={{ color: '#C9D1E2' }}>Send Tip to {selectedUser?.username}</DialogTitle>
                <DialogDescription style={{ color: '#8A93A6' }}>
                  Send a tip from your balance to support this user.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tip-amount" style={{ color: '#C9D1E2' }}>Amount</Label>
              <Input
                id="tip-amount"
                type="number"
                placeholder="Enter amount"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                min="0.01"
                step="0.01"
                style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
              />
              <p className="text-xs" style={{ color: '#8A93A6' }}>
                Your balance: ${(Number(user?.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTipDialogOpen(false);
                setTipAmount("");
                setSelectedUser(null);
              }}
              style={{ backgroundColor: '#1E2D3F', borderColor: '#2B3A4C', color: '#C9D1E2' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTip}
              disabled={
                !tipAmount ||
                parseFloat(tipAmount) <= 0 ||
                parseFloat(tipAmount) > Number(user?.siteCash) ||
                sendTipMutation.isPending
              }
              style={{ backgroundColor: '#28C76F', color: '#FFFFFF' }}
            >
              {sendTipMutation.isPending ? "Sending..." : "Send Tip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
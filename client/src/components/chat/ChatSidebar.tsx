import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, X, User, Globe, Trophy, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { apiRequest } from "@/lib/queryClient";

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
  const { t } = useUserPreferences();
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string>("global");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      message: newMessage.trim(),
      tournamentId: isGlobalChat ? undefined : tournamentId
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
        icon: <Globe className="w-4 h-4" />,
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Chat Sidebar - Semi-transparent */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-background/80 backdrop-blur-md border-l border-border/50 shadow-xl z-50 flex flex-col"
          >
            {/* Compact Header with Chat Selector */}
            <div className="flex items-center justify-between p-3 border-b border-border/30 bg-background/40">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-6 h-6 ${chatInfo.color} rounded flex items-center justify-center`}>
                  {chatInfo.icon}
                </div>
                {/* Compact Chat Selector */}
                <Select value={selectedChat} onValueChange={setSelectedChat}>
                  <SelectTrigger className="w-full h-8 text-sm bg-background/60 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-md border-border/50">
                    <SelectItem value="global">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3 h-3" />
                        <span>Global Chat</span>
                      </div>
                    </SelectItem>
                    {userTournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{tournament.name}</span>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {tournament.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                    {userTournaments.length === 0 && (
                      <SelectItem value="no-tournaments" disabled>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">No tournaments</span>
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
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 bg-background/20">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {isGlobalChat ? "No messages yet. Start the conversation!" : "No tournament messages yet."}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      <div className="w-7 h-7 bg-muted/60 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.username}
                          </span>
                          {message.userId === user?.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                          <span className="text-xs text-muted-foreground/70">
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                        <div className="bg-muted/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/30">
                          <p className="text-sm break-words leading-tight">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input - Semi-transparent */}
            <div className="p-3 border-t border-border/30 bg-background/40">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${isGlobalChat ? 'everyone' : 'tournament'}...`}
                  className="flex-1 bg-background/60 border-border/50 text-sm h-9"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-3 h-9"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground/70">
                <span>{messages.length} messages</span>
                <span>{newMessage.length}/500</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
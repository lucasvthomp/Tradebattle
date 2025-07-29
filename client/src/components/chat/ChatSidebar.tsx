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

  // Fetch chat messages
  const { data: chatResponse, isLoading } = useQuery({
    queryKey: ['/api/chat', selectedChat],
    queryFn: async () => {
      const endpoint = isGlobalChat 
        ? '/api/chat/global' 
        : `/api/chat/tournament/${tournamentId}`;
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    refetchInterval: 3000, // Refresh every 3 seconds
    enabled: isOpen && !!user
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

          {/* Chat Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-16 right-0 bottom-0 w-80 bg-background/80 backdrop-blur-lg border-l border-border/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 ${chatInfo.color} rounded-lg flex items-center justify-center`}>
                  {chatInfo.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-sm">{chatInfo.name}</h2>
                  <p className="text-xs text-muted-foreground">{chatInfo.description}</p>
                </div>
              </div>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Selector */}
            <div className="p-4 border-b border-border/50">
              <Select value={selectedChat} onValueChange={setSelectedChat}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Global Chat</span>
                    </div>
                  </SelectItem>
                  {userTournaments.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4" />
                        <span>{tournament.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {tournament.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                  {userTournaments.length === 0 && (
                    <SelectItem value="no-tournaments" disabled>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">No active tournaments</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {isGlobalChat ? "No messages yet. Start the conversation!" : "No tournament messages yet."}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.username}
                          </span>
                          {message.userId === user?.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm break-words">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${isGlobalChat ? 'everyone' : 'tournament'}...`}
                  className="flex-1"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
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
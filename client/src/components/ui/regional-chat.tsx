import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Users, Globe, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, InsertChatMessage } from "@shared/schema";

interface RegionalChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RegionalChat({ isOpen, onToggle }: RegionalChatProps) {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch global chat messages (last 50)
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['/api/chat/global'],
    enabled: isOpen,
    refetchInterval: 5000, // Fallback polling every 5 seconds
  });

  const messages = messagesData?.data || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: InsertChatMessage) => {
      return apiRequest('POST', '/api/chat', messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/global'] });
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isOpen || !user) return;

    // Construct WebSocket URL with fallback for development
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = window.location.port;
    
    // For Replit development, use the full host with port
    const wsUrl = `${protocol}//${host}${port ? `:${port}` : ''}/ws`;
    
    console.log('Attempting WebSocket connection to:', wsUrl);
    console.log('Window location details:', {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      port: window.location.port,
      host: window.location.host
    });
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Chat WebSocket connected');
        // Join global chat room
        ws.send(JSON.stringify({ type: 'join', room: 'global' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'newMessage') {
            queryClient.invalidateQueries({ queryKey: ['/api/chat/global'] });
            scrollToBottom();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        console.error('WebSocket URL that failed:', wsUrl);
        console.error('Window location:', window.location);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      console.error('WebSocket URL that failed:', wsUrl);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      userId: user.userId,
      message: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };



  return (
    <AnimatePresence>
      <div className="fixed top-0 right-0 h-full z-50 flex">
        {/* Toggle Button */}
        <div className="flex items-center">
          <Button
            onClick={onToggle}
            variant="outline"
            size="icon"
            className="rounded-l-lg rounded-r-none bg-background border-r-0 shadow-lg hover:bg-accent"
          >
            {isOpen ? <ChevronRight className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          </Button>
        </div>

        {/* Chat Panel */}
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-80 h-full bg-background border-l border-border shadow-2xl"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Global Chat</span>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={onToggle}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect with traders worldwide
                </p>
              </CardHeader>

              <CardContent className="flex flex-col h-full pb-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 pr-4 -mr-4">
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('noMessages')}</p>
                        <p className="text-sm text-muted-foreground">{t('firstConversation')}</p>
                      </div>
                    ) : (
                      messages.map((message: ChatMessage & { username?: string; displayName?: string }) => (
                        <div
                          key={message.id}
                          className={`flex ${message.userId === user?.userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${message.userId === user?.userId ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                            {message.userId !== user?.userId && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {message.displayName?.[0] || message.username?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium">
                                  {message.displayName || message.username || t('user')}
                                </span>
                              </div>
                            )}
                            <p className="text-sm break-words">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                {/* Message Input */}
                <div className="flex space-x-2 pb-4">
                  <Input
                    value={user ? newMessage : ""}
                    onChange={(e) => user && setNewMessage(e.target.value)}
                    onKeyPress={user ? handleKeyPress : undefined}
                    placeholder={user ? (t('typeMessage') || "Type your message...") : "Please login to use chat"}
                    maxLength={500}
                    disabled={!user || sendMessageMutation.isPending}
                    readOnly={!user}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!user || !newMessage.trim() || sendMessageMutation.isPending}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
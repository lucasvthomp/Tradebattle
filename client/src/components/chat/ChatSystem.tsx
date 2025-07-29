import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// Remove Avatar import as it doesn't exist in our components
import { Send, MessageSquare, X, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string;
  message: string;
  createdAt: string;
}

interface ChatSystemProps {
  tournamentId?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSystem({ tournamentId, isOpen, onToggle }: ChatSystemProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: chatResponse, isLoading } = useQuery({
    queryKey: ['/api/chat', tournamentId],
    queryFn: async () => {
      const endpoint = tournamentId ? `/api/chat/tournament/${tournamentId}` : '/api/chat/global';
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: isOpen
  });

  const messages = chatResponse?.data || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; tournamentId?: number }) => {
      const endpoint = tournamentId ? `/api/chat/tournament/${tournamentId}` : '/api/chat/global';
      const response = await apiRequest("POST", endpoint, messageData);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat', tournamentId] });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      message: newMessage.trim(),
      tournamentId
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

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-50"
        size="sm"
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-80 h-96 z-50"
    >
      <Card className="h-full border-0 shadow-2xl bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {tournamentId ? 'Tournament Chat' : 'Global Chat'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
            <div className="space-y-3 pb-4">
              <AnimatePresence>
                {isLoading ? (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message: ChatMessage) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start space-x-2 ${
                        message.userId === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {message.profilePicture ? (
                          <img 
                            src={message.profilePicture} 
                            alt={message.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className={`flex-1 max-w-[80%] ${
                        message.userId === user?.id ? 'text-right' : ''
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-foreground">
                            {message.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          message.userId === user?.id 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted text-foreground'
                        }`}>
                          {message.message}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="p-4 border-t border-border/50">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-9"
                maxLength={500}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="h-9 w-9 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
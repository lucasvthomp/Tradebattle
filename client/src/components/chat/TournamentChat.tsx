import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
}

interface TournamentChatProps {
  tournamentId: number;
  className?: string;
}

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

const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isCurrentUser,
}: {
  message: ChatMessage;
  isCurrentUser: boolean;
}) {
  return (
    <div className="flex space-x-2">
      <Avatar className="w-8 h-8" style={{ border: '2px solid #1F2937' }}>
        <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: '#111827', color: '#E3B341' }}>
          {message.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 mb-0.5">
          <span className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>
            {message.username}
          </span>
          {isCurrentUser && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0" style={{ backgroundColor: '#E3B341', color: '#080C14' }}>You</Badge>
          )}
          <span className="text-[10px]" style={{ color: '#94A3B8' }}>
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
        <div className="backdrop-blur-sm rounded-md px-2 py-1.5" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <p className="text-xs break-words leading-snug" style={{ color: '#F1F5F9' }}>{message.message}</p>
        </div>
      </div>
    </div>
  );
});

function TournamentChat({ tournamentId, className }: TournamentChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: chatResponse, isLoading } = useQuery({
    queryKey: ['/api/chat/tournament', tournamentId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/chat/tournament/${tournamentId}`);
      return response.json();
    },
    refetchInterval: 3000,
    enabled: !!user,
    staleTime: 1000,
    gcTime: 5000,
  });

  const allMessages: ChatMessage[] = chatResponse?.data || [];
  const messages = allMessages.slice(-100);

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await apiRequest("POST", `/api/chat/tournament/${tournamentId}`, messageData);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/tournament', tournamentId] });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    sendMessageMutation.mutate({ message: newMessage.trim() });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className={`flex flex-col h-[400px] rounded-lg overflow-hidden ${className || ''}`} style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}>
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-3" style={{ backgroundColor: 'rgba(8, 12, 20, 0.5)' }}>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E3B341', borderTopColor: 'transparent' }} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: '#94A3B8', opacity: 0.5 }} />
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  No tournament messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={message.userId === user?.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-3" style={{ borderTop: '1px solid #1F2937', backgroundColor: 'rgba(8, 12, 20, 0.9)' }}>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message tournament..."
            className="flex-1 text-sm h-9"
            style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-3 h-9"
            style={{ backgroundColor: '#E3B341', color: '#080C14' }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2 text-xs" style={{ color: '#94A3B8' }}>
          <span>{messages.length} messages</span>
          <span>{newMessage.length}/500</span>
        </div>
      </div>
    </div>
  );
}

export default TournamentChat;

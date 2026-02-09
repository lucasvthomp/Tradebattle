import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Send, MessageSquare, X, DollarSign, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
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
  onViewProfile,
  onSendTip,
}: {
  message: ChatMessage;
  isCurrentUser: boolean;
  onViewProfile: (userId: number) => void;
  onSendTip: (user: { id: number; username: string }) => void;
}) {
  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer">
            <Avatar className="w-8 h-8" style={{ border: '2px solid #1F2937' }}>
              <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: '#111827', color: '#E3B341' }}>
                {message.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
          <DropdownMenuItem
            onClick={() => onViewProfile(message.userId)}
            className="cursor-pointer"
            style={{ color: '#F1F5F9' }}
          >
            <UserCircle className="w-4 h-4 mr-2" style={{ color: '#E3B341' }} />
            View Full Profile
          </DropdownMenuItem>
          {!isCurrentUser && (
            <DropdownMenuItem
              onClick={() => onSendTip({ id: message.userId, username: message.username })}
              className="cursor-pointer"
              style={{ color: '#F1F5F9' }}
            >
              <DollarSign className="w-4 h-4 mr-2" style={{ color: '#10B981' }} />
              Send Tip
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { user } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [newMessage, setNewMessage] = useState("");
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch global chat messages
  const { data: chatResponse, isLoading } = useQuery({
    queryKey: ['/api/chat/global'],
    queryFn: async () => {
      const response = await apiRequest("GET", '/api/chat/global');
      return response.json();
    },
    refetchInterval: 3000,
    enabled: isOpen && !!user,
    staleTime: 1000,
    gcTime: 5000,
  });

  const allMessages: ChatMessage[] = chatResponse?.data || [];
  const messages = allMessages.slice(-100);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await apiRequest("POST", '/api/chat/global', messageData);
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/global'] });
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
      message: newMessage.trim()
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

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="h-full w-full backdrop-blur-md shadow-xl flex flex-col overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 4rem)', backgroundColor: '#0F172A', borderLeft: '2px solid #1F2937' }}
    >
            {/* Header */}
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid #1F2937', backgroundColor: '#080C14' }}>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" style={{ color: '#E3B341' }} />
                <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Global Chat</span>
              </div>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-background/60"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

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
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      isCurrentUser={message.userId === user?.id}
                      onViewProfile={(userId) => navigate(`/people/${userId}`)}
                      onSendTip={(tipUser) => {
                        setSelectedUser(tipUser);
                        setTipDialogOpen(true);
                      }}
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
                  placeholder="Message everyone..."
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

      {/* Tip Dialog */}
      <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
        <DialogContent style={{ backgroundColor: '#0F172A', borderColor: '#1F2937' }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#10B981' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#080C14' }} />
              </div>
              <div>
                <DialogTitle style={{ color: '#F1F5F9' }}>Send Tip to {selectedUser?.username}</DialogTitle>
                <DialogDescription style={{ color: '#94A3B8' }}>
                  Send a tip from your balance to support this user.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tip-amount" style={{ color: '#F1F5F9' }}>Amount</Label>
              <Input
                id="tip-amount"
                type="number"
                placeholder="Enter amount"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                min="0.01"
                step="0.01"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              <p className="text-xs" style={{ color: '#94A3B8' }}>
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
              style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
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
              style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
            >
              {sendTipMutation.isPending ? "Sending..." : "Send Tip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default ChatSidebar;

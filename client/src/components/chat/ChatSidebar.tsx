import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

// Parse @mentions in message text and return React elements
function renderMessageWithMentions(
  text: string,
  users: { id: number; username: string }[],
  navigate: (path: string) => void
): React.ReactNode {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const mentionedUsername = match[1];
    const mentionedUser = users.find(
      (u) => u.username.toLowerCase() === mentionedUsername.toLowerCase()
    );

    if (mentionedUser) {
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="font-semibold cursor-pointer hover:underline"
          style={{ color: '#E3B341' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/people/${mentionedUser.id}`);
          }}
        >
          @{mentionedUser.username}
        </span>
      );
    } else {
      // Not a real user, render as plain text
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

const ChatMessageItem = React.memo(function ChatMessageItem({
  message,
  isCurrentUser,
  onViewProfile,
  onSendTip,
  users,
  navigate,
}: {
  message: ChatMessage;
  isCurrentUser: boolean;
  onViewProfile: (userId: number) => void;
  onSendTip: (user: { id: number; username: string }) => void;
  users: { id: number; username: string }[];
  navigate: (path: string) => void;
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
          <p className="text-xs break-words leading-snug" style={{ color: '#F1F5F9' }}>
            {renderMessageWithMentions(message.message, users, navigate)}
          </p>
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
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

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

  // Fetch users for mention autocomplete
  const { data: usersResponse } = useQuery({
    queryKey: ['/api/users/public'],
    enabled: isOpen && !!user,
    staleTime: 60000,
  });

  const allUsers: { id: number; username: string }[] = useMemo(() => {
    const raw = (usersResponse as any)?.data || [];
    return raw.map((u: any) => ({ id: u.id, username: u.username }));
  }, [usersResponse]);

  const allMessages: ChatMessage[] = chatResponse?.data || [];
  const messages = allMessages.slice(-100);

  // Filtered mention suggestions
  const mentionSuggestions = useMemo(() => {
    if (!mentionQuery) return allUsers.slice(0, 5);
    return allUsers
      .filter((u) => u.username.toLowerCase().includes(mentionQuery.toLowerCase()) && u.id !== user?.id)
      .slice(0, 5);
  }, [mentionQuery, allUsers, user?.id]);

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
    setShowMentions(false);
  };

  const handleSendTip = () => {
    if (!selectedUser || !tipAmount || parseFloat(tipAmount) <= 0) return;
    sendTipMutation.mutate({
      recipientId: selectedUser.id,
      amount: parseFloat(tipAmount)
    });
  };

  // Handle input change for mention detection
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check if user is typing a mention
    const cursorPos = e.target.selectionStart || value.length;
    const textUpToCursor = value.slice(0, cursorPos);
    const lastAtIndex = textUpToCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textUpToCursor[lastAtIndex - 1] : ' ';
      // Only trigger if @ is at start or after a space
      if (lastAtIndex === 0 || charBeforeAt === ' ') {
        const query = textUpToCursor.slice(lastAtIndex + 1);
        // Only show if no space in the query (still typing the username)
        if (!query.includes(' ')) {
          setMentionQuery(query);
          setShowMentions(true);
          setMentionIndex(0);
          return;
        }
      }
    }
    setShowMentions(false);
  }, []);

  // Insert mention into message
  const insertMention = useCallback((username: string) => {
    const cursorPos = inputRef.current?.selectionStart || newMessage.length;
    const textUpToCursor = newMessage.slice(0, cursorPos);
    const lastAtIndex = textUpToCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const before = newMessage.slice(0, lastAtIndex);
      const after = newMessage.slice(cursorPos);
      setNewMessage(`${before}@${username} ${after}`);
    }
    setShowMentions(false);
    inputRef.current?.focus();
  }, [newMessage]);

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showMentions || mentionSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
    } else if (e.key === 'Enter' && showMentions) {
      e.preventDefault();
      insertMention(mentionSuggestions[mentionIndex].username);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  }, [showMentions, mentionSuggestions, mentionIndex, insertMention]);

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
                <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{t('globalChat')}</span>
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
                      {t('noMessagesYet')}
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
                      users={allUsers}
                      navigate={navigate}
                    />
                  ))
                )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-3 relative" style={{ borderTop: '1px solid #1F2937', backgroundColor: 'rgba(8, 12, 20, 0.9)' }}>
              {/* Mention Autocomplete Dropdown */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-1 rounded-md overflow-hidden shadow-lg z-50"
                  style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}
                >
                  {mentionSuggestions.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-2 px-3 py-2 cursor-pointer text-xs"
                      style={{
                        backgroundColor: i === mentionIndex ? '#1F2937' : 'transparent',
                        color: '#F1F5F9',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(u.username);
                      }}
                      onMouseEnter={() => setMentionIndex(i)}
                    >
                      <Avatar className="w-5 h-5" style={{ border: '1px solid #1F2937' }}>
                        <AvatarFallback className="text-[8px] font-semibold" style={{ backgroundColor: '#0F172A', color: '#E3B341' }}>
                          {u.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium" style={{ color: '#E3B341' }}>@{u.username}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('messageEveryone')}
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
                <DialogTitle style={{ color: '#F1F5F9' }}>{t('sendTipTo')} {selectedUser?.username}</DialogTitle>
                <DialogDescription style={{ color: '#94A3B8' }}>
                  Send a tip from your balance to support this user.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tip-amount" style={{ color: '#F1F5F9' }}>{t('amount')}</Label>
              <Input
                id="tip-amount"
                type="number"
                placeholder={t('enterAmount')}
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                min="0.01"
                step="0.01"
                style={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#F1F5F9' }}
              />
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                {t('yourBalance')}: ${(Number(user?.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {t('cancel')}
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
              {sendTipMutation.isPending ? t('sending') : t('sendTip')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default ChatSidebar;

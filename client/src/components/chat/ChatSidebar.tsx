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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { apiRequest } from "@/lib/queryClient";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  profilePicture?: string | null;
  message: string;
  createdAt: string;
}

interface MessageGroup {
  userId: number;
  username: string;
  profilePicture?: string | null;
  firstMessageTimestamp: string;
  messages: ChatMessage[];
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
  onMentionClick: (userId: string) => void
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
          style={{ color: '#00A3FF' }}
          onClick={(e) => {
            e.stopPropagation();
            onMentionClick(String(mentionedUser.id));
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

// Group messages component - renders a group of consecutive messages from the same user
const ChatMessageGroup = React.memo(function ChatMessageGroup({
  group,
  isCurrentUser,
  onViewProfile,
  onSendTip,
  users,
  onMentionClick,
  shiftHeld,
}: {
  group: MessageGroup;
  isCurrentUser: boolean;
  onViewProfile: (userId: number) => void;
  onSendTip: (user: { id: number; username: string }) => void;
  users: { id: number; username: string }[];
  onMentionClick: (userId: string) => void;
  shiftHeld: boolean;
}) {
  return (
    <div className="flex space-x-2">
      {/* Avatar - self-start so it doesn't stretch */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer self-start">
            <Avatar className="w-9 h-9">
              {group.profilePicture && (
                <AvatarImage src={group.profilePicture} className="object-cover" />
              )}
              <AvatarFallback style={{ backgroundColor: '#0C1829' }}>
                <UserCircle className="w-5 h-5" style={{ color: '#4B5563' }} />
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
          <DropdownMenuItem
            onClick={() => onViewProfile(group.userId)}
            className="cursor-pointer"
            style={{ color: '#F1F5F9' }}
          >
            <UserCircle className="w-4 h-4 mr-2" style={{ color: '#00A3FF' }} />
            View Full Profile
          </DropdownMenuItem>
          {!isCurrentUser && (
            <DropdownMenuItem
              onClick={() => onSendTip({ id: group.userId, username: group.username })}
              className="cursor-pointer"
              style={{ color: '#F1F5F9' }}
            >
              <DollarSign className="w-4 h-4 mr-2" style={{ color: '#10B981' }} />
              Send Tip
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 min-w-0 space-y-0.5">
        {group.messages.map((msg, idx) => {
          const isFirst = idx === 0;
          return (
            <div key={msg.id}>
              {isFirst && (
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="text-sm font-bold" style={{ color: '#F1F5F9' }}>
                    {group.username}
                  </span>
                  {(() => {
                    const userInfo: any = users.find((u: any) => u.id === group.userId);
                    return userInfo?.subscriptionTier === 'administrator' ? (
                      <span
                        className="text-xs font-bold"
                        style={{
                          background: 'linear-gradient(90deg, #FF6B35, #F7931E, #FDC830, #F37335, #FF6B35)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          animation: 'gradientShift 3s ease infinite'
                        }}
                      >
                        Admin
                      </span>
                    ) : null;
                  })()}
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5" style={{ backgroundColor: '#00A3FF', color: '#091525' }}>You</Badge>
                  )}
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    {formatTimestamp(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className="group/msg flex items-center gap-1.5">
                <div className="backdrop-blur-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#0C1829', border: '1px solid #0E2040' }}>
                  <p className="text-sm whitespace-pre-wrap leading-normal" style={{
                    color: '#F1F5F9',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {renderMessageWithMentions(msg.message, users, onMentionClick)}
                  </p>
                </div>
                {/* Shift-hover timestamp for subsequent messages */}
                {!isFirst && shiftHeld && (
                  <span className="text-xs opacity-0 group-hover/msg:opacity-100 transition-opacity whitespace-nowrap" style={{ color: '#94A3B8' }}>
                    {formatTimestamp(msg.createdAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
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
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  // Shift key tracking for timestamp visibility
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(true); };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

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

  const allUsers: { id: number; username: string; subscriptionTier?: string }[] = useMemo(() => {
    const raw = (usersResponse as any)?.data || [];
    return raw.map((u: any) => ({ id: u.id, username: u.username, subscriptionTier: u.subscriptionTier }));
  }, [usersResponse]);

  const allMessages: ChatMessage[] = chatResponse?.data || [];
  const messages = allMessages.slice(-100);

  // Group consecutive messages from the same user within 10 minutes
  const messageGroups: MessageGroup[] = useMemo(() => {
    const groups: MessageGroup[] = [];
    const TEN_MINUTES = 10 * 60 * 1000;

    for (const msg of messages) {
      const lastGroup = groups[groups.length - 1];
      if (
        lastGroup &&
        lastGroup.userId === msg.userId &&
        new Date(msg.createdAt).getTime() - new Date(lastGroup.firstMessageTimestamp).getTime() < TEN_MINUTES
      ) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({
          userId: msg.userId,
          username: msg.username,
          profilePicture: msg.profilePicture,
          firstMessageTimestamp: msg.createdAt,
          messages: [msg],
        });
      }
    }
    return groups;
  }, [messages]);

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
      style={{ maxHeight: 'calc(100vh - 4rem)', backgroundColor: '#0C1829', borderLeft: '2px solid #0E2040' }}
    >
            {/* Header */}
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid #0E2040', backgroundColor: 'transparent' }}>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" style={{ color: '#00A3FF' }} />
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
              <ScrollArea ref={scrollAreaRef} className="h-full p-3" style={{ backgroundColor: 'rgba(10, 22, 44, 0.5)' }}>
                <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00A3FF', borderTopColor: 'transparent' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: '#94A3B8', opacity: 0.5 }} />
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                      {t('noMessagesYet')}
                    </p>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <ChatMessageGroup
                      key={`group-${group.messages[0].id}`}
                      group={group}
                      isCurrentUser={group.userId === user?.id}
                      onViewProfile={(userId) => setProfileUserId(String(userId))}
                      onSendTip={(tipUser) => {
                        setSelectedUser(tipUser);
                        setTipDialogOpen(true);
                      }}
                      users={allUsers}
                      onMentionClick={(userId) => setProfileUserId(userId)}
                      shiftHeld={shiftHeld}
                    />
                  ))
                )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-3 relative" style={{ borderTop: '1px solid #0E2040', backgroundColor: 'rgba(10, 18, 38, 0.92)' }}>
              {/* Mention Autocomplete Dropdown */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-1 rounded-md overflow-hidden shadow-lg z-50"
                  style={{ backgroundColor: '#0C1829', border: '1px solid #0E2040' }}
                >
                  {mentionSuggestions.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-2 px-3 py-2 cursor-pointer text-xs"
                      style={{
                        backgroundColor: i === mentionIndex ? '#0E2040' : 'transparent',
                        color: '#F1F5F9',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(u.username);
                      }}
                      onMouseEnter={() => setMentionIndex(i)}
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarFallback style={{ backgroundColor: '#0C1829' }}>
                          <UserCircle className="w-3 h-3" style={{ color: '#4B5563' }} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium" style={{ color: '#00A3FF' }}>@{u.username}</span>
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
                  style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-3 h-9"
                  style={{ backgroundColor: '#00A3FF', color: '#091525' }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs" style={{ color: '#94A3B8' }}>
                <span>{messages.length} messages</span>
                <span>{newMessage.length}/500</span>
              </div>
            </div>

      {/* Profile Modal */}
      <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />

      {/* Tip Dialog */}
      <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
        <DialogContent style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#10B981' }}>
                <DollarSign className="w-5 h-5" style={{ color: '#091525' }} />
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
                style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}
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
              style={{ backgroundColor: '#0C1829', borderColor: '#0E2040', color: '#F1F5F9' }}
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

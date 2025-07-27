import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageCircle, 
  Send, 
  X, 
  Users, 
  Globe, 
  Flag,
  Volume2,
  VolumeX,
  Settings
} from "lucide-react";

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  region: string;
}

interface RegionalChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function RegionalChat({ isOpen, onToggle }: RegionalChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("global");
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock regions - in a real app, these would come from an API
  const regions = [
    { id: "global", name: "Global", flag: "🌍", userCount: 1247 },
    { id: "us", name: "United States", flag: "🇺🇸", userCount: 423 },
    { id: "eu", name: "Europe", flag: "🇪🇺", userCount: 312 },
    { id: "asia", name: "Asia", flag: "🌏", userCount: 289 },
    { id: "crypto", name: "Crypto", flag: "₿", userCount: 156 },
  ];

  // Mock messages - in a real app, these would come from WebSocket
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        userId: 1,
        username: "TraderJoe",
        message: "AAPL looking strong today! 📈",
        timestamp: new Date(Date.now() - 300000),
        region: selectedRegion
      },
      {
        id: "2",
        userId: 2,
        username: "StockWatcher",
        message: "Anyone watching NVDA? Massive volume spike",
        timestamp: new Date(Date.now() - 240000),
        region: selectedRegion
      },
      {
        id: "3",
        userId: 3,
        username: "BullMarket",
        message: "Tesla earnings next week - expecting big moves",
        timestamp: new Date(Date.now() - 180000),
        region: selectedRegion
      }
    ];
    setMessages(mockMessages);
  }, [selectedRegion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.userId,
      username: user.displayName || user.username,
      message: newMessage,
      timestamp: new Date(),
      region: selectedRegion
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-16 bottom-0 w-80 bg-background border-l border-border shadow-2xl z-40"
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Regional Chat
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Region Selector */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {regions.map((region) => (
                  <Button
                    key={region.id}
                    variant={selectedRegion === region.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRegion(region.id)}
                    className="h-7 px-2 text-xs"
                  >
                    <span className="mr-1">{region.flag}</span>
                    {region.name}
                  </Button>
                ))}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="w-3 h-3 mr-1" />
                {regions.find(r => r.id === selectedRegion)?.userCount} online
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${
                      message.userId === user?.userId ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.userId === user?.userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.username}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              {user ? (
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Please log in to participate in chat
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
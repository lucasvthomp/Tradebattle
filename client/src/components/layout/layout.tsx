import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import { SimplifiedSidebar } from "./simplified-sidebar";
import { ChatPanel } from "./chat-panel";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Overlay for mobile when chat is open */}
      {chatOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden" 
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Header */}
      <Header onChatOpen={() => setChatOpen(true)} />

      {/* Simplified Sidebar - Only for authenticated users */}
      {user && <SimplifiedSidebar onChatOpen={() => setChatOpen(true)} />}

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        user ? 'ml-16' : ''
      } ${
        chatOpen ? 'lg:mr-80' : ''
      }`}>        
        <main className="relative pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
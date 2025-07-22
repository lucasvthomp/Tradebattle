import { useState } from "react";
import Header from "./header";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "./chat-panel";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Overlay for mobile when sidebar/chat is open */}
      {(sidebarOpen || chatOpen) && (
        <div 
          className="fixed inset-0 bg-black/60 overlay-blur z-30 lg:hidden animate-fade-in" 
          onClick={() => {
            setSidebarOpen(false);
            setChatOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : ''
      } ${
        chatOpen ? 'lg:mr-80' : ''
      }`}>
        <Header 
          onSidebarOpen={() => setSidebarOpen(true)}
          onChatOpen={() => setChatOpen(true)}
        />
        
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}
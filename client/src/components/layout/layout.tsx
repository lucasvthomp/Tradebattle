import { useAuth } from "@/hooks/use-auth";
import { useChatContext } from "@/contexts/ChatContext";
import Header from "./header";
import { SimplifiedSidebar } from "./simplified-sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { PageTransition } from "@/components/ui/page-transition";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { chatOpen, toggleChat } = useChatContext();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Simplified Sidebar - Only for authenticated users */}
      {user && <SimplifiedSidebar />}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header chatOpen={chatOpen} onChatToggle={toggleChat} />

        {/* Main Content Area with Chat */}
        <div className="flex flex-1 pt-16 min-h-0">
          {/* Main Content with Page Transitions */}
          <main className={`flex-1 min-h-screen transition-all duration-300 ${
            user && chatOpen ? 'mr-80' : ''
          }`}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          {/* Chat Sidebar - positioned in flow, not fixed */}
          {user && chatOpen && (
            <div className="w-80 flex-shrink-0">
              <ChatSidebar
                isOpen={chatOpen}
                onToggle={toggleChat}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
        <div className="flex flex-1 min-h-0" style={{ paddingTop: 'clamp(56px, 4.5vh, 72px)' }}>
          {/* Main Content with Page Transitions */}
          <main className="flex-1 min-h-screen transition-all duration-300" style={{
            marginRight: user && chatOpen ? 'clamp(280px, 22vw, 400px)' : '0'
          }}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          {/* Chat Sidebar - fixed position, independent of page scroll */}
          {user && chatOpen && (
            <div className="fixed right-0 z-40" style={{
              top: 'clamp(56px, 4.5vh, 72px)',
              width: 'clamp(280px, 22vw, 400px)',
              height: 'calc(100vh - clamp(56px, 4.5vh, 72px))'
            }}>
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
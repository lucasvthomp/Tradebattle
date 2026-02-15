import React, { Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChatContext } from "@/contexts/ChatContext";
import Header from "./header";
import { SimplifiedSidebar } from "./simplified-sidebar";
import { PageTransition } from "@/components/ui/page-transition";

const ChatSidebar = React.lazy(() => import("@/components/chat/ChatSidebar"));

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
          <main className={`flex-1 min-h-screen transition-all duration-300 px-2 md:px-0 overflow-x-hidden ${
            user ? 'md:ml-20' : ''
          } ${
            user && chatOpen ? 'md:mr-80' : ''
          }`}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          {/* Chat Sidebar - fixed position, independent of page scroll - Hidden on mobile portrait */}
          {user && chatOpen && (
            <div className="hidden md:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] z-40">
              <Suspense fallback={null}>
                <ChatSidebar
                  isOpen={chatOpen}
                  onToggle={toggleChat}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

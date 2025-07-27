
import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import { SimplifiedSidebar } from "./simplified-sidebar";


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Simplified Sidebar - Only for authenticated users */}
      {user && <SimplifiedSidebar />}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        user ? 'ml-16' : ''
      }`}>        
        <main className="relative pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
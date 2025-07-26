import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BalanceDialog } from "@/components/balance-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, Settings, LogOut, UserPlus, LogIn, Shield, Archive, DollarSign } from "lucide-react";
import { SidebarTrigger } from "./sidebar";
import { ChatTrigger } from "./chat-panel";

interface HeaderProps {
  onSidebarOpen: () => void;
  onChatOpen: () => void;
}

export default function Header({ onSidebarOpen, onChatOpen }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);

  return (
    <header className="gradient-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Left side - Sidebar trigger and Logo */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger onOpen={onSidebarOpen} />
            <Link href="/" className="flex items-center space-x-2 hover-lift transition-all duration-300">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center neon-glow animate-pulse-slow">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold gradient-text animate-glow">ORSATH</span>
            </Link>
          </div>

          {/* Right side - Profile, Auth, Chat */}
          <div className="flex items-center space-x-4">
{user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 btn-secondary hover-lift">
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {user?.displayName || user?.username || user?.email || "User"}
                      </span>
                      <span className="text-sm text-muted-foreground">|</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(user?.balance || 0)}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setBalanceDialogOpen(true)}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      My Balance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('settings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = "/archive"}>
                      <Archive className="w-4 h-4 mr-2" />
                      {t('archive')}
                    </DropdownMenuItem>
                    {(user.userId === 0 || user.userId === 1 || user.userId === 2) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      logoutMutation.mutate();
                    }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChatTrigger onOpen={onChatOpen} />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="btn-secondary hover-lift">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-primary hover-lift neon-glow">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <ChatTrigger onOpen={onChatOpen} />
              </>
            )}
          </div>
        </nav>
      </div>
      
      {/* Balance Dialog */}
      <BalanceDialog 
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        currentBalance={user?.balance || 0}
      />
    </header>
  );
}

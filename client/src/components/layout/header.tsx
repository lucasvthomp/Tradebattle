import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BalanceDialog } from "@/components/balance-dialog";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MarketStatus } from "@/components/market-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, LogOut, UserPlus, LogIn, DollarSign, Shield, MessageSquare, Plus, Minus } from "lucide-react";
interface HeaderProps {
  chatOpen?: boolean;
  onChatToggle?: () => void;
}

export default function Header({ chatOpen = false, onChatToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-muted" style={{
      backgroundColor: 'rgba(10, 26, 47, 0.98)',
      height: 'clamp(56px, 4.5vh, 72px)'
    }}>
      <div className="w-full h-full" style={{ padding: '0 clamp(16px, 2vw, 48px)' }}>
        <nav className="flex items-center justify-between h-full max-w-[1920px] mx-auto">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <Link href={user ? "/hub" : "/"} className="flex items-center transition-all duration-200 hover:opacity-80" style={{ gap: 'clamp(8px, 0.8vw, 12px)' }}>
              <div className="rounded-lg flex items-center justify-center bg-primary" style={{
                width: 'clamp(28px, 2.5vw, 40px)',
                height: 'clamp(28px, 2.5vw, 40px)'
              }}>
                <span className="font-bold text-background" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)' }}>O</span>
              </div>
              <span className="font-bold text-foreground" style={{ fontSize: 'clamp(18px, 1.8vw, 26px)' }}>ORSATH</span>
            </Link>

            {/* Market Status Clock */}
            <MarketStatus variant="clock" />
          </div>

          {/* Right side - Clean user info and actions */}
          <div className="flex items-center" style={{ gap: 'clamp(8px, 1vw, 16px)' }}>
            {user ? (
              <>
                {/* Balance Display - Clickable for balance management */}
                <Button
                  variant="ghost"
                  className="flex items-center justify-center hover:bg-yellow-500/10 transition-all rounded-lg"
                  style={{
                    height: 'clamp(36px, 2.5vw, 48px)',
                    padding: '0 clamp(12px, 1vw, 20px)',
                    border: 'clamp(1.5px, 0.15vw, 2.5px) solid #E3B341',
                    color: '#E3B341'
                  }}
                  onClick={() => setBalanceDialogOpen(true)}
                >
                  <DollarSign style={{
                    width: 'clamp(14px, 1.2vw, 20px)',
                    height: 'clamp(14px, 1.2vw, 20px)',
                    marginRight: 'clamp(4px, 0.3vw, 8px)',
                    color: '#E3B341'
                  }} />
                  <span className="font-bold" style={{
                    color: '#E3B341',
                    fontSize: 'clamp(14px, 1.1vw, 18px)'
                  }}>
                    {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Button>

                {/* Chat Button - only show for authenticated users */}
                {onChatToggle && (
                  <Button
                    onClick={onChatToggle}
                    variant="ghost"
                    className="p-0 flex items-center justify-center border border-border/30 hover:bg-muted/50 transition-colors rounded-lg"
                    style={{
                      width: 'clamp(36px, 2.5vw, 48px)',
                      height: 'clamp(36px, 2.5vw, 48px)'
                    }}
                  >
                    <MessageSquare style={{
                      width: 'clamp(18px, 1.3vw, 24px)',
                      height: 'clamp(18px, 1.3vw, 24px)'
                    }} />
                  </Button>
                )}

                {/* User Menu with integrated balance */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center border border-border/30 hover:bg-muted/50 transition-colors rounded-lg" style={{
                      height: 'clamp(36px, 2.5vw, 48px)',
                      padding: '0 clamp(10px, 0.8vw, 16px)',
                      gap: 'clamp(6px, 0.5vw, 10px)'
                    }}>
                      <User style={{
                        width: 'clamp(14px, 1.1vw, 18px)',
                        height: 'clamp(14px, 1.1vw, 18px)'
                      }} />
                      <span className="font-medium hidden sm:inline" style={{
                        fontSize: 'clamp(12px, 1vw, 16px)'
                      }}>
                        {user?.username || "User"}
                      </span>
                      <ChevronDown style={{
                        width: 'clamp(14px, 1.1vw, 18px)',
                        height: 'clamp(14px, 1.1vw, 18px)'
                      }} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS') && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin">
                          <DropdownMenuItem style={{ gap: 'clamp(6px, 0.5vw, 10px)' }}>
                            <Shield style={{
                              width: 'clamp(14px, 1.1vw, 18px)',
                              height: 'clamp(14px, 1.1vw, 18px)'
                            }} />
                            <span style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}>Admin</span>
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => {
                      logoutMutation.mutate();
                    }} style={{ gap: 'clamp(6px, 0.5vw, 10px)' }}>
                      <LogOut style={{
                        width: 'clamp(14px, 1.1vw, 18px)',
                        height: 'clamp(14px, 1.1vw, 18px)'
                      }} />
                      <span style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}>{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-muted/50 rounded-lg flex items-center" style={{
                    padding: 'clamp(8px, 0.8vw, 12px) clamp(12px, 1vw, 20px)',
                    fontSize: 'clamp(14px, 1.1vw, 18px)',
                    gap: 'clamp(6px, 0.5vw, 10px)'
                  }}>
                    <LogIn style={{
                      width: 'clamp(14px, 1.1vw, 18px)',
                      height: 'clamp(14px, 1.1vw, 18px)'
                    }} />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 rounded-lg flex items-center" style={{
                    padding: 'clamp(8px, 0.8vw, 12px) clamp(12px, 1vw, 20px)',
                    fontSize: 'clamp(14px, 1.1vw, 18px)',
                    gap: 'clamp(6px, 0.5vw, 10px)'
                  }}>
                    <UserPlus style={{
                      width: 'clamp(14px, 1.1vw, 18px)',
                      height: 'clamp(14px, 1.1vw, 18px)'
                    }} />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
      
      {/* Balance Dialog */}
      <BalanceDialog
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        currentBalance={Number(user?.siteCash) || 0}
      />
    </header>
  );
}

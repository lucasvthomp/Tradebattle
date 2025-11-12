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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-muted" style={{ backgroundColor: 'rgba(10, 26, 47, 0.98)' }}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center gap-3">
            <Link href={user ? "/hub" : "/"} className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <span className="font-bold text-sm text-background">O</span>
              </div>
              <span className="text-xl font-bold text-foreground">ORSATH</span>
            </Link>

            {/* Market Status Clock */}
            <MarketStatus variant="clock" />
          </div>

          {/* Right side - Clean user info and actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Balance Display - Clickable for balance management */}
                <Button
                  variant="ghost"
                  className="h-10 flex items-center justify-center px-4 hover:bg-yellow-500/10 transition-all border-2"
                  style={{
                    borderColor: '#E3B341',
                    color: '#E3B341'
                  }}
                  onClick={() => setBalanceDialogOpen(true)}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-sm font-bold">
                    {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Button>

                {/* Chat Button - only show for authenticated users */}
                {onChatToggle && (
                  <Button
                    onClick={onChatToggle}
                    variant="ghost"
                    className="h-10 w-10 p-0 flex items-center justify-center border border-border/30 hover:bg-muted/50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}

                {/* User Menu with integrated balance */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 flex items-center space-x-2 px-3 border border-border/30 hover:bg-muted/50 transition-colors">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.username || "User"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS') && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin">
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Admin
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => {
                      logoutMutation.mutate();
                    }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="px-4 py-2 hover:bg-muted/50">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 px-4 py-2">
                    <UserPlus className="w-4 h-4 mr-2" />
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

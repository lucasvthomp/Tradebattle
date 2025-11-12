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
import { User, ChevronDown, LogOut, UserPlus, LogIn, DollarSign, Shield, MessageSquare, Plus, Minus, Menu, X } from "lucide-react";
interface HeaderProps {
  chatOpen?: boolean;
  onChatToggle?: () => void;
}

export default function Header({ chatOpen = false, onChatToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

            {/* Market Status Clock - hide on mobile portrait */}
            <div className="hidden [@media(min-aspect-ratio:1/1)]:block">
              <MarketStatus variant="clock" />
            </div>
          </div>

          {/* Desktop navigation - hide on portrait mobile */}
          <div className="hidden [@media(min-aspect-ratio:1/1)]:flex items-center space-x-3">
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

          {/* Mobile hamburger button - show only on portrait */}
          <Button
            variant="ghost"
            className="[@media(min-aspect-ratio:1/1)]:hidden w-10 h-10 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>
      </div>

      {/* Mobile Menu Panel - show only on portrait */}
      {mobileMenuOpen && (
        <div className="[@media(min-aspect-ratio:1/1)]:hidden border-t border-border" style={{ backgroundColor: 'rgba(10, 26, 47, 0.98)' }}>
          <div className="container mx-auto px-4 py-4 space-y-3">
            {user ? (
              <>
                {/* Balance Display */}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-yellow-500/10 border-2"
                  style={{
                    borderColor: '#E3B341',
                    color: '#E3B341'
                  }}
                  onClick={() => {
                    setBalanceDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-bold">
                    {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Button>

                {/* Chat Button */}
                {onChatToggle && (
                  <Button
                    onClick={() => {
                      onChatToggle();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start h-12 border border-border/30 hover:bg-muted/50"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Chat</span>
                  </Button>
                )}

                {/* User Info */}
                <div className="pt-2 pb-2 border-t border-border">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user?.username || "User"}</span>
                  </div>
                </div>

                {/* Admin Link */}
                {(user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS') && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}

                {/* Logout */}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-destructive/10 text-destructive"
                  onClick={() => {
                    logoutMutation.mutate();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>{t('logout')}</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-muted/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    <span>Log In</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="w-full justify-start h-12 bg-primary hover:bg-primary/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Balance Dialog */}
      <BalanceDialog
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        currentBalance={Number(user?.siteCash) || 0}
      />
    </header>
  );
}

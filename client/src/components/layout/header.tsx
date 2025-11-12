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
      <div className="w-full px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-12">
        <nav className="flex items-center justify-between h-14 md:h-16 lg:h-18 xl:h-20 max-w-[2560px] mx-auto">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-5">
            <Link href={user ? "/hub" : "/"} className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-7 h-7 md:w-8 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-lg md:rounded-xl flex items-center justify-center bg-primary">
                <span className="font-bold text-xs md:text-sm lg:text-base xl:text-lg text-background">O</span>
              </div>
              <span className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-foreground">ORSATH</span>
            </Link>

            {/* Market Status Clock */}
            <MarketStatus variant="clock" />
          </div>

          {/* Right side - Clean user info and actions */}
          <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
            {user ? (
              <>
                {/* Balance Display - Clickable for balance management */}
                <Button
                  variant="ghost"
                  className="h-8 md:h-9 lg:h-10 xl:h-11 flex items-center justify-center px-2 md:px-3 lg:px-4 xl:px-5 hover:bg-yellow-500/10 transition-all text-xs md:text-sm lg:text-base rounded-md md:rounded-lg lg:rounded-xl"
                  style={{
                    border: '2px solid #E3B341',
                    color: '#E3B341'
                  }}
                  onClick={() => setBalanceDialogOpen(true)}
                >
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-0.5 md:mr-1" style={{ color: '#E3B341' }} />
                  <span className="font-bold" style={{ color: '#E3B341' }}>
                    {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Button>

                {/* Chat Button - only show for authenticated users */}
                {onChatToggle && (
                  <Button
                    onClick={onChatToggle}
                    variant="ghost"
                    className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11 p-0 flex items-center justify-center border border-border/30 hover:bg-muted/50 transition-colors rounded-md md:rounded-lg lg:rounded-xl"
                  >
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                  </Button>
                )}

                {/* User Menu with integrated balance */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 md:h-9 lg:h-10 xl:h-11 flex items-center space-x-1 md:space-x-2 px-2 md:px-3 lg:px-4 border border-border/30 hover:bg-muted/50 transition-colors rounded-md md:rounded-lg lg:rounded-xl">
                      <User className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      <span className="text-xs md:text-sm lg:text-base font-medium hidden sm:inline">
                        {user?.username || "User"}
                      </span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
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
                  <Button variant="ghost" className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 hover:bg-muted/50 text-sm md:text-base lg:text-lg rounded-md md:rounded-lg lg:rounded-xl">
                    <LogIn className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 text-sm md:text-base lg:text-lg rounded-md md:rounded-lg lg:rounded-xl">
                    <UserPlus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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

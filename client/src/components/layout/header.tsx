import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BalanceManagementModal } from "@/components/balance/BalanceManagementModal";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MarketStatus } from "@/components/market-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, LogOut, UserPlus, LogIn, DollarSign, Shield, MessageSquare, Plus, Minus, Menu, X, BarChart3, Trophy, Users as UsersIcon, Phone, Gift, Settings, Archive, Calendar, Swords } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
interface HeaderProps {
  chatOpen?: boolean;
  onChatToggle?: () => void;
}

export default function Header({ chatOpen = false, onChatToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceModalTab, setBalanceModalTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(13, 25, 45, 0.88)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25)' }}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center h-16 relative">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center gap-3">
            <Link href={user ? "/hub" : "/"} className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00A3FF, #0077CC)', boxShadow: '0 0 16px rgba(0, 163, 255, 0.25)' }}>
                <span className="font-black text-sm" style={{ color: '#FFFFFF' }}>O</span>
              </div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">ORSATH</span>
            </Link>

            {/* Market Status Clock - hide on mobile */}
            <div className="hidden md:block">
              <MarketStatus variant="clock" />
            </div>
          </div>

          {/* Center - Balance (absolutely centered in the bar) */}
          {user && (
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
              <Button
                variant="ghost"
                data-tour="balance"
                aria-label="Manage balance - Deposit or Withdraw"
                className="h-10 flex items-center justify-center px-4 hover:bg-primary/10 transition-all border-2 hover:scale-105"
                style={{
                  borderColor: 'rgba(0, 163, 255, 0.5)',
                  background: 'linear-gradient(135deg, rgba(0, 163, 255, 0.12), rgba(0, 163, 255, 0.04))',
                  color: '#00A3FF',
                  boxShadow: '0 0 16px rgba(0, 163, 255, 0.1)'
                }}
                onClick={() => {
                  setBalanceModalTab('deposit');
                  setBalanceModalOpen(true);
                }}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm font-bold">
                  {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </Button>
            </div>
          )}

          {/* Right side - Desktop navigation */}
          <div className="hidden md:flex items-center space-x-3 ml-auto">
            {user ? (
              <>
                {/* Notifications Bell */}
                <NotificationDropdown />

                {/* User Menu */}
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

                {/* Chat Button - only show for authenticated users */}
                {onChatToggle && (
                  <Button
                    onClick={onChatToggle}
                    variant="ghost"
                    aria-label="Toggle chat"
                    className="h-10 w-10 p-0 flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}
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
                  <Button className="px-4 py-2 text-white transition-transform hover:scale-105" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button - show only on mobile */}
          <Button
            variant="ghost"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-10 h-10 p-0 min-w-[44px] min-h-[44px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </nav>
      </div>

      {/* Mobile Menu Panel - show only on mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border" style={{ backgroundColor: 'rgba(13, 25, 45, 0.97)' }}>
          <div className="container mx-auto px-4 py-6 space-y-4">
            {user ? (
              <>
                {/* Balance & Deposit Section */}
                <div className="space-y-3 pb-4">
                  {/* Balance Display - Opens Deposit/Withdraw Modal */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-primary/10 border-2 px-4"
                    style={{
                      borderColor: 'rgba(0, 163, 255, 0.5)',
                      background: 'linear-gradient(135deg, rgba(0, 163, 255, 0.12), rgba(0, 163, 255, 0.04))',
                      color: '#00A3FF'
                    }}
                    onClick={() => {
                      setBalanceModalTab('deposit');
                      setBalanceModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-base">
                        {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs opacity-70">Tap to deposit or withdraw</span>
                    </div>
                  </Button>
                </div>

                {/* Navigation Section */}
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(15, 28, 50, 0.5)' }}>
                  <Link href="/hub">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-5 h-5 mr-3" style={{ color: '#28C76F' }} />
                      <span className="text-base">Hub</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-5 h-5 mr-3" style={{ color: '#28C76F' }} />
                      <span className="text-base">Dashboard</span>
                    </Button>
                  </Link>
                  <Link href="/tournaments">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Swords className="w-5 h-5 mr-3" style={{ color: '#E3B341' }} />
                      <span className="text-base">Tournaments</span>
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Trophy className="w-5 h-5 mr-3" style={{ color: '#E3B341' }} />
                      <span className="text-base">Leaderboard</span>
                    </Button>
                  </Link>
                  <Link href="/people">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UsersIcon className="w-5 h-5 mr-3" style={{ color: '#3B82F6' }} />
                      <span className="text-base">People</span>
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Gift className="w-5 h-5 mr-3" style={{ color: '#F97316' }} />
                      <span className="text-base">Rewards</span>
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Phone className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
                      <span className="text-base">Support</span>
                    </Button>
                  </Link>
                </div>

                {/* Chat Button */}
                {onChatToggle && (
                  <Button
                    onClick={() => {
                      onChatToggle();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start h-12 border border-border/30 hover:bg-muted/50 px-4"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <span className="text-base">Chat</span>
                  </Button>
                )}

                {/* User Section */}
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(15, 28, 50, 0.5)' }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <User className="w-5 h-5" />
                    <span className="font-medium text-base">{user?.username || "User"}</span>
                  </div>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
                      <span className="text-base">Settings</span>
                    </Button>
                  </Link>
                  <Link href="/archive">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Archive className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
                      <span className="text-base">Archive</span>
                    </Button>
                  </Link>

                  {/* Admin Link */}
                  {(user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS') && (
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        <span className="text-base">Admin</span>
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Logout - Separate with subtle divider */}
                <div className="pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-destructive/10 text-destructive px-4"
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-base">{t('logout')}</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    <span className="text-base">Log In</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="w-full justify-start h-12 text-white px-4"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    <span className="text-base">Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Balance Management Modal - Handles both Deposit and Withdraw */}
      <BalanceManagementModal
        isOpen={balanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        initialTab={balanceModalTab}
      />
    </header>
  );
}

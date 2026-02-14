import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BalanceDialog } from "@/components/balance-dialog";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MarketStatus } from "@/components/market-status";
import { DepositModal } from "@/components/deposit/DepositModal";
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
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(8, 12, 20, 0.95)', borderBottom: '1px solid rgba(227, 179, 65, 0.1)', boxShadow: '0 1px 20px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(227, 179, 65, 0.05)' }}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center gap-3">
            <Link href={user ? "/hub" : "/"} className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E3B341, #c99a35)', boxShadow: '0 0 16px rgba(227, 179, 65, 0.2)' }}>
                <span className="font-black text-sm" style={{ color: '#080C14' }}>O</span>
              </div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">ORSATH</span>
            </Link>

            {/* Market Status Clock - hide on mobile */}
            <div className="hidden md:block">
              <MarketStatus variant="clock" />
            </div>
          </div>

          {/* Desktop navigation - hide on mobile */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <NotificationDropdown />

                {/* Deposit Button */}
                <Button
                  variant="ghost"
                  className="h-10 flex items-center justify-center px-4 hover:bg-primary/10 transition-all border-2"
                  style={{
                    borderColor: 'rgba(227, 179, 65, 0.8)',
                    background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1), rgba(227, 179, 65, 0.05))',
                    color: '#E3B341'
                  }}
                  onClick={() => setDepositModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-bold">Deposit</span>
                </Button>

                {/* Balance Display */}
                <Button
                  variant="ghost"
                  data-tour="balance"
                  aria-label="View balance"
                  className="h-10 flex items-center justify-center px-4 hover:bg-primary/10 transition-all border-2"
                  style={{
                    borderColor: 'rgba(227, 179, 65, 0.4)',
                    color: '#E3B341'
                  }}
                  onClick={() => setBalanceDialogOpen(true)}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="text-sm font-bold">
                    {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </Button>

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
        <div className="md:hidden border-t border-border" style={{ backgroundColor: 'rgba(8, 12, 20, 0.95)' }}>
          <div className="container mx-auto px-4 py-6 space-y-4">
            {user ? (
              <>
                {/* Balance & Deposit Section */}
                <div className="space-y-3 pb-4">
                  {/* Balance Display */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-primary/10 border-2 px-4"
                    style={{
                      borderColor: 'rgba(227, 179, 65, 0.4)',
                      color: '#E3B341'
                    }}
                    onClick={() => {
                      setBalanceDialogOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <DollarSign className="w-5 h-5 mr-3" />
                    <span className="font-bold text-base">
                      {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </Button>

                  {/* Deposit Button */}
                  <Button
                    className="w-full justify-start h-12 rounded-lg text-white px-4"
                    style={{ background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}
                    onClick={() => {
                      navigate("/deposit");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    <span className="font-bold text-base">Deposit Funds</span>
                  </Button>
                </div>

                {/* Navigation Section */}
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(30, 45, 63, 0.3)' }}>
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
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(30, 45, 63, 0.3)' }}>
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

      {/* Balance Dialog */}
      <BalanceDialog
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        currentBalance={Number(user?.siteCash) || 0}
      />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </header>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { BalanceManagementModal } from "@/components/balance/BalanceManagementModal";
import { MarketStatus } from "@/components/market-status";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TradebattleIcon } from "@/components/tradebattle-icons";
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
  const isPublicSite = !user;

  return (
    <header className="tradebattle-header fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(5, 17, 31, 0.9)', borderBottom: '1px solid rgba(103, 231, 191, 0.14)', boxShadow: '0 10px 32px rgba(0, 0, 0, 0.24)' }}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center h-16 relative">
          {/* Left side - Logo and Market Status */}
          <div className="flex items-center gap-3">
            <Link href={user ? "/hub" : "/"} className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9af1d1, #42c99f)', boxShadow: '0 0 18px rgba(98, 228, 189, 0.2)' }}>
                <span className="font-black text-sm" style={{ color: '#06151c' }}>T</span>
              </div>
              <span className="tradebattle-header-brand text-xl font-display font-bold tracking-tight" style={{ color: '#F2FBF8' }}>TRADEBATTLE</span>
            </Link>

            {/* Market Status Clock - hide on mobile */}
            {user && <div className="hidden md:block">
              <MarketStatus variant="clock" />
            </div>}
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
                  borderColor: 'rgba(103, 231, 191, 0.42)',
                  background: 'linear-gradient(135deg, rgba(103, 231, 191, 0.14), rgba(103, 231, 191, 0.04))',
                  color: '#67E7BF',
                  boxShadow: '0 0 18px rgba(103, 231, 191, 0.1)'
                }}
                onClick={() => {
                  setBalanceModalTab('deposit');
                  setBalanceModalOpen(true);
                }}
              >
                <TradebattleIcon name="cash" className="w-4 h-4 mr-1" />
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
                {onChatToggle && (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={chatOpen ? "Close chat" : "Open chat"}
                    onClick={onChatToggle}
                    className={`h-10 w-10 p-0 ${chatOpen ? "bg-primary/10" : ""}`}
                    style={{ color: chatOpen ? "#67E7BF" : "#AFC2D0" }}
                  >
                    <TradebattleIcon name="chat" className="w-4 h-4" />
                  </Button>
                )}
                <NotificationDropdown />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 flex items-center space-x-2 px-3 border border-border/30 hover:bg-muted/50 transition-colors">
                      <TradebattleIcon name="user" className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.username || "User"}
                      </span>
                      <TradebattleIcon name="chevron-down" className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {(user?.subscriptionTier === 'administrator' || user?.username === 'LUCAS') && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin">
                          <DropdownMenuItem>
                            <TradebattleIcon name="admin" className="w-4 h-4 mr-2" />
                            Admin
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => {
                      logoutMutation.mutate();
                    }}>
                      <TradebattleIcon name="logout" className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="px-4 py-2 hover:bg-muted/50">
                    <TradebattleIcon name="login" className="w-4 h-4 mr-2" />
                    Enter arena
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="px-4 py-2 transition-transform hover:scale-105" style={{ background: '#62E4BD', color: '#06151c', boxShadow: '0 8px 22px rgba(98, 228, 189, 0.18)' }}>
                    <TradebattleIcon name="user"Plus className="w-4 h-4 mr-2" />
                    Create profile
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button - show only on mobile */}
          <Button
            variant="ghost"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden ml-auto w-10 h-10 p-0 min-w-[44px] min-h-[44px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <TradebattleIcon name="close" className="w-5 h-5" /> : <TradebattleIcon name="menu" className="w-5 h-5" />}
          </Button>
        </nav>
      </div>

      {/* Mobile Menu Panel - show only on mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'rgba(5, 17, 31, 0.98)', borderColor: 'rgba(103, 231, 191, 0.14)' }}>
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
                      borderColor: 'rgba(103, 231, 191, 0.42)',
                      background: 'linear-gradient(135deg, rgba(103, 231, 191, 0.14), rgba(103, 231, 191, 0.04))',
                      color: '#67E7BF'
                    }}
                    onClick={() => {
                      setBalanceModalTab('deposit');
                      setBalanceModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <TradebattleIcon name="cash" className="w-5 h-5 mr-3" />
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-base">
                        {(Number(user.siteCash) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs opacity-70">Tap to add capital or cash out</span>
                    </div>
                  </Button>
                </div>

                {/* Navigation Section */}
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(10, 30, 43, 0.82)', border: '1px solid rgba(103, 231, 191, 0.1)' }}>
                  <Link href="/hub">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="rankings" className="w-5 h-5 mr-3" style={{ color: '#67E7BF' }} />
                      <span className="text-base">Home</span>
                    </Button>
                  </Link>
                  <Link href="/tournaments">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutGrid className="w-5 h-5 mr-3" style={{ color: '#67E7BF' }} />
                      <span className="text-base">Arenas</span>
                    </Button>
                  </Link>
                  <Link href="/blitz">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="blitz" className="w-5 h-5 mr-3" style={{ color: '#9AB5C2' }} />
                      <span className="text-base">Blitz</span>
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="rankings" className="w-5 h-5 mr-3" style={{ color: '#67E7BF' }} />
                      <span className="text-base">Rankings</span>
                    </Button>
                  </Link>
                  <Link href="/people">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="players" className="w-5 h-5 mr-3" style={{ color: '#3B82F6' }} />
                      <span className="text-base">Players</span>
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="rewards" className="w-5 h-5 mr-3" style={{ color: '#F97316' }} />
                      <span className="text-base">Loadout</span>
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="support" className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
                      <span className="text-base">Help</span>
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
                    <TradebattleIcon name="chat" className="w-5 h-5 mr-3" />
                    <span className="text-base">Chat</span>
                  </Button>
                )}

                {/* User Section */}
                <div className="rounded-lg px-2 py-3 space-y-1" style={{ backgroundColor: 'rgba(10, 30, 43, 0.82)', border: '1px solid rgba(103, 231, 191, 0.1)' }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <TradebattleIcon name="user" className="w-5 h-5" />
                    <span className="font-medium text-base">{user?.username || "User"}</span>
                  </div>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="settings" className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
                      <span className="text-base">Settings</span>
                    </Button>
                  </Link>
                  <Link href="/archive">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-muted/50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TradebattleIcon name="archive" className="w-5 h-5 mr-3" style={{ color: '#94A3B8' }} />
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
                        <TradebattleIcon name="admin" className="w-5 h-5 mr-3" />
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
                    <TradebattleIcon name="logout" className="w-5 h-5 mr-3" />
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
                    <TradebattleIcon name="login" className="w-5 h-5 mr-3" />
                    <span className="text-base">Enter arena</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="w-full justify-start h-12 px-4"
                    style={{ background: '#62E4BD', color: '#06151c' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TradebattleIcon name="user"Plus className="w-5 h-5 mr-3" />
                    <span className="text-base" style={{ color: '#06151c' }}>Create profile</span>
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

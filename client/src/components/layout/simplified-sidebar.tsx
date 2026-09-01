import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  Trophy,
  Users,
  Phone,
  Gift,
  Settings,
  Archive,
  Shield,
  Swords,
  Zap,
  Menu
} from "lucide-react";
import { useState } from "react";
import { CodeRedemptionDialog } from "@/components/code-redemption-dialog";

export function SimplifiedSidebar() {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const navItems = [
    ...(user ? [
      { href: "/hub", label: t('hub'), icon: Home, iconColor: '#67E7BF' },
      { href: "/tournaments", label: t('tournaments'), icon: Swords, iconColor: '#67E7BF' },
      { href: "/blitz", label: "Blitz", icon: Zap, iconColor: '#F2C76A' },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy, iconColor: '#F2C76A' },
      { href: "/people", label: t('people'), icon: Users, iconColor: '#8EB6D1' },
      { href: "/shop", label: "Rewards", icon: Gift, iconColor: '#F2C76A' },
      { href: "/contact", label: t('support'), icon: Phone, iconColor: '#94A3B8' },
    ] : [
      { href: "/contact", label: t('support'), icon: Phone, iconColor: '#94A3B8' },
    ]),
  ];

  const userItems = user ? [
    { href: "/profile", label: t('settings'), icon: Settings, iconColor: '#94A3B8' },
    { href: "/archive", label: t('archive'), icon: Archive, iconColor: '#94A3B8' },
    ...(user.subscriptionTier === 'administrator' || user.username === 'LUCAS' ? [
      { href: "/admin", label: "Admin", icon: Shield, iconColor: '#EF4444' }
    ] : [])
  ] : [];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const renderNavItem = (item: typeof navItems[0]) => (
    <div key={item.href}>
      <Link
        href={item.href}
        {...(item.href === "/tournaments" ? { "data-tour": "nav-tournaments" } : {})}
        className={`group flex items-center rounded-lg transition-colors duration-200 ${
          isActive(item.href) ? "sidebar-active-indicator" : "hover:bg-[#1A3A68] hover:text-white"
        }`}
        style={{
          height: '44px',
          paddingLeft: '14px',
          flexShrink: 0,
          ...(isActive(item.href)
            ? { backgroundColor: 'rgba(103, 231, 191, 0.1)', color: '#67E7BF' }
            : { color: '#8A9CAF' }),
        }}
      >
        <item.icon
          className="w-5 h-5 flex-shrink-0"
          style={{
            color: isActive(item.href) ? item.iconColor : undefined,
            marginRight: expanded ? '12px' : '0',
            transition: 'margin 300ms ease',
          }}
        />
        <span
          className="text-base font-medium whitespace-nowrap overflow-hidden"
          style={{
            opacity: expanded ? 1 : 0,
            maxWidth: expanded ? '160px' : '0',
            transition: 'opacity 200ms ease, max-width 300ms ease',
          }}
        >
          {item.label}
        </span>
      </Link>
    </div>
  );

  return (
    <>
      <div
        data-tour="sidebar"
        className="tradebattle-sidebar hidden md:flex flex-col fixed left-0 top-16 h-[calc(100dvh-4rem)] backdrop-blur-md border-r z-40"
        style={{
          width: expanded ? '256px' : '64px',
          backgroundColor: '#071522',
          borderColor: 'rgba(103, 231, 191, 0.13)',
          transition: 'width 300ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Menu Toggle Button at top */}
        <div className="flex-shrink-0 p-2 border-b" style={{ borderColor: 'rgba(103, 231, 191, 0.13)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center hover:bg-[#1A3A68] rounded-lg transition-colors duration-200"
            style={{
              height: '44px',
              width: '100%',
              paddingLeft: '14px',
              color: '#C9D1E2',
            }}
          >
            <Menu
              className="w-5 h-5 flex-shrink-0"
              style={{
                marginRight: expanded ? '12px' : '0',
                transition: 'margin 300ms ease',
              }}
            />
            <span
              className="text-base font-medium whitespace-nowrap overflow-hidden"
              style={{
                opacity: expanded ? 1 : 0,
                maxWidth: expanded ? '160px' : '0',
                transition: 'opacity 200ms ease, max-width 300ms ease',
              }}
            >
              Menu
            </span>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {navItems.map(renderNavItem)}
          </nav>

          {/* Separator */}
          {user && (
            <div className="mx-2 my-2 h-px" style={{ backgroundColor: 'rgba(103, 231, 191, 0.13)' }} />
          )}

          {/* User Actions */}
          {user && (
            <nav className="p-2 space-y-1">
              {userItems.map(renderNavItem)}
            </nav>
          )}
        </div>

        {/* Code Redemption - Pinned at bottom, never overlaps */}
        {user && (
          <div className="flex-shrink-0 p-2 border-t" style={{ borderColor: 'rgba(103, 231, 191, 0.13)' }}>
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className="transition-all duration-200 hover:brightness-110 w-full flex items-center"
              style={{
                background: 'linear-gradient(135deg, #67E7BF, #2EBF9A)',
                height: '44px',
                paddingLeft: '14px',
                paddingRight: '8px',
                justifyContent: 'flex-start',
              }}
            >
              <Gift
                className="w-5 h-5 flex-shrink-0"
                style={{
                  marginRight: expanded ? '12px' : '0',
                  transition: 'margin 300ms ease',
                }}
              />
              <span
                className="text-base font-medium whitespace-nowrap overflow-hidden"
                style={{
                  opacity: expanded ? 1 : 0,
                  maxWidth: expanded ? '140px' : '0',
                  transition: 'opacity 200ms ease, max-width 300ms ease',
                  color: '#C9D1E2',
                }}
              >
                Redeem Code
              </span>
            </Button>
          </div>
        )}

        <CodeRedemptionDialog
          open={codeDialogOpen}
          onOpenChange={setCodeDialogOpen}
        />
      </div>
    </>
  );
}

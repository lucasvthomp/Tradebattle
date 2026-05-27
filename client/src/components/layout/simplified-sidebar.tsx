import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
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
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3, iconColor: '#28C76F' },
      { href: "/tournaments", label: t('tournaments'), icon: Swords, iconColor: '#E3B341' },
      { href: "/blitz", label: "Blitz", icon: Zap, iconColor: '#8B5CF6' },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy, iconColor: '#E3B341' },
      { href: "/people", label: t('people'), icon: Users, iconColor: '#3B82F6' },
      { href: "/shop", label: "Rewards", icon: Gift, iconColor: '#F97316' },
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
          isActive(item.href) ? "sidebar-active-indicator" : "hover:bg-[#091525] hover:text-white"
        }`}
        style={{
          height: '48px',
          paddingLeft: '14px',
          ...(isActive(item.href)
            ? { backgroundColor: 'rgba(227, 179, 65, 0.1)', color: '#E3B341' }
            : { color: '#8A93A6' }),
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
        className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-40"
        style={{
          width: expanded ? '256px' : '64px',
          backgroundColor: '#0C1A2E',
          borderColor: '#0E2040',
          transition: 'width 300ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Menu Toggle Button at top */}
        <div className="p-2 border-b" style={{ borderColor: '#0E2040' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center hover:bg-[#091525] rounded-lg transition-colors duration-200"
            style={{
              height: '48px',
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

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Separator */}
        {user && (
          <div className="mx-2 my-2 h-px" style={{ backgroundColor: '#0E2040' }} />
        )}

        {/* User Actions */}
        {user && (
          <nav className="p-2 space-y-1">
            {userItems.map(renderNavItem)}
          </nav>
        )}

        {/* Code Redemption - Bottom */}
        {user && (
          <div className="absolute bottom-4 left-2 right-2">
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className={`transition-all duration-200 hover:brightness-110 ${
                expanded ? 'w-full px-4 py-3' : 'w-12 h-12 p-0 mx-auto'
              }`}
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#06121F',
              }}
            >
              {expanded ? (
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-5 h-5" style={{ color: '#06121F' }} />
                  <span className="text-base font-semibold">Redeem Code</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Gift className="w-5 h-5" style={{ color: '#06121F' }} />
                </div>
              )}
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

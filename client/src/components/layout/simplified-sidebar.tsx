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

  const renderNavItem = (item: typeof navItems[0]) => {
    const active = isActive(item.href);
    return (
      <div key={item.href}>
        <Link
          href={item.href}
          {...(item.href === "/tournaments" ? { "data-tour": "nav-tournaments" } : {})}
          className="group flex items-center rounded-lg transition-colors duration-200"
          style={{
            height: '44px',
            paddingLeft: '14px',
            paddingRight: expanded ? '12px' : '14px',
            backgroundColor: active ? 'rgba(227, 179, 65, 0.1)' : undefined,
            color: active ? '#E3B341' : '#8A93A6',
          }}
        >
          {/* Icon — always in the same spot */}
          <item.icon
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              color: active ? item.iconColor : undefined,
            }}
          />
          {/* Label — slides in to the right of icon */}
          <span
            className="text-base font-medium whitespace-nowrap"
            style={{
              marginLeft: expanded ? '12px' : '0px',
              maxWidth: expanded ? '160px' : '0px',
              opacity: expanded ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-width 300ms ease, opacity 200ms ease, margin-left 300ms ease',
            }}
          >
            {item.label}
          </span>
        </Link>
      </div>
    );
  };

  return (
    <>
      <div
        data-tour="sidebar"
        className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-40"
        style={{
          backgroundColor: '#0B1120',
          borderColor: '#1F2937',
          width: expanded ? '224px' : '52px',
          transition: 'width 300ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Menu Toggle */}
        <div className="border-b" style={{ borderColor: '#1F2937' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center hover:bg-[#0F172A] rounded-lg transition-colors duration-200"
            style={{
              height: '44px',
              width: '100%',
              paddingLeft: '14px',
              color: '#C9D1E2',
            }}
          >
            <Menu style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <span
              className="text-base font-medium whitespace-nowrap"
              style={{
                marginLeft: expanded ? '12px' : '0px',
                maxWidth: expanded ? '160px' : '0px',
                opacity: expanded ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-width 300ms ease, opacity 200ms ease, margin-left 300ms ease',
              }}
            >
              Menu
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-1 space-y-0.5">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Separator */}
        {user && (
          <div className="mx-2 my-1 h-px" style={{ backgroundColor: '#1F2937' }} />
        )}

        {/* User Actions */}
        {user && (
          <nav className="p-1 space-y-0.5">
            {userItems.map(renderNavItem)}
          </nav>
        )}

        {/* Code Redemption - Bottom */}
        {user && (
          <div className="absolute bottom-4 left-2 right-2">
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className="transition-all duration-200 hover:brightness-110 w-full"
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#06121F',
                height: '44px',
                minWidth: 0,
                padding: expanded ? '0 16px' : '0',
                justifyContent: expanded ? 'flex-start' : 'center',
              }}
            >
              <Gift style={{ width: '20px', height: '20px', flexShrink: 0, color: '#06121F' }} />
              <span
                className="text-base font-semibold whitespace-nowrap"
                style={{
                  marginLeft: expanded ? '10px' : '0px',
                  maxWidth: expanded ? '160px' : '0px',
                  opacity: expanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-width 300ms ease, opacity 200ms ease, margin-left 300ms ease',
                  color: '#06121F',
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

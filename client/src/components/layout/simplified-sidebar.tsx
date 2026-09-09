import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import type { IconType } from "react-icons";
import {
  FaArchive,
  FaBars,
  FaBolt,
  FaCog,
  FaFlagCheckered,
  FaGift,
  FaHome,
  FaPhone,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
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
      { href: "/hub", label: t('hub'), icon: FaHome },
      { href: "/tournaments", label: t('tournaments'), icon: FaFlagCheckered },
      { href: "/blitz", label: "Blitz", icon: FaBolt },
      { href: "/leaderboard", label: t('leaderboard'), icon: FaTrophy },
      { href: "/people", label: t('people'), icon: FaUsers },
      { href: "/shop", label: "Rewards", icon: FaGift },
    ] : [
      { href: "/contact", label: t('support'), icon: FaPhone },
    ]),
  ];

  const userItems = user ? [
    { href: "/profile", label: t('settings'), icon: FaCog },
    { href: "/contact", label: t('support'), icon: FaPhone },
    { href: "/archive", label: t('archive'), icon: FaArchive },
    ...(user.subscriptionTier === 'administrator' || user.subscriptionTier === 'admin' ? [
      { href: "/admin", label: "Admin", icon: FaShieldAlt }
    ] : [])
  ] : [];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const renderNavItem = (item: { href: string; label: string; icon: IconType }) => (
    <div key={item.href}>
      <Link
        href={item.href}
        {...(item.href === "/tournaments" ? { "data-tour": "nav-tournaments" } : {})}
        title={expanded ? undefined : item.label}
        className={`group flex items-center rounded-lg transition-colors duration-200 ${
            isActive(item.href) ? "sidebar-active-indicator" : "hover:bg-[var(--tb-purple-wash)] hover:text-white"
        }`}
        style={{
          height: '44px',
          paddingLeft: '14px',
          flexShrink: 0,
            ...(isActive(item.href)
            ? { backgroundColor: 'var(--tb-purple-wash)', color: 'var(--tb-text-strong)' }
            : { color: 'var(--tb-text-muted)' }),
        }}
      >
        <item.icon
          aria-hidden="true"
          className="sidebar-nav-icon h-5 w-5 flex-shrink-0"
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
          {item.label}
        </span>
      </Link>
    </div>
  );

  return (
    <>
      <div
        data-tour="sidebar"
        className={`tradebattle-sidebar ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'} hidden md:flex flex-col fixed left-0 top-16 h-[calc(100dvh-4rem)] backdrop-blur-md border-r z-40`}
        style={{
          width: expanded ? '256px' : '64px',
          backgroundColor: 'var(--tb-surface-850)',
          borderColor: 'var(--tb-purple-edge)',
          transition: 'width 300ms ease',
          overflow: 'hidden',
        }}
      >
        {/* Menu Toggle Button at top */}
        <div className="flex-shrink-0 p-2 border-b" style={{ borderColor: 'var(--tb-purple-edge)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center hover:bg-[var(--tb-purple-wash)] rounded-lg transition-colors duration-200"
            style={{
              height: '44px',
              width: '100%',
              paddingLeft: '14px',
              color: 'var(--tb-text)',
            }}
          >
            <FaBars
              aria-hidden="true"
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
            <div className="mx-2 my-2 h-px" style={{ backgroundColor: 'var(--tb-purple-edge)' }} />
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
          <div className="flex-shrink-0 p-2 border-t" style={{ borderColor: 'var(--tb-purple-edge)' }}>
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
              <FaGift
                aria-hidden="true"
                className="sidebar-nav-icon h-5 w-5 flex-shrink-0"
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
                  color: 'var(--tb-purple-950)',
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

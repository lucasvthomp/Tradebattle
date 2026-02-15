import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
    <motion.div key={item.href} whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <Link
        href={item.href}
        {...(item.href === "/tournaments" ? { "data-tour": "nav-tournaments" } : {})}
        className={`group flex items-center rounded-lg transition-all duration-200 ${
          expanded ? 'px-3 py-3' : 'w-12 h-12 justify-center mx-auto'
        } ${
          isActive(item.href)
            ? "sidebar-active-indicator"
            : "hover:bg-[#0F172A] hover:text-white"
        }`}
        style={
          isActive(item.href)
            ? { backgroundColor: 'rgba(227, 179, 65, 0.1)', color: '#E3B341' }
            : { color: '#8A93A6' }
        }
      >
        <item.icon
          className={`w-5 h-5 ${expanded ? 'mr-3' : ''} transition-all duration-200`}
          style={{ color: isActive(item.href) ? item.iconColor : undefined }}
        />
        {expanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="text-base font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Sidebar - Always visible with icons, expands on click */}
      <div
        data-tour="sidebar"
        className={`hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-40 transition-all duration-300 ease-in-out ${
          expanded ? 'w-64' : 'w-16'
        }`}
        style={{
          backgroundColor: '#0B1120',
          borderColor: '#1F2937'
        }}
      >
        {/* Menu Toggle Button at top */}
        <div className="p-2 border-b" style={{ borderColor: '#1F2937' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-12 h-12 flex items-center justify-center hover:bg-[#0F172A] rounded-lg transition-all duration-200 mx-auto"
            style={{ color: '#C9D1E2' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Separator */}
        {user && (
          <div className="mx-2 my-2 h-px" style={{ backgroundColor: '#1F2937' }} />
        )}

        {/* User Actions */}
        {user && (
          <nav className="p-2 space-y-1">
            {userItems.map(renderNavItem)}
          </nav>
        )}

        {/* Code Redemption - Bottom */}
        {user && (
          <div className={`absolute bottom-4 ${expanded ? 'left-2 right-2' : 'left-2 right-2'}`}>
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className={`transition-all duration-200 hover:brightness-110 ${
                expanded ? 'w-full px-4 py-3' : 'w-12 h-12 p-0 mx-auto'
              }`}
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#080C14'
              }}
            >
              {expanded ? (
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span className="text-base font-semibold">Redeem Code</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Code Redemption Dialog */}
        <CodeRedemptionDialog
          open={codeDialogOpen}
          onOpenChange={setCodeDialogOpen}
        />
      </div>

      {/* Main Content Spacing handled by layout.tsx */}
    </>
  );
}

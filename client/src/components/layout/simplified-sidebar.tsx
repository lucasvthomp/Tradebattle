import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Home,
  BarChart3,
  Briefcase,
  Trophy,
  Users,
  Phone,
  Gift,
  Gift,
  Settings,
  Archive,
  Shield,
  Calendar,
  Target,
  Swords
} from "lucide-react";
import { useState } from "react";
import { CodeRedemptionDialog } from "@/components/code-redemption-dialog";

export function SimplifiedSidebar() {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const navItems = [
    ...(user ? [
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3, iconColor: '#28C76F' },
      { href: "/tournaments", label: t('tournaments'), icon: Swords, iconColor: '#E3B341' },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy, iconColor: '#E3B341' },
      { href: "/people", label: t('people'), icon: Users, iconColor: '#3B82F6' },
      { href: "/events", label: t('events'), icon: Calendar, iconColor: '#A855F7' },
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
        className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
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
          className={`w-5 h-5 ${expanded ? 'mr-3' : ''} transition-colors duration-200`}
          style={{ color: isActive(item.href) ? item.iconColor : undefined }}
        />
        {expanded && (
          <span className="text-sm font-medium whitespace-nowrap">
            {item.label}
          </span>
        )}
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Mobile: Hamburger Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed left-4 top-20 z-50 w-10 h-10 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: '#111827',
          border: '2px solid #1F2937'
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="w-5 h-0.5" style={{ backgroundColor: '#E3B341' }}></div>
          <div className="w-5 h-0.5" style={{ backgroundColor: '#E3B341' }}></div>
          <div className="w-5 h-0.5" style={{ backgroundColor: '#E3B341' }}></div>
        </div>
      </button>

      {/* Mobile: Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, shown when menu open */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-40 transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${expanded ? 'w-56' : 'w-16'}
        `}
        style={{
          backgroundColor: '#0B1120',
          borderColor: '#1F2937'
        }}
        onMouseEnter={() => !mobileMenuOpen && setExpanded(true)}
        onMouseLeave={() => !mobileMenuOpen && setExpanded(false)}
      >
        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Separator */}
        {user && (
          <div className="mx-3 my-3 h-px" style={{ backgroundColor: '#1F2937' }} />
        )}

        {/* User Actions */}
        {user && (
          <nav className="p-3 space-y-1">
            {userItems.map(renderNavItem)}
          </nav>
        )}

        {/* Code Redemption - Bottom */}
        {user && (
          <div className="absolute bottom-4 left-3 right-3">
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className={`w-full transition-all duration-200 hover:brightness-110 ${
                expanded
                  ? 'px-4 py-2'
                  : 'p-3 aspect-square'
              }`}
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#080C14'
              }}
              size={expanded ? "default" : "icon"}
            >
              {expanded ? (
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">Redeem Code</span>
                </div>
              ) : (
                <Gift className="w-4 h-4" />
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

      {/* Main Content Spacing - Only on desktop */}
      <div className={`hidden md:block transition-all duration-300 ${expanded ? 'ml-56' : 'ml-16'}`} />
    </>
  );
}

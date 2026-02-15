import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { CodeRedemptionDialog } from "@/components/code-redemption-dialog";

export function SimplifiedSidebar() {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const renderNavItem = (item: typeof navItems[0]) => (
    <motion.div key={item.href} whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <Link
        href={item.href}
        onClick={handleNavClick}
        {...(item.href === "/tournaments" ? { "data-tour": "nav-tournaments" } : {})}
        className={`group flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
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
          className="w-6 h-6 mr-3 transition-colors duration-200"
          style={{ color: isActive(item.href) ? item.iconColor : undefined }}
        />
        <span className="text-base font-medium whitespace-nowrap">
          {item.label}
        </span>
      </Link>
    </motion.div>
  );

  return (
    <>
      {/* Menu Toggle Button - Always visible */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="fixed left-4 top-20 z-50 hidden md:flex"
        style={{ color: '#E3B341' }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 hidden md:block"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Slides in from left when opened */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            data-tour="sidebar"
            className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-50 w-64"
            style={{
              backgroundColor: '#0B1120',
              borderColor: '#1F2937'
            }}
          >
            {/* Navigation Items */}
            <nav className="p-4 space-y-1">
              {navItems.map(renderNavItem)}
            </nav>

            {/* Separator */}
            {user && (
              <div className="mx-4 my-3 h-px" style={{ backgroundColor: '#1F2937' }} />
            )}

            {/* User Actions */}
            {user && (
              <nav className="p-4 space-y-1">
                {userItems.map(renderNavItem)}
              </nav>
            )}

            {/* Code Redemption - Bottom */}
            {user && (
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  onClick={() => {
                    setCodeDialogOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full transition-all duration-200 hover:brightness-110 px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                    color: '#080C14'
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-base font-semibold">Redeem Code</span>
                  </div>
                </Button>
              </div>
            )}

            {/* Code Redemption Dialog */}
            <CodeRedemptionDialog
              open={codeDialogOpen}
              onOpenChange={setCodeDialogOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
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
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3 },
      { href: "/tournaments", label: t('tournaments'), icon: Swords },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy },
      { href: "/people", label: t('people'), icon: Users },
      { href: "/events", label: t('events'), icon: Calendar },
      { href: "/shop", label: "Rewards", icon: Gift },
      { href: "/contact", label: t('support'), icon: Phone },
    ] : [
      { href: "/contact", label: t('support'), icon: Phone },
    ]),
  ];

  const userItems = user ? [
    { href: "/profile", label: t('settings'), icon: Settings },
    { href: "/archive", label: t('archive'), icon: Archive },
    ...(user.subscriptionTier === 'administrator' || user.username === 'LUCAS' ? [
      { href: "/admin", label: "Admin", icon: Shield }
    ] : [])
  ] : [];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

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
          <div className="w-5 h-0.5" style={{ backgroundColor: '#06B6D4' }}></div>
          <div className="w-5 h-0.5" style={{ backgroundColor: '#06B6D4' }}></div>
          <div className="w-5 h-0.5" style={{ backgroundColor: '#06B6D4' }}></div>
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
        <nav className="p-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "border"
                  : "hover:text-foreground"
              }`}
              style={
                isActive(item.href)
                  ? { backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06B6D4', borderColor: 'rgba(6, 182, 212, 0.3)' }
                  : { color: '#94A3B8' }
              }
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = '#0F172A';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8A93A6';
                }
              }}
            >
              <item.icon className={`w-5 h-5 ${expanded ? 'mr-3' : ''}`} />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Separator */}
        {user && (
          <div className="mx-3 my-3 h-px" style={{ backgroundColor: '#1F2937' }} />
        )}

        {/* User Actions */}
        {user && (
          <nav className="p-3 space-y-2">
            {userItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "border"
                    : "hover:text-foreground"
                }`}
                style={
                  isActive(item.href)
                    ? { backgroundColor: 'rgba(227, 179, 65, 0.15)', color: '#E3B341', borderColor: 'rgba(227, 179, 65, 0.3)' }
                    : { color: '#8A93A6' }
                }
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <item.icon className={`w-5 h-5 ${expanded ? 'mr-3' : ''}`} />
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        )}

        {/* Code Redemption - Bottom */}
        {user && (
          <div className="absolute bottom-4 left-3 right-3">
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className={`w-full transition-all duration-200 ${
                expanded
                  ? 'px-4 py-2'
                  : 'p-3 aspect-square'
              }`}
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#080C14'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
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
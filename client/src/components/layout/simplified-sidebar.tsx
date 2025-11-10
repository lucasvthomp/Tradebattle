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
  ShoppingBag,
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
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const navItems = [
    ...(user ? [
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3 },
      { href: "/tournaments", label: t('tournaments'), icon: Swords },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy },
      { href: "/people", label: t('people'), icon: Users },
      { href: "/events", label: t('events'), icon: Calendar },
      { href: "/shop", label: t('shop'), icon: ShoppingBag },
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
      {/* Simplified Always-Visible Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-md border-r z-30 transition-all duration-300 ease-in-out ${
          expanded ? 'w-64' : 'w-16'
        }`}
        style={{ backgroundColor: '#0D1F33', borderColor: '#2B3A4C' }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
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
                  ? { backgroundColor: 'rgba(227, 179, 65, 0.15)', color: '#E3B341', borderColor: 'rgba(227, 179, 65, 0.3)' }
                  : { color: '#8A93A6' }
              }
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.backgroundColor = '#142538';
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
          <div className="mx-3 my-3 h-px" style={{ backgroundColor: '#2B3A4C' }} />
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
                    e.currentTarget.style.backgroundColor = '#142538';
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
                backgroundColor: '#E3B341',
                color: '#0A1A2F'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4a136';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E3B341';
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

      {/* Main Content Spacing */}
      <div className={`transition-all duration-300 ${expanded ? 'ml-64' : 'ml-16'}`} />
    </>
  );
}
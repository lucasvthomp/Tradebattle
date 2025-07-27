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
  Shield
} from "lucide-react";
import { useState } from "react";
import { CodeRedemptionDialog } from "@/components/code-redemption-dialog";

interface SimplifiedSidebarProps {
  onChatOpen: () => void;
}

export function SimplifiedSidebar({ onChatOpen }: SimplifiedSidebarProps) {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    ...(user ? [
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3 },
      { href: "/portfolio", label: t('portfolio'), icon: Briefcase },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy },
      { href: "/people", label: t('people'), icon: Users },
      { href: "/shop", label: "Shop", icon: ShoppingBag },
    ] : []),
    { href: "/contact", label: "Support", icon: Phone },
  ];

  const userItems = user ? [
    { href: "/profile", label: t('settings'), icon: Settings },
    { href: "/archive", label: t('archive'), icon: Archive },
    ...(user.subscriptionTier === 'administrator' ? [
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
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border z-30 transition-all duration-300 ease-in-out ${
          expanded ? 'w-64' : 'w-16'
        }`}
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
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
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
          <div className="mx-3 my-3 h-px bg-border" />
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
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
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
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 aspect-square'
              }`}
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
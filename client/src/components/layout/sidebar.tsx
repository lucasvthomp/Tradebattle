import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  BarChart3, 
  Briefcase, 
  Trophy, 
  Users, 
  Crown, 
  Phone, 
  Menu,
  X,
  ShoppingBag,
  Gift,
  Target
} from "lucide-react";
import { useState } from "react";
import { CodeRedemptionDialog } from "@/components/code-redemption-dialog";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useUserPreferences();
  const [location] = useLocation();
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    ...(user ? [
      { href: "/dashboard", label: t('dashboard'), icon: BarChart3 },
      { href: "/portfolio", label: t('portfolio'), icon: Briefcase },
      { href: "/tournaments", label: t('tournaments'), icon: Target },
      { href: "/leaderboard", label: t('leaderboard'), icon: Trophy },
      { href: "/people", label: t('people'), icon: Users },
      { href: "/shop", label: "Shop", icon: ShoppingBag },

    ] : []),
    { href: "/contact", label: "Support", icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="w-64 h-full gradient-card border-r border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center neon-glow">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <span className="text-lg font-bold gradient-text">ORSATH</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover-lift"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-nav-item flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover-lift ${
                isActive(item.href)
                  ? "gradient-primary text-primary-foreground neon-glow font-semibold"
                  : "text-muted-foreground hover:text-foreground hover-glow"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Code Redemption Button - Only for authenticated users */}
        {user && (
          <div className="p-4 border-t border-border">
            <Button
              onClick={() => setCodeDialogOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover-lift neon-glow"
              size="lg"
            >
              <div className="flex items-center justify-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>Redeem Code</span>
              </div>
            </Button>
          </div>
        )}

        {/* Code Redemption Dialog */}
        <CodeRedemptionDialog 
          open={codeDialogOpen}
          onOpenChange={setCodeDialogOpen}
        />
      </div>
    </div>
  );
}

export function SidebarTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onOpen}
      className="hover-lift neon-glow"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
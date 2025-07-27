import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BalanceDialog } from "@/components/balance-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, LogOut, UserPlus, LogIn, DollarSign } from "lucide-react";
import { ChatTrigger } from "./chat-panel";

interface HeaderProps {
  onChatOpen: () => void;
}

export default function Header({ onChatOpen }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { t, formatCurrency } = useUserPreferences();
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Left side - Logo only */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold text-foreground">ORSATH</span>
            </Link>
          </div>

          {/* Right side - Clean user info and actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Balance Display */}
                <Button 
                  variant="ghost" 
                  onClick={() => setBalanceDialogOpen(true)}
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  {formatCurrency(Number(user?.balance) || 0)}
                </Button>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-muted/50">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.displayName || user?.username || "User"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setBalanceDialogOpen(true)}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      My Balance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      logoutMutation.mutate();
                    }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <ChatTrigger onOpen={onChatOpen} />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="px-4 py-2 hover:bg-muted/50">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 px-4 py-2">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <ChatTrigger onOpen={onChatOpen} />
              </>
            )}
          </div>
        </nav>
      </div>
      
      {/* Balance Dialog */}
      <BalanceDialog 
        open={balanceDialogOpen}
        onOpenChange={setBalanceDialogOpen}
        currentBalance={Number(user?.balance) || 0}
      />
    </header>
  );
}

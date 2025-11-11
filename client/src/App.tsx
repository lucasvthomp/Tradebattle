import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PageLoader } from "@/components/ui/page-loader";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import UnauthenticatedHome from "@/pages/unauthenticated-home";
import Hub from "@/pages/hub";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import Tournaments from "@/pages/tournaments";
import TournamentsTest from "@/pages/tournaments-test";
import Leaderboard from "@/pages/leaderboard";
import People from "@/pages/people";
import Events from "@/pages/events";
import Shop from "@/pages/shop";
import Withdraw from "@/pages/withdraw";

import Contact from "@/pages/contact";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Archive from "@/pages/archive";
import Layout from "@/components/layout/layout";
import Footer from "@/components/layout/footer";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle page transitions
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // 400ms transition

    return () => clearTimeout(timer);
  }, [location]);

  if (isLoading) {
    return <PageLoader />;
  }

  // Hide footer on dashboard and portfolio pages (dashboard route)
  const shouldShowFooter = !['/', '/dashboard', '/portfolio'].includes(location) || !user;

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && <PageLoader key="loader" />}
      </AnimatePresence>

      <Layout>
        <Switch>
          {!user ? (
            <>
              {/* Unauthenticated users see the conversion-focused home page */}
              <Route path="/" component={UnauthenticatedHome} />
              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
            </>
          ) : (
            <>
              {/* Authenticated users: root redirects to dashboard, hub accessible via logo */}
              <Route path="/" component={Dashboard} />
              <Route path="/hub" component={Hub} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/portfolio" component={Dashboard} />
              <Route path="/tournaments" component={Tournaments} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/people" component={People} />
              <Route path="/people/:userId" component={People} />
              <Route path="/events" component={Events} />
              <Route path="/shop" component={Shop} />
              <Route path="/withdraw" component={Withdraw} />

              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/profile" component={Profile} />
              <Route path="/admin" component={Admin} />
              <Route path="/archive" component={Archive} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
        {shouldShowFooter && <Footer />}
      </Layout>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserPreferencesProvider>
          <ThemeProvider defaultTheme="dark" storageKey="orsath-ui-theme">
            <ChatProvider>
              <TooltipProvider>
                <Router />
                <Toaster />
              </TooltipProvider>
            </ChatProvider>
          </ThemeProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

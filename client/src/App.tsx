import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import UnauthenticatedHome from "@/pages/unauthenticated-home";
import Hub from "@/pages/hub";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import Tournaments from "@/pages/tournaments";
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // AUTH DISABLED: Always show authenticated routes
  const AUTH_DISABLED = true;

  return (
    <Layout>
      <Switch>
        {/* Always show authenticated routes when auth is disabled */}
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

        <Route component={NotFound} />
      </Switch>
      <Footer />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserPreferencesProvider>
          <ThemeProvider defaultTheme="dark" storageKey="orsath-ui-theme">
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

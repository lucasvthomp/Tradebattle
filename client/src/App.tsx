import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { Suspense, lazy } from "react";

// Eager load critical components
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Layout from "@/components/layout/layout";
import Footer from "@/components/layout/footer";

// Lazy load less critical components
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Portfolio = lazy(() => import("@/pages/portfolio"));
const Tournaments = lazy(() => import("@/pages/tournaments"));
const Leaderboard = lazy(() => import("@/pages/leaderboard"));
const People = lazy(() => import("@/pages/people"));
const Events = lazy(() => import("@/pages/events"));
const Shop = lazy(() => import("@/pages/shop"));
const Contact = lazy(() => import("@/pages/contact"));
const About = lazy(() => import("@/pages/about"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Profile = lazy(() => import("@/pages/profile"));
const Admin = lazy(() => import("@/pages/admin"));
const Archive = lazy(() => import("@/pages/archive"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Enhanced loading skeleton with smooth animations
const PageSkeleton = () => (
  <div className="min-h-screen">
    <div className="h-16 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse border-b"></div>
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-3">
        <div className="h-8 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse rounded w-1/3"></div>
        <div className="h-4 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse rounded w-2/3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse rounded-lg"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          {/* Home route always shows landing page */}
          <Route path="/" component={Landing} />
          
          {!user ? (
            <>
              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
            </>
          ) : (
            <>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/portfolio" component={Portfolio} />
              <Route path="/tournaments" component={Tournaments} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/people" component={People} />
              <Route path="/people/:userId" component={People} />
              <Route path="/events" component={Events} />
              <Route path="/shop" component={Shop} />

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
      </Suspense>
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

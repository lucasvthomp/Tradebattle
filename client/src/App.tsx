import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Header from "@/components/layout/header";
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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
              <Route path="/contact" component={Contact} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/profile" component={Profile} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="orsath-ui-theme">
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

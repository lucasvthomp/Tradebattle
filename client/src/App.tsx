import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Studies from "@/pages/studies";
import News from "@/pages/news";
import Dashboard from "@/pages/dashboard";
import Contact from "@/pages/contact";
import Pricing from "@/pages/pricing";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
          {!isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/studies" component={Studies} />
              <Route path="/news" component={News} />
              <Route path="/contact" component={Contact} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/auth" component={Auth} />
            </>
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/studies" component={Studies} />
              <Route path="/news" component={News} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/contact" component={Contact} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/about" component={About} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/profile" component={Profile} />
              <Route path="/auth" component={Auth} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

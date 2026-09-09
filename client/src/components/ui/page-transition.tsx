import { useLocation } from "wouter";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return <div key={location} className="page-transition" data-route={location}>{children}</div>;
}

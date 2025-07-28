import { useAuth } from "@/hooks/use-auth";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

export default function Portfolio() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <PortfolioGrid />
    </div>
  );
}
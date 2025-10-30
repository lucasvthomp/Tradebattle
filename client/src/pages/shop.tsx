import { Construction } from "lucide-react";

export default function Shop() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Construction className="w-24 h-24 mx-auto text-orange-500 mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-2">Under Construction</h1>
        <p className="text-muted-foreground text-lg">This page is currently being built. Check back soon!</p>
      </div>
    </div>
  );
}

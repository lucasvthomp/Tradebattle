import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Premium() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access Premium features</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Premium Features</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Coming soon - Enhanced trading features and exclusive tools
          </p>
          
          <div className="bg-card border rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Premium Features Under Development</h2>
            <p className="text-muted-foreground">
              This section will include premium subscription features and advanced trading tools.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
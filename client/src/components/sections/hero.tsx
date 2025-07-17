import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2">
                Compete. Trade. Win.
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground">
                No risk, all reward.
              </p>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Compete with traders worldwide using virtual portfolios and real market data.
              Test your skills, climb the leaderboards, and win prizes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => window.location.href = "/signup"}
              >
                Start Trading
              </Button>
              <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

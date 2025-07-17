import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    "Zero financial risk - trade with virtual money",
    "Real market data and live stock prices",
    "Achievement system with unlockable badges",
    "Competitive leaderboards and rankings",
    "Personal portfolio tracking and analytics",
    "Tournament system with automated expiration",
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose Our Platform</h2>
              <p className="text-muted-foreground mb-6">
                Master the art of trading without risking real money. Join competitive tournaments, 
                track your progress through achievements, and climb the leaderboards while learning 
                from experienced traders in a completely safe environment.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-5 h-5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-lg p-6 h-80">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Platform Stats</h3>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">$10,000</div>
                    <div className="text-sm text-muted-foreground">Starting Virtual Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">17</div>
                    <div className="text-sm text-muted-foreground">Total Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">3</div>
                    <div className="text-sm text-muted-foreground">Leaderboard Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                    <div className="text-sm text-muted-foreground">Market Data Updates</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

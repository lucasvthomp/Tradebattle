import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import StockTicker from "@/components/ui/stock-ticker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Trophy, Target, Users, BarChart3, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div>
      <StockTicker />
      <Hero />
      <About />
      
      {/* Competition Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-foreground mb-6">Competition Features</h2>
                <p className="text-xl text-muted-foreground">
                  Everything you need to compete in paper trading competitions
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Trophy,
                  title: "Leaderboards",
                  description: "Track your ranking against other participants with real-time updates",
                  color: "text-yellow-600"
                },
                {
                  icon: BarChart3,
                  title: "Performance Analytics",
                  description: "Detailed portfolio analytics and performance metrics",
                  color: "text-blue-600"
                },
                {
                  icon: Target,
                  title: "Competition Management",
                  description: "Join active competitions or create your own private contests",
                  color: "text-green-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <feature.icon className={`mr-3 w-8 h-8 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-foreground mb-6">How It Works</h2>
                <p className="text-xl text-muted-foreground">
                  Start competing in paper trading competitions in three simple steps
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  icon: Users,
                  title: "Join Competition",
                  description: "Join your friends' contests with a unique code or browse available competitions",
                },
                {
                  step: "2",
                  icon: DollarSign,
                  title: "Trade with Virtual Money",
                  description: "Use your virtual portfolio to buy and sell stocks with real market prices",
                },
                {
                  step: "3",
                  icon: Trophy,
                  title: "Compete & Win",
                  description: "Track your performance on leaderboards and win based on your returns",
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                          {step.step}
                        </div>
                      </div>
                      <step.icon className="w-8 h-8 mx-auto mb-4 text-foreground" />
                      <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of traders competing in paper trading competitions
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

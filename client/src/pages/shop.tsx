import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag,
  Zap,
  Star,
  Clock,
  Wrench,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Shop() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          {...fadeInUp}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/hub">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Hub
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <ShoppingBag className="w-8 h-8 mr-3 text-primary" />
                  Trading Shop
                </h1>
                <p className="text-muted-foreground mt-1">
                  Power-ups and enhancements coming soon
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Wrench className="w-4 h-4 mr-1" />
              Work in Progress
            </Badge>
          </div>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Shop Coming Soon!
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                We're building an amazing shop where you can purchase power-ups, 
                trading tools, and exclusive features to enhance your trading experience.
              </p>
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Expected Launch: Q2 2025</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              title: "Trading Boosters",
              description: "Temporary multipliers for tournament performance",
              icon: Zap,
              color: "text-yellow-500"
            },
            {
              title: "Premium Analytics",
              description: "Advanced charts and market analysis tools",
              icon: Star,
              color: "text-blue-500"
            },
            {
              title: "Custom Themes",
              description: "Personalize your trading dashboard appearance",
              icon: ShoppingBag,
              color: "text-purple-500"
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Stay Updated */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Be the First to Know
              </h3>
              <p className="text-muted-foreground mb-4">
                Get notified when the shop launches with exclusive early access
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Notify Me
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
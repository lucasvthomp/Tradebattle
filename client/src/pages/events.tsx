import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Trophy,
  Clock,
  Users,
  Star,
  Wrench,
  ArrowLeft,
  Sparkles,
  Target,
  Bell
} from "lucide-react";
import { Link } from "wouter";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Events() {
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
                  <Calendar className="w-8 h-8 mr-3 text-primary" />
                  Special Events
                </h1>
                <p className="text-muted-foreground mt-1">
                  Exclusive trading competitions and seasonal challenges
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
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Special Events Coming Soon!
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
                Get ready for exclusive trading competitions, seasonal challenges, 
                and special tournaments with amazing prizes and unique trading scenarios.
              </p>
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Clock className="w-5 h-5" />
                <span className="font-medium">First Event: March 2025</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Event Types */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              title: "Monthly Mega Tournament",
              description: "Large-scale tournaments with massive prize pools",
              icon: Trophy,
              color: "text-yellow-500",
              participants: "1000+ Traders",
              prize: "$10,000 Pool"
            },
            {
              title: "Weekend Blitz",
              description: "Fast-paced 48-hour trading challenges",
              icon: Sparkles,
              color: "text-blue-500",
              participants: "500+ Traders",
              prize: "Premium Rewards"
            },
            {
              title: "Seasonal Challenges",
              description: "Special themed competitions throughout the year",
              icon: Target,
              color: "text-green-500",
              participants: "Open to All",
              prize: "Exclusive Badges"
            },
            {
              title: "Celebrity Trader Events",
              description: "Trade alongside famous investors and influencers",
              icon: Star,
              color: "text-purple-500",
              participants: "Limited Spots",
              prize: "Meet & Greet"
            },
            {
              title: "Charity Tournaments",
              description: "Trade for a cause with proceeds going to charity",
              icon: Users,
              color: "text-red-500",
              participants: "Community Driven",
              prize: "Good Karma"
            },
            {
              title: "Learning Workshops",
              description: "Educational events with expert traders and analysts",
              icon: Calendar,
              color: "text-orange-500",
              participants: "All Levels",
              prize: "Knowledge & Skills"
            }
          ].map((event, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center">
                    <event.icon className={`w-5 h-5 ${event.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  {event.description}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-medium">{event.participants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rewards:</span>
                    <span className="font-medium">{event.prize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Notification Signup */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Don't Miss Out on Special Events
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to know about upcoming events, early registration, and exclusive invites
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
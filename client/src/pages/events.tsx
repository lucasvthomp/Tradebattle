import { Calendar, Clock, MapPin, Users, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Events() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold text-foreground">Events</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover upcoming trading competitions, workshops, and community events. Connect with fellow traders and enhance your skills.
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
              <Star className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Coming Soon</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're working hard to bring you an amazing events experience. Soon you'll be able to join:
            </p>
            
            {/* Feature Preview Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-card/50 border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span>Live Trading Competitions</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time tournaments with prizes and recognition
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-card/50 border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Community Workshops</span>
                  </CardTitle>
                  <CardDescription>
                    Learning sessions with expert traders and analysts
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-card/50 border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span>Weekly Challenges</span>
                  </CardTitle>
                  <CardDescription>
                    Short-term trading challenges with themed strategies
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="bg-card/50 border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span>Virtual Meetups</span>
                  </CardTitle>
                  <CardDescription>
                    Connect with traders from around the world
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Launch Expected: Q2 2025
              </Badge>
              <p className="text-sm text-muted-foreground">
                Want to be notified when events go live? Stay tuned to your dashboard for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
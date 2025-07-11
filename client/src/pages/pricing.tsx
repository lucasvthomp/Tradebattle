import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, BookOpen } from "lucide-react";

const tiers = [
  {
    name: "Novice",
    price: "Free",
    period: "forever",
    description: "Perfect for beginners getting started with investment research",
    icon: <BookOpen className="w-6 h-6" />,
    features: [
      "Limited watchlist (5 equities)",
      "Limited news access",
      "Email support",
      "Basic market insights"
    ],
    popular: false,
    color: "from-green-900 to-green-800"
  },
  {
    name: "Explorer",
    price: "$9.99",
    period: "per month",
    description: "Perfect for individual investors starting their qualitative research journey",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Access to 50+ research studies monthly",
      "Basic market news and insights",
      "Email support",
      "Basic portfolio tracking",
      "Weekend market analysis"
    ],
    popular: false,
    color: "from-gray-900 to-gray-800"
  },
  {
    name: "Analyst",
    price: "$19.99",
    period: "per month",
    description: "Ideal for active investors and financial professionals",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Everything in Explorer",
      "Unlimited research studies access",
      "Priority breaking news alerts",
      "Advanced portfolio analytics",
      "Instant email news alerts",
      "Customer support"
    ],
    popular: true,
    color: "from-blue-900 to-blue-800"
  },
  {
    name: "Professional",
    price: "$49.99",
    period: "per month",
    description: "Comprehensive solution for investment firms and professionals",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Everything in Analyst",
      "Custom research reports",
      "Priority support"
    ],
    popular: false,
    color: "from-purple-900 to-purple-800"
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.section 
        className="py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 text-black"
            variants={fadeInUp}
          >
            Choose Your Research Tier
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Unlock the power of qualitative investment research with our comprehensive tier system designed for every level of investor.
          </motion.p>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <motion.section 
        className="py-12 px-4"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className={`relative ${tier.popular ? 'lg:scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full border-2 ${tier.popular ? 'border-blue-600' : 'border-gray-200'} relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5`} />
                  
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full bg-gradient-to-br ${tier.color} text-white`}>
                        {tier.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-black">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      {tier.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-black">{tier.price}</span>
                      <span className="text-gray-600 ml-2">{tier.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-6 text-lg font-semibold ${
                        tier.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : tier.name === 'Novice'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      onClick={() => alert(`You selected the ${tier.name} plan! ${tier.name === 'Novice' ? 'Sign up now to get started for free!' : 'Contact us at info@orsath.com to get started.'}`)}
                    >
                      {tier.name === 'Novice' ? 'Start Free' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="py-20 px-4 bg-gray-50"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-black"
            variants={fadeInUp}
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-3 text-black">Can I switch tiers anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your tier at any time. Changes take effect immediately and billing is prorated.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-3 text-black">Is there a free plan?</h3>
              <p className="text-gray-600">
                Yes! Our Novice plan is completely free and includes limited watchlist (5 equities), limited news access, and email support.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-3 text-black">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and wire transfers for institutional accounts.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h3 className="text-xl font-semibold mb-3 text-black">How do custom research reports work?</h3>
              <p className="text-gray-600">
                Professional tier subscribers can request custom research reports on specific companies or sectors through our platform.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Clock, HelpCircle, BookOpen, MessageCircle, Shield, Zap, Users, TrendingUp, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Support() {
  const { toast } = useToast();
  const { t } = useUserPreferences();
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your message has been sent successfully! We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      contactSchema.parse(formData);
      setErrors({});
      contactMutation.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<ContactForm> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ContactForm] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create my first portfolio?",
          answer: "Sign up for ORSATH, then navigate to your Dashboard. You'll automatically receive $10,000 in virtual money to start trading. Use the search function to find stocks and click 'Buy' to build your portfolio."
        },
        {
          question: "What's the difference between tournaments and personal portfolio?",
          answer: "Tournaments are competitive events with specific timeframes where you compete against other traders. Personal portfolio is your ongoing trading account where you can practice anytime without competition pressure."
        },
        {
          question: "How do I join a tournament?",
          answer: "Go to your Dashboard and look for available tournaments. Click 'Join Tournament' and enter the tournament code. You'll receive a separate virtual balance for each tournament you join."
        }
      ]
    },
    {
      category: "Trading & Portfolio",
      questions: [
        {
          question: "Is my money at risk?",
          answer: "No! ORSATH uses only virtual money for paper trading. You never risk real money - it's a safe environment to learn and practice trading strategies."
        },
        {
          question: "How often are stock prices updated?",
          answer: "Stock prices are updated in real-time during market hours for all users."
        },
        {
          question: "Can I sell my stocks anytime?",
          answer: "Yes, you can buy and sell stocks anytime during your trading session. Your transactions are processed immediately with current market prices."
        },
        {
          question: "How are my portfolio gains calculated?",
          answer: "Your gains are calculated as (Current Portfolio Value - Initial Deposit). This includes both your cash balance and the current value of your stock holdings."
        }
      ]
    },
    {
      category: "Account Features",
      questions: [
        {
          question: "What features are available?",
          answer: "All users have access to tournament participation, personal portfolio trading, watchlists, leaderboards, and real-time market data."
        },
        {
          question: "How do I create tournaments?",
          answer: "Visit the tournaments page to create and manage your own trading competitions. All users can participate in any tournament."
        },
        {
          question: "Can I change my display name?",
          answer: "Yes! Go to your Profile page, click on Account Settings, and update your display name. This name appears on leaderboards and public profiles."
        }
      ]
    }
  ];

  const helpResources = [
    {
      title: "Quick Start Guide",
      description: "Get up and running with your first trades in 5 minutes",
      icon: Zap,
      items: ["Create account", "Join tournament", "Buy your first stock", "Track performance"]
    },
    {
      title: "Trading Basics",
      description: "Learn fundamental trading concepts and strategies",
      icon: BookOpen,
      items: ["Stock selection", "Portfolio balance", "Risk management", "Market analysis"]
    },
    {
      title: "Competition Rules",
      description: "Understand tournament formats and scoring",
      icon: Users,
      items: ["Tournament types", "Scoring system", "Time limits", "Fair play rules"]
    },
    {
      title: "Platform Features",
      description: "Master all ORSATH tools and capabilities",
      icon: TrendingUp,
      items: ["Portfolio tracking", "Social features", "Analytics", "Real-time data"]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === "" || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-foreground mb-6">Help & Support Center</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in paper trading competitions. Find answers, learn strategies, and get support.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="help" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="help" className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </TabsTrigger>
                <TabsTrigger value="faq" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>FAQs</span>
                </TabsTrigger>
                <TabsTrigger value="guides" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Guides</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Us</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="help" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {helpResources.map((resource, index) => (
                      <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border">
                        <CardHeader className="pb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <resource.icon className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle className="text-lg font-semibold">{resource.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {resource.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center text-sm text-muted-foreground">
                                <ChevronRight className="w-3 h-3 mr-2 text-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">Need Personal Help?</h3>
                          <p className="text-muted-foreground">Our support team is here to help with any questions or issues.</p>
                        </div>
                        <Button onClick={() => document.querySelector('[value="contact"]')?.click()} className="bg-primary hover:bg-primary/90">
                          Contact Support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search FAQs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-background"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {filteredFaqs.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                    >
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Badge variant="secondary">{category.category}</Badge>
                            <span className="text-sm text-muted-foreground">({category.questions.length} questions)</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((faq, faqIndex) => (
                              <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                                <AccordionTrigger className="text-left hover:no-underline">
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {filteredFaqs.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No FAQs found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms or browse all categories.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="guides" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <span>Getting Started</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
                          <div>
                            <h4 className="font-medium">Create Your Account</h4>
                            <p className="text-sm text-muted-foreground">Sign up with email and complete the onboarding process</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">2</div>
                          <div>
                            <h4 className="font-medium">Explore Dashboard</h4>
                            <p className="text-sm text-muted-foreground">Familiarize yourself with the trading interface and tools</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">3</div>
                          <div>
                            <h4 className="font-medium">Make Your First Trade</h4>
                            <p className="text-sm text-muted-foreground">Buy your first stock and start building your portfolio</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">4</div>
                          <div>
                            <h4 className="font-medium">Join Competitions</h4>
                            <p className="text-sm text-muted-foreground">Enter tournaments and compete with other traders</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span>Trading Best Practices</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm"><strong>Diversify your portfolio</strong> across different sectors and companies</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm"><strong>Research before buying</strong> - check company profiles and performance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm"><strong>Monitor your investments</strong> regularly and track performance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm"><strong>Learn from losses</strong> - analyze what went wrong and improve</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm"><strong>Stay consistent</strong> with daily trading to build streaks</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Contact Information */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-2xl">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Email Support</h3>
                          <p className="text-muted-foreground">support@orsath.com</p>
                          <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">Live Chat</h3>
                          <p className="text-muted-foreground">Available during support hours</p>
                          <p className="text-xs text-muted-foreground">Instant assistance</p>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-bold text-foreground mb-4">Support Hours</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Monday - Friday</span>
                                <span className="text-foreground font-medium">9:00 AM - 6:00 PM EST</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Weekend</span>
                                <span className="text-primary font-medium">10:00 AM - 4:00 PM EST</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-foreground mb-2">Community Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">All users receive the same level of support and assistance for trading questions and platform issues.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Form */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-2xl">Send us a Message</CardTitle>
                      <p className="text-muted-foreground">We'll get back to you as soon as possible</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-foreground font-medium">
                            Name *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="mt-1 bg-background border-border text-foreground"
                            placeholder="Your full name"
                            required
                          />
                          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="email" className="text-foreground font-medium">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="mt-1 bg-background border-border text-foreground"
                            placeholder="your@email.com"
                            required
                          />
                          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                          <Label htmlFor="subject" className="text-foreground font-medium">
                            Subject *
                          </Label>
                          <Input
                            id="subject"
                            type="text"
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            className="mt-1 bg-background border-border text-foreground"
                            placeholder="Account help, Tournament question, etc."
                            required
                          />
                          {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                          <Label htmlFor="message" className="text-foreground font-medium">
                            Message *
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            className="mt-1 min-h-[100px] bg-background border-border text-foreground"
                            placeholder="Describe your issue or question in detail..."
                            required
                          />
                          {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
                        </div>

                        <Button
                          type="submit"
                          disabled={contactMutation.isPending}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          {contactMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}

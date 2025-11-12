import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Clock, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
        title: "Message Sent",
        description: "We've received your message and will respond within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
      category: "Account & Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' in the navigation bar and complete the registration form with your email address and password."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions in the reset email."
        },
        {
          question: "How do I change my username?",
          answer: "Navigate to Profile > Settings > Account Settings to update your display name."
        }
      ]
    },
    {
      category: "Trading",
      questions: [
        {
          question: "Is my money at risk?",
          answer: "No. ORSATH uses virtual currency for paper trading only. You never risk real money."
        },
        {
          question: "How often are stock prices updated?",
          answer: "Stock prices update in real-time during market hours (9:30 AM - 4:00 PM EST, Monday-Friday)."
        },
        {
          question: "Can I sell stocks anytime?",
          answer: "Yes, you can buy and sell stocks during market hours. Orders placed outside market hours will be queued."
        },
        {
          question: "How are portfolio gains calculated?",
          answer: "Portfolio gains = (Current Portfolio Value - Initial Deposit). This includes cash balance and current stock values."
        }
      ]
    },
    {
      category: "Tournaments",
      questions: [
        {
          question: "How do I join a tournament?",
          answer: "Go to the Tournaments page, browse available competitions, and click 'Join Tournament' on your chosen event."
        },
        {
          question: "How do tournament rankings work?",
          answer: "Rankings are based on portfolio percentage gain. The trader with the highest return wins."
        },
        {
          question: "Can I join multiple tournaments?",
          answer: "Yes. Each tournament has a separate balance and portfolio."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What browsers are supported?",
          answer: "ORSATH works best on Chrome, Firefox, Safari, and Edge (latest versions)."
        },
        {
          question: "Is there a mobile app?",
          answer: "ORSATH is fully responsive and works on mobile browsers. No separate app is required."
        },
        {
          question: "I'm experiencing technical issues. What should I do?",
          answer: "Try clearing your browser cache and cookies. If the issue persists, contact support with details about the problem."
        }
      ]
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
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Support Center</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Search */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* FAQs - 2/3 width on desktop, full width on mobile */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>

              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                    {category.category}
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:no-underline text-foreground">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No results found for your search.</p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Contact Form - 1/3 width on desktop, full width on mobile */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Your name"
                        className="mt-1"
                      />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1"
                      />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        placeholder="Brief description"
                        className="mt-1"
                      />
                      {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject}</p>}
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Describe your issue..."
                        className="mt-1 min-h-[120px]"
                      />
                      {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={contactMutation.isPending}
                      className="w-full"
                    >
                      {contactMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-sm text-muted-foreground">support@orsath.com</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">Response Time</div>
                      <div className="text-sm text-muted-foreground">Within 24 hours</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Support Hours</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9 AM - 6 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday - Sunday</span>
                        <span>10 AM - 4 PM EST</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

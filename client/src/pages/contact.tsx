import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TradebattleIcon, type TradebattleIconName } from "@/components/tradebattle-icons";
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

const cardStyle = {
  backgroundColor: "#0B1B2A",
  border: "1px solid rgba(118,169,198,0.18)",
  borderRadius: "10px",
};

const inputStyle = {
  backgroundColor: "#081622",
  borderColor: "rgba(118,169,198,0.18)",
  color: "#F1F5F9",
};

const labelStyle = { color: "#7890A4", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function Support() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({ title: "Message sent", description: "Help will get back to you within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    },
    onError: () => {
      toast({ title: "Message didn’t send", description: "Run it back in a moment.", variant: "destructive" });
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
          if (err.path[0]) fieldErrors[err.path[0] as keyof ContactForm] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const faqs = [
    {
      category: "Getting Started",
      icon: "arena" as TradebattleIconName,
      questions: [
        { question: "How do I create my player card?", answer: "Choose 'Create profile' in the navigation and follow the short setup to pick your player name, contact email, and passcode." },
        { question: "How do I reset my passcode?", answer: "Choose 'Forgot your passcode?' on the entry screen, enter your contact email, and follow the recovery link." },
        { question: "How do I change my player name?", answer: "Open Settings, update your player name, and save your player card." },
      ]
    },
    {
      category: "Trading",
      icon: "market" as TradebattleIconName,
      questions: [
        { question: "Is my money at risk?", answer: "No. Tradebattle uses virtual currency for paper trading only. You never risk real money on trades." },
        { question: "How often are quotes updated?", answer: "Stock quotes refresh in real time during the market window (9:30 AM–4:00 PM EST, Mon–Fri). Crypto runs 24/7." },
        { question: "Can I close a position anytime?", answer: "Yes, while the market window is live. Orders outside the window wait for the next open." },
        { question: "How are portfolio gains calculated?", answer: "Gain % = (Current Value − Starting Balance) / Starting Balance. This includes your cash and all open positions." },
      ]
    },
    {
      category: "Arenas",
      icon: "rankings" as TradebattleIconName,
      questions: [
        { question: "How do I enter an arena?", answer: "Open Arenas, choose a matchup, and select Enter. Any entry fee comes from your arena cash." },
        { question: "How are rankings determined?", answer: "Rankings use each player’s percentage gain from starting capital — the highest return takes the top place." },
        { question: "Can I enter multiple arenas?", answer: "Yes. Every arena has its own starting capital, positions, and rankings." },
      ]
    },
    {
      category: "Technical",
      icon: "settings" as TradebattleIconName,
      questions: [
        { question: "What browsers are supported?", answer: "Tradebattle works best on the latest versions of Chrome, Firefox, Safari, and Edge." },
        { question: "Is there a mobile app?", answer: "The site is fully responsive and works great on mobile browsers — no separate app needed." },
        { question: "I'm having issues. What should I do?", answer: "Try clearing your browser cache and cookies first. If it persists, send us a message below with the details." },
      ]
    }
  ];

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      searchQuery === "" ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="arena-page min-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(13,17,23,0.6)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-9">
          <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(103,231,191,.12)" }}>
              <TradebattleIcon name="chat" className="w-5 h-5" style={{ color: "#67E7BF" }} />
            </div>
            <h1 className="text-3xl font-black" style={{ color: "#F1F5F9" }}>Help HQ</h1>
          </div>
          <p className="text-sm" style={{ color: "#4B5563" }}>Quick answers for the arena — or send us a message when you need a hand.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-7 md:py-10">
        {/* Search */}
        <div className="mb-7">
          <div className="relative">
            <TradebattleIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4B5563" }} />
            <Input
              placeholder="Scout the playbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 text-sm"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* FAQs */}
          <div className="lg:col-span-2 space-y-6">
            {filteredFaqs.map((cat, ci) => (
              <div key={ci} style={cardStyle} className="overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <TradebattleIcon name={cat.icon} size={16} aria-hidden="true" />
                  <span className="text-sm font-bold" style={{ color: "#C9D1E2" }}>{cat.category}</span>
                </div>
                <div className="px-4">
                  <Accordion type="single" collapsible>
                    {cat.questions.map((faq, fi) => (
                      <AccordionItem
                        key={fi}
                        value={`${ci}-${fi}`}
                        style={{ borderBottomColor: "rgba(255,255,255,0.05)" }}
                      >
                        <AccordionTrigger
                          className="text-left hover:no-underline py-3.5 text-sm font-semibold"
                          style={{ color: "#C9D1E2" }}
                        >
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm pb-4 leading-relaxed" style={{ color: "#64748B" }}>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div style={cardStyle} className="p-8 text-center">
                <p className="text-sm mb-3" style={{ color: "#4B5563" }}>No results for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm font-semibold"
                  style={{ color: "#67E7BF" }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Contact form */}
            <div style={cardStyle} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TradebattleIcon name="timer" className="w-4 h-4" style={{ color: "#67E7BF" }} />
                <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>Contact Help</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {(["name", "email", "subject"] as const).map((field) => (
                  <div key={field}>
                    <label style={labelStyle} className="block mb-1">{field}</label>
                    <Input
                      type={field === "email" ? "email" : "text"}
                      value={formData[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={field === "email" ? "you@example.com" : field === "name" ? "Your name" : "Brief description"}
                      className="h-9 text-sm"
                      style={inputStyle}
                    />
                    {errors[field] && <p className="text-xs mt-1" style={{ color: "#FF4F58" }}>{errors[field]}</p>}
                  </div>
                ))}
                <div>
                  <label style={labelStyle} className="block mb-1">message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Describe your issue..."
                    className="text-sm min-h-[100px] resize-none"
                    style={inputStyle}
                  />
                  {errors.message && <p className="text-xs mt-1" style={{ color: "#FF4F58" }}>{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #67E7BF, #2EBF9A)", color: "#FFFFFF" }}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Info cards */}
            <div style={cardStyle} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(0,163,255,0.1)" }}>
                  <TradebattleIcon name="support" className="w-4 h-4" style={{ color: "#67E7BF" }} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "#C9D1E2" }}>Email</div>
                  <div className="text-xs" style={{ color: "#4B5563" }}>support@tradebattle.gg</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(40,199,111,0.1)" }}>
                  <TradebattleIcon name="timer" className="w-4 h-4" style={{ color: "#67E7BF" }} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "#C9D1E2" }}>Response Time</div>
                  <div className="text-xs" style={{ color: "#4B5563" }}>Within 24 hours</div>
                </div>
              </div>
            </div>

            <div style={cardStyle} className="p-4">
              <div className="text-xs font-bold mb-2" style={{ color: "#C9D1E2" }}>Support Hours</div>
              <div className="space-y-1.5">
                {[
                  { days: "Mon – Fri", hours: "9 AM – 6 PM EST" },
                  { days: "Sat – Sun", hours: "10 AM – 4 PM EST" },
                ].map((row) => (
                  <div key={row.days} className="flex justify-between text-xs">
                    <span style={{ color: "#64748B" }}>{row.days}</span>
                    <span style={{ color: "#8A93A6" }}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

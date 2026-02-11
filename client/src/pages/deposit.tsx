import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Bitcoin, ArrowLeft, Clock } from "lucide-react";

export default function Deposit() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/hub")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Deposit Funds</h1>
        </div>

        {/* Payment Options */}
        <div className="grid gap-6">
          {/* Card Payment */}
          <Card className="border-2 border-border hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">Card Payment</CardTitle>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Deposit with Visa, Mastercard, or American Express
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full" variant="outline">
                Pay with Card
              </Button>
            </CardContent>
          </Card>

          {/* Crypto Transfer */}
          <Card className="border-2 border-border hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">Crypto Transfer</CardTitle>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Deposit with Bitcoin, Ethereum, USDT, or other cryptocurrencies
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full" variant="outline">
                Pay with Crypto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'transparent' }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
        <CardHeader>
          <CardTitle style={{ color: '#C9D1E2' }}>Reset Password</CardTitle>
          <CardDescription style={{ color: '#8A93A6' }}>
            {sent
              ? "Check your email for a password reset link."
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 163, 255, 0.12)' }}>
                <Mail className="w-8 h-8" style={{ color: '#00A3FF' }} />
              </div>
              <p className="text-sm" style={{ color: '#8A93A6' }}>
                If an account with that email exists, you will receive a password reset link shortly.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#C9D1E2' }}>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#C9D1E2' }}
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#FF4F58' }}>{error}</p>}
              <Button
                type="submit"
                className="w-full text-black font-bold"
                style={{ background: '#00A3FF' }}
                disabled={loading || !email}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Link
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full" style={{ color: '#8A93A6' }}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

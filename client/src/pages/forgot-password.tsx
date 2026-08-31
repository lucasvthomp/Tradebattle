import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import "./auth.css";

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
    <div className="auth-screen auth-simple auth-recovery-screen">
      <div className="auth-simple-wrap">
        <div className="auth-simple-top">
          <Link href="/login" className="auth-panel-link">Back to entry</Link>
        </div>

        <section className="auth-simple-card auth-recovery-card">
          <div className="auth-simple-card-head">
            <div>
              <div className="auth-eyebrow">Account recovery</div>
              <h1>{sent ? "Check your inbox." : "Reset your entry."}</h1>
              <p>{sent ? "If that account exists, a recovery link is on the way." : "Enter your contact email and we’ll send a link to get you back in."}</p>
            </div>
          </div>

          {sent ? (
            <div className="auth-recovery-success">
              <div className="auth-twofa-icon"><Mail size={22} /></div>
              <Link href="/login">
                <Button type="button" className="auth-primary-button">Return to entry</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" autoComplete="email" />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <Button type="submit" className="auth-primary-button" disabled={loading || !email}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...</> : "Send recovery link"}
              </Button>
              <Link href="/login" className="auth-panel-link" style={{ textAlign: "center" }}>Remembered your passcode?</Link>
            </form>
          )}
        </section>

        <p className="auth-simple-note">We only use your email to help you recover your player profile.</p>
      </div>
    </div>
  );
}

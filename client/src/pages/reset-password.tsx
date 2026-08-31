import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import "./auth.css";

export default function ResetPassword() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passcodes do not match");
      return;
    }
    if (password.length < 8) {
      setError("Passcode must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
                <h1>Link expired.</h1>
                <p>This recovery link is no longer active. Request a fresh one to continue.</p>
              </div>
            </div>
            <Link href="/forgot-password">
              <Button type="button" className="auth-primary-button">Request a fresh link</Button>
            </Link>
          </section>
          <p className="auth-simple-note">Your player profile is still safe.</p>
        </div>
      </div>
    );
  }

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
              <h1>{success ? "Passcode updated." : "Set a new passcode."}</h1>
              <p>{success ? "Your new passcode is locked in. You can return to the arena now." : "Choose a new passcode for your player profile."}</p>
            </div>
          </div>

          {success ? (
            <div className="auth-recovery-success">
              <div className="auth-twofa-icon"><CheckCircle size={22} /></div>
              <Link href="/login">
                <Button type="button" className="auth-primary-button">Return to entry</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <Label htmlFor="password">New passcode</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" autoComplete="new-password" />
              </div>
              <div className="auth-field">
                <Label htmlFor="confirmPassword">Confirm passcode</Label>
                <Input id="confirmPassword" type="password" placeholder="Repeat your passcode" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="auth-input" autoComplete="new-password" />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <Button type="submit" className="auth-primary-button" disabled={loading || !password || !confirmPassword}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating passcode...</> : "Update passcode"}
              </Button>
              <Link href="/login" className="auth-panel-link" style={{ textAlign: "center" }}><ArrowLeft size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} /> Back to entry</Link>
            </form>
          )}
        </section>

        <p className="auth-simple-note">Use a passcode you’ll remember between rounds.</p>
      </div>
    </div>
  );
}

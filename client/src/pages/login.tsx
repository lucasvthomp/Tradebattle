import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletConnect } from "@/components/auth/WalletConnect";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import "./auth.css";

function AuthMarketTrace() {
  return (
    <div className="auth-market" aria-hidden="true">
      <svg viewBox="0 0 520 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="authMarketFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#20d8c2" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#20d8c2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="auth-market-grid" d="M0 35H520M0 90H520M0 145H520M100 0V180M220 0V180M340 0V180M460 0V180" />
        <path className="auth-market-area" d="M0 146C24 137 34 142 56 126S88 92 112 106s37 31 58 14 36-61 61-45 29 25 49 13 37-62 61-45 39 55 61 37 36-62 59-50 35 23 59 10v140H0Z" />
        <path className="auth-market-line" d="M0 146C24 137 34 142 56 126S88 92 112 106s37 31 58 14 36-61 61-45 29 25 49 13 37-62 61-45 39 55 61 37 36-62 59-50 35 23 59 10" />
        <circle className="auth-market-dot" cx="480" cy="40" r="5" />
      </svg>
    </div>
  );
}

export default function Login() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const is2FA = new URLSearchParams(searchString).get("2fa") === "true";
  const { loginMutation, user } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState("");

  if (user) {
    navigate("/hub");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const pending = sessionStorage.getItem("pending2FA");
      if (!pending) {
        setTwoFAError("Session expired. Please enter the arena again.");
        navigate("/login");
        return;
      }
      const { userId } = JSON.parse(pending);
      const res = await apiRequest("POST", "/api/auth/2fa/login-verify", {
        userId,
        code: twoFACode,
      });
      const userData = await res.json();
      sessionStorage.removeItem("pending2FA");
      queryClient.setQueryData(["/api/user"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/hub");
    } catch (err: any) {
      setTwoFAError(err.message || "Invalid code");
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <div className="auth-screen auth-login-screen">
      <div className="auth-shell">
        <aside className="auth-briefing">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-mark">T</span>
            <span>TRADEBATTLE</span>
          </Link>

          <div className="auth-briefing-copy">
            <div className="auth-eyebrow">The market is open</div>
            <h1>Think fast.<br />Play the tape.</h1>
            <p>Step back into a competitive trading arena built for sharp reads, clean decisions, and bragging rights.</p>
          </div>

          <AuthMarketTrace />

          <div className="auth-signal-list">
            <div className="auth-signal"><strong>$100K</strong><span>Virtual capital</span></div>
            <div className="auth-signal"><strong>5 MIN</strong><span>Blitz rounds</span></div>
            <div className="auth-signal"><strong>0 RISK</strong><span>Practice mode</span></div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-top">
            <Link href="/">← Back to home</Link>
            {!is2FA && <span className="auth-kicker">Player access</span>}
          </div>

          {is2FA ? (
            <form onSubmit={handle2FASubmit} className="auth-twofa-card">
              <div className="auth-form-heading compact">
                <div className="auth-twofa-icon"><ShieldCheck size={24} /></div>
                <div className="auth-eyebrow">Security checkpoint</div>
                <h2>One more read.</h2>
                <p>Enter the six-digit code from your authenticator to finish entering the arena.</p>
              </div>

              <div className="auth-field">
                <Label htmlFor="2fa-code">Verification code</Label>
                <Input
                  id="2fa-code"
                  type="text"
                  required
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="auth-input auth-twofa-input"
                  autoComplete="one-time-code"
                />
              </div>

              {twoFAError && <div className="auth-error">{twoFAError}</div>}

              <Button type="submit" disabled={twoFALoading || twoFACode.length !== 6} className="auth-primary-button">
                {twoFALoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking code...</> : "Verify and enter"}
              </Button>

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() => {
                  sessionStorage.removeItem("pending2FA");
                  navigate("/login");
                }}
              >
                Use a different entry
              </button>
            </form>
          ) : (
            <>
              <div className="auth-form-heading">
                <div className="auth-eyebrow">Welcome back, competitor</div>
                <h2>Resume your run.</h2>
                <p>Your next move is waiting. Sign in to pick up where you left off.</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <Label htmlFor="username">Player name</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your player name"
                    className="auth-input"
                    autoComplete="username"
                  />
                </div>

                <div className="auth-field">
                  <Label htmlFor="password">Passcode</Label>
                  <div className="auth-password-wrap">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your passcode"
                      className="auth-input"
                      autoComplete="current-password"
                    />
                    <button type="button" className="auth-icon-button" aria-label={showPassword ? "Hide passcode" : "Show passcode"} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loginMutation.isPending} className="auth-primary-button">
                  {loginMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening the gate...</> : "Enter the arena"}
                </Button>

                {loginMutation.isError && (
                  <div className="auth-error">
                    {(loginMutation.error as any)?.message || "Entry failed. Check your player name and passcode."}
                  </div>
                )}

                <Link href="/forgot-password" className="auth-panel-link" style={{ textAlign: "center" }}>Forgot your passcode?</Link>

                <div className="auth-divider">Or use a wallet</div>

                <div className="auth-wallet">
                  <WalletConnect
                    onSuccess={() => navigate("/hub")}
                    onNewUser={({ address, signature }) => {
                      navigate(`/signup?wallet=${encodeURIComponent(address)}&signature=${encodeURIComponent(signature)}`);
                    }}
                  />
                </div>
              </form>

              <p className="auth-footer-link">New to the arena? <Link href="/signup">Build a player profile</Link></p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

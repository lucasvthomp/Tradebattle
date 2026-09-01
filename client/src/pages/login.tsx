import { TradebattleIcon } from "@/components/tradebattle-icons";
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
    <div className="auth-screen auth-login-screen auth-simple">
      <div className="auth-simple-wrap">
        <div className="auth-simple-top">
          {!is2FA && <Link href="/signup" className="auth-panel-link">New here? Create a profile</Link>}
        </div>

        <section className="auth-simple-card auth-login-card">
          {is2FA ? (
            <form onSubmit={handle2FASubmit} className="auth-twofa-card">
              <div className="auth-simple-card-head auth-twofa-head">
                <div>
                  <div className="auth-twofa-icon"><TradebattleIcon name="success" size={22} /></div>
                  <div className="auth-eyebrow">Security checkpoint</div>
                  <h1>One more read.</h1>
                  <p>Enter the six-digit code from your authenticator to finish entering the arena.</p>
                </div>
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
              <div className="auth-simple-card-head">
                <div>
                  <div className="auth-eyebrow">Player access</div>
                  <h1>Resume your run.</h1>
                  <p>Your next move is waiting. Sign in to pick up where you left off.</p>
                </div>
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

              <p className="auth-footer-link">New to the arena? <Link href="/signup">Create a player profile</Link></p>
            </>
          )}
        </section>

        <p className="auth-simple-note">Virtual capital only · Your progress stays yours.</p>
      </div>
    </div>
  );
}

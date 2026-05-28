import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, TrendingUp, Trophy, Users, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { WalletConnect } from "@/components/auth/WalletConnect";

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
        setTwoFAError("Session expired. Please log in again.");
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #00A3FF 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00A3FF 1px, transparent 1px), linear-gradient(90deg, #00A3FF 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#00A3FF', boxShadow: '0 0 40px rgba(0, 163, 255, 0.25), 0 0 80px rgba(0, 163, 255, 0.1)' }}>
              <span className="font-black text-4xl" style={{ color: '#091525' }}>O</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#F1F5F9' }}>Welcome back</h1>
          <p className="mt-3 text-lg font-medium" style={{ color: '#00A3FF' }}>Trade. Compete. Win.</p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Paper Trading</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: '#00A3FF' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Tournaments</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Community</span>
          </div>
        </div>

        {/* Form */}
        {is2FA ? (
          <form onSubmit={handle2FASubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl relative" style={{ backgroundColor: '#0C1A2E', border: '1px solid #0E2040', boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 163, 255, 0.15)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #00A3FF, transparent)' }} />

            <div className="text-center space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto" style={{ color: '#00A3FF' }} />
              <h2 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Two-Factor Authentication</h2>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa-code" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Verification Code</Label>
              <Input
                id="2fa-code"
                type="text"
                required
                maxLength={6}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="h-12 rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040' }}
              />
            </div>

            {twoFAError && (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#EF444420', border: '1px solid #EF444440' }}>
                <p className="text-sm font-medium" style={{ color: '#EF4444' }}>{twoFAError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={twoFALoading || twoFACode.length !== 6}
              className="w-full h-12 font-bold text-base rounded-xl transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: '#00A3FF', color: '#091525', boxShadow: '0 4px 20px rgba(0, 163, 255, 0.25)' }}
            >
              {twoFALoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-center transition-colors hover:underline"
              style={{ color: '#94A3B8' }}
              onClick={() => {
                sessionStorage.removeItem("pending2FA");
                navigate("/login");
              }}
            >
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl relative" style={{ backgroundColor: '#0C1A2E', border: '1px solid #0E2040', boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 163, 255, 0.15)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #00A3FF, transparent)' }} />

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Username</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040', fontSize: '15px' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-12 h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                  style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040', fontSize: '15px' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 transition-opacity hover:opacity-80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: '#94A3B8' }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: '#94A3B8' }} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 font-bold text-base rounded-xl transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: '#00A3FF', color: '#091525', boxShadow: '0 4px 20px rgba(0, 163, 255, 0.25)' }}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {loginMutation.isError && (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#EF444420', border: '1px solid #EF444440' }}>
                <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                  {(loginMutation.error as any)?.message || "Login failed. Please check your credentials."}
                </p>
              </div>
            )}

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm transition-colors hover:underline" style={{ color: '#94A3B8' }}>
                Forgot your password?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" style={{ borderColor: '#0E2040' }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 text-xs font-medium" style={{ backgroundColor: '#0C1A2E', color: '#94A3B8' }}>
                  Or continue with
                </span>
              </div>
            </div>

            <WalletConnect
              onSuccess={() => {
                navigate("/hub");
              }}
              onNewUser={({ address, signature }) => {
                navigate(`/signup?wallet=${encodeURIComponent(address)}&signature=${encodeURIComponent(signature)}`);
              }}
            />
          </form>
        )}

        {/* Sign Up Link */}
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold hover:underline transition-colors" style={{ color: '#00A3FF' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, TrendingUp, Trophy, Users } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { loginMutation, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password }, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundColor: '#080C14' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #E3B341 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#E3B341 1px, transparent 1px), linear-gradient(90deg, #E3B341 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E3B341', boxShadow: '0 0 40px rgba(227, 179, 65, 0.3), 0 0 80px rgba(227, 179, 65, 0.1)' }}>
              <span className="font-black text-4xl" style={{ color: '#080C14' }}>O</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#F1F5F9' }}>Welcome back</h1>
          <p className="mt-3 text-lg font-medium" style={{ color: '#E3B341' }}>Trade. Compete. Win.</p>
        </div>

        {/* Feature Pills */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#10B981' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Paper Trading</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" style={{ color: '#E3B341' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Tournaments</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Community</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl relative" style={{ backgroundColor: '#111827', border: '1px solid #1F2937', boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(227, 179, 65, 0.2)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #E3B341, transparent)' }} />

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Username</Label>
            <Input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#E3B341] focus:border-[#E3B341]"
              style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937', fontSize: '15px' }}
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
                className="pr-12 h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#E3B341] focus:border-[#E3B341]"
                style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937', fontSize: '15px' }}
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
            style={{ backgroundColor: '#E3B341', color: '#080C14', boxShadow: '0 4px 20px rgba(227, 179, 65, 0.3)' }}
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
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold hover:underline transition-colors" style={{ color: '#E3B341' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#080C14' }}>
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E3B341' }}>
              <span className="font-bold text-2xl" style={{ color: '#080C14' }}>O</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#F1F5F9' }}>Welcome back to ORSATH</h1>
          <p className="mt-2 text-sm" style={{ color: '#94A3B8' }}>Sign in to continue trading</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          <div className="space-y-1.5">
            <Label htmlFor="username" style={{ color: '#F1F5F9' }}>Username</Label>
            <Input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937' }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: '#F1F5F9' }}>Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937' }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" style={{ color: '#94A3B8' }} />
                ) : (
                  <Eye className="h-4 w-4" style={{ color: '#94A3B8' }} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-11 font-semibold"
            style={{ backgroundColor: '#E3B341', color: '#080C14' }}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {loginMutation.isError && (
            <p className="text-xs text-center" style={{ color: '#EF4444' }}>
              {(loginMutation.error as any)?.message || "Login failed"}
            </p>
          )}
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
          Don't have an account?{" "}
          <Link href="/signup" className="hover:underline" style={{ color: '#E3B341' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

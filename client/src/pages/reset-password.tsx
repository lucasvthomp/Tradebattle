import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import { apiRequest } from "@/lib/queryClient";

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
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
        <Card className="w-full max-w-md" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
          <CardHeader>
            <CardTitle style={{ color: '#C9D1E2' }}>Invalid Link</CardTitle>
            <CardDescription style={{ color: '#8A93A6' }}>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Request a New Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: '#0C1829', borderColor: '#0E2040' }}>
        <CardHeader>
          <CardTitle style={{ color: '#C9D1E2' }}>
            {success ? "Password Reset" : "Set New Password"}
          </CardTitle>
          <CardDescription style={{ color: '#8A93A6' }}>
            {success
              ? "Your password has been successfully reset."
              : "Enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(40, 199, 111, 0.15)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: '#28C76F' }} />
              </div>
              <p className="text-sm" style={{ color: '#8A93A6' }}>
                You can now sign in with your new password.
              </p>
              <Link href="/login">
                <Button
                  className="w-full text-black font-bold"
                  style={{ background: '#E3B341' }}
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#C9D1E2' }}>New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#C9D1E2' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" style={{ color: '#C9D1E2' }}>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ backgroundColor: 'transparent', borderColor: '#0E2040', color: '#C9D1E2' }}
                />
              </div>
              {error && <p className="text-sm" style={{ color: '#FF4F58' }}>{error}</p>}
              <Button
                type="submit"
                className="w-full text-black font-bold"
                style={{ background: '#E3B341' }}
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reset Password
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

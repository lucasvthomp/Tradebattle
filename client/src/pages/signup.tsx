import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

// Country and language mappings
const countries = {
  "United States": { language: "English", currency: "USD", code: "US" },
  "Canada": { language: "English", currency: "CAD", code: "CA" },
  "Mexico": { language: "Spanish", currency: "MXN", code: "MX" },
  "Guatemala": { language: "Spanish", currency: "GTQ", code: "GT" },
  "Belize": { language: "English", currency: "BZD", code: "BZ" },
  "El Salvador": { language: "Spanish", currency: "USD", code: "SV" },
  "Honduras": { language: "Spanish", currency: "HNL", code: "HN" },
  "Nicaragua": { language: "Spanish", currency: "NIO", code: "NI" },
  "Costa Rica": { language: "Spanish", currency: "CRC", code: "CR" },
  "Panama": { language: "Spanish", currency: "PAB", code: "PA" },
  "Colombia": { language: "Spanish", currency: "COP", code: "CO" },
  "Venezuela": { language: "Spanish", currency: "VES", code: "VE" },
  "Guyana": { language: "English", currency: "GYD", code: "GY" },
  "Suriname": { language: "Dutch", currency: "SRD", code: "SR" },
  "French Guiana": { language: "French", currency: "EUR", code: "GF" },
  "Brazil": { language: "Portuguese", currency: "BRL", code: "BR" },
  "Ecuador": { language: "Spanish", currency: "USD", code: "EC" },
  "Peru": { language: "Spanish", currency: "PEN", code: "PE" },
  "Bolivia": { language: "Spanish", currency: "BOB", code: "BO" },
  "Paraguay": { language: "Spanish", currency: "PYG", code: "PY" },
  "Chile": { language: "Spanish", currency: "CLP", code: "CL" },
  "Argentina": { language: "Spanish", currency: "ARS", code: "AR" },
  "Uruguay": { language: "Spanish", currency: "UYU", code: "UY" },
};

export default function Signup() {
  const [, navigate] = useLocation();
  const { registerMutation, user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available: boolean | null; reason?: string }>({ checking: false, available: null });

  if (user) {
    navigate("/dashboard");
    return null;
  }

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: null });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null });
      try {
        const res = await fetch(`/api/username/check/${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameStatus({ checking: false, available: data.available, reason: data.reason });
      } catch {
        setUsernameStatus({ checking: false, available: null });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (selectedCountry && countries[selectedCountry as keyof typeof countries]) {
      const countryData = countries[selectedCountry as keyof typeof countries];
      setSelectedLanguage(countryData.language);
      setSelectedCurrency(countryData.currency);
    }
  }, [selectedCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email,
      password,
      username,
      country: selectedCountry,
      language: selectedLanguage,
      currency: selectedCurrency,
    }, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const passwordValid = password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username);
  const formValid = usernameValid && usernameStatus.available === true && email && passwordValid && selectedCountry;

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
          <h1 className="text-3xl font-bold" style={{ color: '#F1F5F9' }}>Join ORSATH</h1>
          <p className="mt-2 text-sm" style={{ color: '#94A3B8' }}>Start your paper trading competition journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl" style={{ backgroundColor: '#111827', border: '1px solid #1F2937' }}>
          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" style={{ color: '#F1F5F9' }}>Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                maxLength={20}
                className="pr-10"
                style={{
                  backgroundColor: '#0F172A',
                  color: '#F1F5F9',
                  borderColor: usernameStatus.available === true ? '#10B981' : usernameStatus.available === false ? '#EF4444' : '#1F2937',
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {usernameStatus.checking && <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#94A3B8' }} />}
                {usernameStatus.available === true && <CheckCircle className="h-4 w-4" style={{ color: '#10B981' }} />}
                {usernameStatus.available === false && <XCircle className="h-4 w-4" style={{ color: '#EF4444' }} />}
              </div>
            </div>
            {usernameStatus.available === false && usernameStatus.reason && (
              <p className="text-xs" style={{ color: '#EF4444' }}>{usernameStatus.reason}</p>
            )}
            {username && username.length < 3 && (
              <p className="text-xs" style={{ color: '#EF4444' }}>Username must be at least 3 characters</p>
            )}
            {usernameStatus.available === true && (
              <p className="text-xs" style={{ color: '#10B981' }}>Username is available</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" style={{ color: '#F1F5F9' }}>Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937' }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: '#F1F5F9' }}>Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars, 1 uppercase, 1 number"
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
            {password && !passwordValid && (
              <p className="text-xs" style={{ color: '#EF4444' }}>
                {password.length < 6 ? "At least 6 characters" : !/[A-Z]/.test(password) ? "Needs an uppercase letter" : "Needs a number"}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Label style={{ color: '#F1F5F9' }}>Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger style={{ backgroundColor: '#0F172A', color: '#F1F5F9', borderColor: '#1F2937' }}>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(countries).map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!formValid || registerMutation.isPending}
            className="w-full h-11 font-semibold mt-2"
            style={{ backgroundColor: '#E3B341', color: '#080C14' }}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {registerMutation.isError && (
            <p className="text-xs text-center" style={{ color: '#EF4444' }}>
              {(registerMutation.error as any)?.message || "Registration failed"}
            </p>
          )}
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
          Already have an account?{" "}
          <Link href="/login" className="hover:underline" style={{ color: '#E3B341' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

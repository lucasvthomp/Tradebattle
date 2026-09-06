import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import "./auth.css";

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
  const searchString = useSearch();
  const { registerMutation, user } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(searchString);
  const walletAddress = params.get("wallet");
  const walletSignature = params.get("signature");
  const isWalletRegistration = !!walletAddress && !!walletSignature;

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ checking: boolean; available: boolean | null; reason?: string }>({ checking: false, available: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedToS, setAcceptedToS] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus({ checking: false, available: null });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null });
      try {
        const response = await fetch(`/api/username/check/${encodeURIComponent(username)}`);
        const data = await response.json();
        setUsernameStatus({ checking: false, available: data.available, reason: data.reason });
      } catch {
        setUsernameStatus({ checking: false, available: null });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!selectedCountry) return;
    const countryData = countries[selectedCountry as keyof typeof countries];
    if (countryData) {
      setSelectedLanguage(countryData.language);
      setSelectedCurrency(countryData.currency);
    }
  }, [selectedCountry]);

  if (user) {
    navigate("/hub");
    return null;
  }

  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username);
  const emailValid = email.includes("@") && email.includes(".");
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const canSubmit = usernameValid && usernameStatus.available === true && !!selectedCountry && acceptedToS && acceptedPrivacy && (isWalletRegistration || (emailValid && passwordValid));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isWalletRegistration) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/auth/wallet/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            walletAddress,
            signature: walletSignature,
            username,
            email: email || undefined,
            country: selectedCountry,
            language: selectedLanguage,
            currency: selectedCurrency,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Registration failed");
        }

        const { user: createdUser } = await response.json();
        toast({ title: "Profile created", description: `Welcome, ${createdUser.username}.` });
        window.location.href = "/hub";
      } catch (error: any) {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    registerMutation.mutate({
      email,
      password,
      username,
      country: selectedCountry,
      language: selectedLanguage,
      currency: selectedCurrency,
    }, { onSuccess: () => navigate("/hub") });
  };

  return (
    <div className="auth-screen auth-signup-screen auth-simple">
      <div className="auth-simple-wrap">
        <div className="auth-simple-top">
          <Link href="/login" className="auth-panel-link">Already have an account? Sign in</Link>
        </div>

        <section className="auth-simple-card">
          <div className="auth-simple-card-head">
            <div>
              <div className="auth-eyebrow">Tradebattle</div>
              <h1>Create profile</h1>
              <p>Set up your player account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <Label htmlFor="username">Player name</Label>
              <div className="auth-username-wrap">
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Player name"
                  maxLength={20}
                  className="auth-input"
                  autoComplete="username"
                  style={{ borderColor: usernameStatus.available === true ? "#20d8c2" : usernameStatus.available === false ? "#ef6b75" : undefined }}
                />
                <div className="auth-icon-button" aria-hidden="true">
                  {usernameStatus.checking && <Loader2 size={16} className="animate-spin" />}
                  {usernameStatus.available === true && <CheckCircle size={16} style={{ color: "#20d8c2" }} />}
                  {usernameStatus.available === false && <XCircle size={16} style={{ color: "#ef6b75" }} />}
                </div>
              </div>
              {usernameStatus.available === false && usernameStatus.reason && <div className="signup-field-note error">{usernameStatus.reason}</div>}
            </div>

            {!isWalletRegistration && (
              <>
                <div className="auth-field">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="auth-input" autoComplete="email" />
                </div>

                <div className="auth-field">
                  <Label htmlFor="password">Passcode</Label>
                  <div className="auth-password-wrap">
                    <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="auth-input" autoComplete="new-password" />
                    <button type="button" className="auth-icon-button" aria-label={showPassword ? "Hide passcode" : "Show passcode"} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {password && !passwordValid && <div className="signup-field-note error">Use 8+ characters, one uppercase letter, and one number.</div>}
                </div>
              </>
            )}

            <div className="auth-field">
              <Label className="auth-field-label">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="auth-input">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(countries).map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedCountry && <div className="signup-field-note">{selectedLanguage} · {selectedCurrency}</div>}
            </div>

            <div className="signup-legal">
              <div className="signup-legal-row">
                <Checkbox id="tos" checked={acceptedToS} onCheckedChange={(checked) => setAcceptedToS(checked === true)} />
                <label htmlFor="tos">I agree to the <Link href="/terms" target="_blank">Terms of Service</Link>.</label>
              </div>
              <div className="signup-legal-row">
                <Checkbox id="privacy" checked={acceptedPrivacy} onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)} />
                <label htmlFor="privacy">I accept the <Link href="/privacy" target="_blank">Privacy Policy</Link>.</label>
              </div>
            </div>

            {registerMutation.isError && <div className="auth-error">{(registerMutation.error as any)?.message || "Registration failed."}</div>}

            <Button type="submit" disabled={!canSubmit || registerMutation.isPending || isSubmitting} className="auth-primary-button">
              {registerMutation.isPending || isSubmitting ? <><Loader2 size={15} className="mr-2 animate-spin" /> Creating profile…</> : "Create profile"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

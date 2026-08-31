import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, ArrowLeft, User, Lock, Globe, Rocket, Check } from "lucide-react";
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

const steps = [
  { icon: User, label: "Identity", subtitle: "Player card", title: "Claim your player card", description: "Choose the name the field will remember." },
  { icon: Lock, label: "Defense", subtitle: "Secure entry", title: "Lock in your entry", description: "Set a passcode that keeps your seat yours." },
  { icon: Globe, label: "Home base", subtitle: "Local settings", title: "Set your home base", description: "Tune the arena to your region and currency." },
  { icon: Rocket, label: "Launch", subtitle: "Final check", title: "Ready for the opening bell", description: "Review your player card and take your seat." },
];

export default function Signup() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { registerMutation, user } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(searchString);
  const walletAddress = params.get("wallet");
  const walletSignature = params.get("signature");
  const isWalletRegistration = !!walletAddress && !!walletSignature;

  const [step, setStep] = useState(1);
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

  if (user) {
    navigate("/hub");
    return null;
  }

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

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
            country: selectedCountry || undefined,
            language: selectedLanguage,
            currency: selectedCurrency,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Registration failed");
        }

        const { user } = await response.json();
        toast({ title: "Registration successful", description: `Welcome to Tradebattle, ${user.username}!` });
        window.location.href = "/hub";
      } catch (error: any) {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      registerMutation.mutate({
        email,
        password,
        username,
        country: selectedCountry,
        language: selectedLanguage,
        currency: selectedCurrency,
      }, { onSuccess: () => navigate("/dashboard") });
    }
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasNumber;
  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username);
  const emailValid = email.includes("@") && email.includes(".");

  const canProceed = () => {
    switch (step) {
      case 1:
        if (isWalletRegistration) return usernameValid && usernameStatus.available === true;
        return usernameValid && usernameStatus.available === true && emailValid;
      case 2: return isWalletRegistration ? true : passwordValid;
      case 3: return !!selectedCountry;
      case 4: return acceptedToS && acceptedPrivacy;
      default: return false;
    }
  };

  const nextStep = () => {
    if (step < 4 && canProceed()) {
      setStep(isWalletRegistration && step === 1 ? 3 : step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(isWalletRegistration && step === 3 ? 1 : step - 1);
  };

  const currentStep = steps[step - 1];
  return (
    <div className="auth-screen auth-signup-screen auth-simple">
      <div className="auth-simple-wrap">
        <div className="auth-simple-top">
          <Link href="/login" className="auth-panel-link">Already a player? Sign in</Link>
        </div>

        <section className="auth-simple-card">
          <div className="auth-simple-card-head">
            <div>
              <div className="auth-eyebrow">Player setup</div>
              <h1>{currentStep.title}</h1>
              <p>{currentStep.description}</p>
            </div>
            <span className="auth-simple-counter">{String(step).padStart(2, "0")} / 04</span>
          </div>

          <div className="auth-simple-stepper" aria-label="Profile setup progress">
            {steps.map((item, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === step;
              const isComplete = stepNumber < step;
              const isSkipped = isWalletRegistration && stepNumber === 2;
              return (
                <div key={item.label} className={`auth-simple-step ${isActive ? "active" : ""} ${isComplete ? "complete" : ""} ${isSkipped ? "skipped" : ""}`}>
                  <span className="auth-simple-step-number">0{stepNumber}</span>
                  <span>{isSkipped ? "Wallet" : item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="signup-form-card">
            {step === 1 && (
              <div className="auth-form">
                <div className="auth-field">
                  <Label htmlFor="username">Player name</Label>
                  <div className="auth-username-wrap">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. closingbell"
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
                  {username && username.length < 3 && <div className="signup-field-note error">Player name needs at least 3 characters.</div>}
                  {usernameStatus.available === true && <div className="signup-field-note success">That player name is open.</div>}
                </div>

                {!isWalletRegistration && (
                  <div className="auth-field">
                    <Label htmlFor="email">Contact email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Where should we send updates?" className="auth-input" autoComplete="email" />
                    <div className="signup-field-note">Used for account recovery and important arena updates.</div>
                  </div>
                )}

                {isWalletRegistration && <div className="signup-wallet-card">Wallet seat connected · {walletAddress?.slice(0, 7)}...{walletAddress?.slice(-5)}</div>}
              </div>
            )}

            {step === 2 && (
              <div className="auth-form">
                <div className="auth-field">
                  <Label htmlFor="password">Passcode</Label>
                  <div className="auth-password-wrap">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create your passcode" className="auth-input" autoComplete="new-password" />
                    <button type="button" className="auth-icon-button" aria-label={showPassword ? "Hide passcode" : "Show passcode"} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="signup-strength">
                  <div className="signup-strength-bars"><span className={hasMinLength ? "met" : ""} /><span className={hasUppercase ? "met" : ""} /><span className={hasNumber ? "met" : ""} /></div>
                  <div className={`signup-field-note ${passwordValid ? "success" : ""}`}>{passwordValid ? "Passcode locked in." : "Three checks keep your player card secure."}</div>
                </div>

                <div className="signup-requirements">
                  {[
                    { met: hasMinLength, text: "At least 8 characters" },
                    { met: hasUppercase, text: "One uppercase letter" },
                    { met: hasNumber, text: "One number" },
                  ].map((requirement) => (
                    <div key={requirement.text} className={`signup-requirement ${requirement.met ? "met" : ""}`}>
                      <span className="signup-requirement-icon">{requirement.met ? <Check size={11} /> : <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />}</span>
                      <span>{requirement.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="auth-form">
                <div className="auth-field">
                  <Label className="auth-field-label">Home base</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="auth-input">
                      <SelectValue placeholder="Choose your home base" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(countries).map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="signup-field-note">We use this to set the right language and display currency.</div>
                </div>

                {selectedCountry ? (
                  <div className="signup-location-meta">
                    <div className="signup-meta-card"><span>Play language</span><strong>{selectedLanguage}</strong></div>
                    <div className="signup-meta-card"><span>Display currency</span><strong>{selectedCurrency}</strong></div>
                  </div>
                ) : (
                  <div className="signup-wallet-card">Your settings stay flexible. You can update them later from your profile.</div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="auth-form">
                <div className="signup-review-list">
                  {[
                    { label: "Player name", value: username },
                    { label: "Contact email", value: email || "Wallet account" },
                    { label: "Home base", value: selectedCountry },
                    { label: "Language / currency", value: `${selectedLanguage} · ${selectedCurrency}` },
                  ].map((item) => (
                    <div key={item.label} className="signup-review-row"><span>{item.label}</span><strong>{item.value}</strong></div>
                  ))}
                </div>

                <div className="signup-legal">
                  <div className="signup-legal-row">
                    <Checkbox id="tos" checked={acceptedToS} onCheckedChange={(checked) => setAcceptedToS(checked as boolean)} />
                    <label htmlFor="tos">I agree to the <Link href="/terms" target="_blank">Arena Terms</Link>.</label>
                  </div>
                  <div className="signup-legal-row">
                    <Checkbox id="privacy" checked={acceptedPrivacy} onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)} />
                    <label htmlFor="privacy">I accept the <Link href="/privacy" target="_blank">Privacy Rules</Link>.</label>
                  </div>
                  <p className="signup-legal-note">By joining, you confirm you are 18+ and agree to receive essential updates about your player card.</p>
                </div>
              </div>
            )}
          </div>

          <div className="signup-navigation">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="auth-secondary-button"><ArrowLeft size={15} /> Previous</Button>
            ) : <span />}

            {step < 4 ? (
              <Button type="button" onClick={nextStep} disabled={!canProceed()} className="auth-primary-button">Continue <ArrowRight size={15} className="ml-2" /></Button>
            ) : (
              <Button type="button" onClick={() => handleSubmit()} disabled={registerMutation.isPending || isSubmitting || !canProceed()} className="auth-primary-button launch">
                {registerMutation.isPending || isSubmitting ? <><Loader2 size={15} className="mr-2 animate-spin" /> Building card...</> : <><Rocket size={15} className="mr-2" /> Take my seat</>}
              </Button>
            )}
          </div>

          {registerMutation.isError && <div className="auth-error signup-error">{(registerMutation.error as any)?.message || "Registration failed"}</div>}
          <p className="auth-footer-link signup-footer">Virtual capital only · <Link href="/login">Already have a player profile?</Link></p>
        </section>

        <p className="auth-simple-note">Practice with simulated markets. No deposits, no pressure.</p>
      </div>
    </div>
  );
}

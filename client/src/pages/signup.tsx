import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, ArrowLeft, User, Lock, Globe, Rocket, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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

const steps = [
  { icon: User, label: "Identity", title: "Let's get started", subtitle: "Choose your username and email" },
  { icon: Lock, label: "Security", title: "Secure your account", subtitle: "Create a strong password" },
  { icon: Globe, label: "Location", title: "Where are you from?", subtitle: "Select your country" },
  { icon: Rocket, label: "Launch", title: "You're all set!", subtitle: "Review and create your account" },
];

export default function Signup() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { registerMutation, user } = useAuth();
  const { toast } = useToast();

  // Detect wallet registration from URL params
  const params = new URLSearchParams(searchString);
  const walletAddress = params.get('wallet');
  const walletSignature = params.get('signature');
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isWalletRegistration) {
      // Wallet registration flow
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/wallet/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
          throw new Error(error.error || 'Registration failed');
        }

        const { user } = await response.json();
        toast({
          title: 'Registration successful',
          description: `Welcome to Tradebattle, ${user.username}!`,
        });
        window.location.href = '/hub';
      } catch (error: any) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Traditional password registration
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
    }
  };

  // Password validation (skip for wallet users)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasMinLength && hasUppercase && hasNumber;

  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9]+_?[a-zA-Z0-9]*$/.test(username);
  const emailValid = email.includes("@") && email.includes(".");

  // Step validation (adjusted for wallet registration)
  const canProceed = () => {
    switch (step) {
      case 1:
        // For wallet users, only username is required (email optional)
        if (isWalletRegistration) {
          return usernameValid && usernameStatus.available === true;
        }
        // For password users, both username and email required
        return usernameValid && usernameStatus.available === true && emailValid;
      case 2:
        // Skip password step for wallet users
        return isWalletRegistration ? true : passwordValid;
      case 3: return !!selectedCountry;
      case 4: return acceptedToS && acceptedPrivacy; // Must accept both legal agreements
      default: return false;
    }
  };

  const nextStep = () => {
    if (step < 4 && canProceed()) {
      // Skip password step for wallet users
      if (isWalletRegistration && step === 1) {
        setStep(3); // Skip to location
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      // Skip password step when going back for wallet users
      if (isWalletRegistration && step === 3) {
        setStep(1);
      } else {
        setStep(step - 1);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #00A3FF 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00A3FF 1px, transparent 1px), linear-gradient(90deg, #00A3FF 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#00A3FF', boxShadow: '0 0 40px rgba(0, 163, 255, 0.25)' }}>
              <span className="font-black text-3xl" style={{ color: '#091525' }}>O</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 px-4">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div className="w-5 sm:w-8 h-[2px] mx-1" style={{ backgroundColor: isCompleted ? '#00A3FF' : '#0E2040' }} />
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? '#00A3FF' : isCompleted ? '#00A3FF30' : '#0C1A2E',
                    border: `2px solid ${isActive ? '#00A3FF' : isCompleted ? '#00A3FF' : '#0E2040'}`,
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" style={{ color: '#00A3FF' }} />
                  ) : (
                    <StepIcon className="w-4 h-4" style={{ color: isActive ? '#091525' : '#94A3B8' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Title */}
        <div className="text-center">
          <h1 className="text-2xl font-black" style={{ color: '#F1F5F9' }}>{steps[step - 1].title}</h1>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{steps[step - 1].subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-2xl relative" style={{ backgroundColor: '#0C1A2E', border: '1px solid #0E2040', boxShadow: '0 0 60px rgba(0, 0, 0, 0.5)' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #00A3FF, transparent)' }} />

          {/* Step 1: Username & Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    maxLength={20}
                    className="pr-10 h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#F1F5F9',
                      borderColor: usernameStatus.available === true ? '#10B981' : usernameStatus.available === false ? '#EF4444' : '#0E2040',
                      fontSize: '15px',
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
                  <p className="text-xs" style={{ color: '#10B981' }}>Username is available!</p>
                )}
              </div>

              {!isWalletRegistration && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                    style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040', fontSize: '15px' }}
                  />
                </div>
              )}

              {isWalletRegistration && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#00A3FF10', border: '1px solid #00A3FF30' }}>
                  <p className="text-xs text-center" style={{ color: '#00A3FF' }}>
                    Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pr-12 h-12 rounded-xl transition-all duration-200 focus:ring-1 focus:ring-[#00A3FF] focus:border-[#00A3FF]"
                    style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040', fontSize: '15px' }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
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

              {/* Password Strength Bar */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: hasMinLength ? '#10B981' : '#0E2040' }} />
                  <div className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: hasUppercase ? '#10B981' : '#0E2040' }} />
                  <div className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ backgroundColor: hasNumber ? '#10B981' : '#0E2040' }} />
                </div>
                <p className="text-xs font-medium" style={{ color: passwordValid ? '#10B981' : '#94A3B8' }}>
                  {passwordValid ? 'Strong password!' : 'Password strength'}
                </p>
              </div>

              {/* Requirements Checklist */}
              <div className="space-y-2 p-3 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                {[
                  { met: hasMinLength, text: "At least 8 characters" },
                  { met: hasUppercase, text: "One uppercase letter" },
                  { met: hasNumber, text: "One number" },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: req.met ? '#10B98130' : '#0E2040' }}>
                      {req.met ? (
                        <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#94A3B8' }} />
                      )}
                    </div>
                    <span className="text-xs transition-colors duration-300" style={{ color: req.met ? '#10B981' : '#94A3B8' }}>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Country */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-12 rounded-xl" style={{ backgroundColor: 'transparent', color: '#F1F5F9', borderColor: '#0E2040' }}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(countries).map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                    <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Language</p>
                    <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{selectedLanguage}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                    <p className="text-xs mb-1" style={{ color: '#94A3B8' }}>Currency</p>
                    <p className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>{selectedCurrency}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-3">
                {[
                  { label: "Username", value: username, color: '#00A3FF' },
                  { label: "Email", value: email, color: '#3B82F6' },
                  { label: "Country", value: selectedCountry, color: '#10B981' },
                  { label: "Language", value: selectedLanguage, color: '#94A3B8' },
                  { label: "Currency", value: selectedCurrency, color: '#94A3B8' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Legal Agreements */}
              <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: 'transparent', border: '1px solid #0E2040' }}>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="tos"
                    checked={acceptedToS}
                    onCheckedChange={(checked) => setAcceptedToS(checked as boolean)}
                    className="mt-1"
                    style={{ borderColor: acceptedToS ? '#10B981' : '#0E2040' }}
                  />
                  <div className="flex-1">
                    <label htmlFor="tos" className="text-sm cursor-pointer" style={{ color: '#F1F5F9' }}>
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" className="underline font-semibold hover:opacity-80" style={{ color: '#00A3FF' }}>
                        Terms of Service
                      </Link>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                    className="mt-1"
                    style={{ borderColor: acceptedPrivacy ? '#10B981' : '#0E2040' }}
                  />
                  <div className="flex-1">
                    <label htmlFor="privacy" className="text-sm cursor-pointer" style={{ color: '#F1F5F9' }}>
                      I have read and accept the{' '}
                      <Link href="/privacy" target="_blank" className="underline font-semibold hover:opacity-80" style={{ color: '#00A3FF' }}>
                        Privacy Policy
                      </Link>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                </div>

                <p className="text-xs pt-2" style={{ color: '#5f6b7a', borderTop: '1px solid #0E2040' }}>
                  By creating an account, you confirm that you are at least 18 years old and agree to receive important updates about your account.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="h-11 rounded-xl px-5"
                style={{ borderColor: '#0E2040', color: '#F1F5F9' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="h-11 rounded-xl px-6 font-bold transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: canProceed() ? '#00A3FF' : '#0E2040', color: canProceed() ? '#FFFFFF' : '#94A3B8', boxShadow: canProceed() ? '0 4px 20px rgba(0, 163, 255, 0.25)' : 'none' }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={registerMutation.isPending || !canProceed()}
                className="h-11 rounded-xl px-6 font-bold transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: canProceed() ? '#10B981' : '#0E2040', color: '#FFFFFF', boxShadow: canProceed() ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none' }}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            )}
          </div>

          {registerMutation.isError && (
            <div className="mt-4 p-3 rounded-xl text-center" style={{ backgroundColor: '#EF444420', border: '1px solid #EF444440' }}>
              <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                {(registerMutation.error as any)?.message || "Registration failed"}
              </p>
            </div>
          )}
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline transition-colors" style={{ color: '#00A3FF' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

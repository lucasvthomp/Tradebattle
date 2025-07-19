import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, Globe, Crown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Country and language mappings
const countries = {
  // North America
  "United States": { language: "English", currency: "USD", code: "US" },
  "Canada": { language: "English", currency: "CAD", code: "CA" },
  "Mexico": { language: "Spanish", currency: "MXN", code: "MX" },
  
  // Central America
  "Guatemala": { language: "Spanish", currency: "GTQ", code: "GT" },
  "Belize": { language: "English", currency: "BZD", code: "BZ" },
  "El Salvador": { language: "Spanish", currency: "USD", code: "SV" },
  "Honduras": { language: "Spanish", currency: "HNL", code: "HN" },
  "Nicaragua": { language: "Spanish", currency: "NIO", code: "NI" },
  "Costa Rica": { language: "Spanish", currency: "CRC", code: "CR" },
  "Panama": { language: "Spanish", currency: "PAB", code: "PA" },
  
  // South America
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

const languages = ["English", "Spanish", "Portuguese", "French", "Dutch"];
const currencies = ["USD", "CAD", "MXN", "GTQ", "BZD", "HNL", "NIO", "CRC", "PAB", "COP", "VES", "GYD", "SRD", "EUR", "BRL", "PEN", "BOB", "PYG", "CLP", "ARS", "UYU"];

// Translations
const translations = {
  English: {
    welcome: "Welcome!",
    country: "What country are you located in?",
    language: "Language",
    currency: "Currency",
    next: "Next",
    back: "Back",
    username: "Choose a username",
    usernameDescription: "3-15 characters, letters, numbers, and underscores only",
    usernamePlaceholder: "Enter your username",
    email: "What's your email address?",
    emailPlaceholder: "Enter your email",
    password: "Create a password",
    passwordPlaceholder: "Enter a secure password",
    upgrade: "Upgrade to Premium?",
    upgradeDescription: "Get premium features for a better trading experience",
    upgradeLater: "Maybe Later",
    upgradeNow: "Upgrade Now",
    signUp: "Create Account",
    subtitle: "Start your paper trading competition journey"
  },
  Spanish: {
    welcome: "¡Bienvenido!",
    country: "¿En qué país te encuentras?",
    language: "Idioma",
    currency: "Moneda",
    next: "Siguiente",
    back: "Atrás",
    username: "Elige un nombre de usuario",
    usernameDescription: "3-15 caracteres, letras, números y guiones bajos solamente",
    usernamePlaceholder: "Ingresa tu nombre de usuario",
    email: "¿Cuál es tu dirección de correo?",
    emailPlaceholder: "Ingresa tu correo",
    password: "Crea una contraseña",
    passwordPlaceholder: "Ingresa una contraseña segura",
    upgrade: "¿Actualizar a Premium?",
    upgradeDescription: "Obtén funciones premium para una mejor experiencia",
    upgradeLater: "Tal vez después",
    upgradeNow: "Actualizar ahora",
    signUp: "Crear cuenta",
    subtitle: "Comienza tu viaje de competencias de trading"
  },
  Portuguese: {
    welcome: "Bem-vindo!",
    country: "Em que país você está localizado?",
    language: "Idioma",
    currency: "Moeda",
    next: "Próximo",
    back: "Voltar",
    username: "Escolha um nome de usuário",
    usernameDescription: "3-15 caracteres, letras, números e sublinhados apenas",
    usernamePlaceholder: "Digite seu nome de usuário",
    email: "Qual é o seu endereço de email?",
    emailPlaceholder: "Digite seu email",
    password: "Crie uma senha",
    passwordPlaceholder: "Digite uma senha segura",
    upgrade: "Atualizar para Premium?",
    upgradeDescription: "Obtenha recursos premium para uma melhor experiência",
    upgradeLater: "Talvez depois",
    upgradeNow: "Atualizar agora",
    signUp: "Criar conta",
    subtitle: "Comece sua jornada de competições de trading"
  }
};

export default function Signup() {
  const [, navigate] = useLocation();
  const { registerMutation, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [wantsPremium, setWantsPremium] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  // Update language and currency when country changes
  useEffect(() => {
    if (selectedCountry && countries[selectedCountry as keyof typeof countries]) {
      const countryData = countries[selectedCountry as keyof typeof countries];
      setSelectedLanguage(countryData.language);
      setSelectedCurrency(countryData.currency);
    }
  }, [selectedCountry]);

  const t = translations[selectedLanguage as keyof typeof translations] || translations.English;

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    registerMutation.mutate({ 
      email, 
      password, 
      username,
      country: selectedCountry,
      language: selectedLanguage,
      currency: selectedCurrency,
      wantsPremium 
    }, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold">
                <span className="text-blue-500">Welcome!</span>{" "}
                <span className="text-green-500">Bem-vindo!</span>{" "}
                <span className="text-red-500">¡Bienvenido!</span>
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">{t.country}</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">North America</div>
                  {Object.keys(countries).slice(0, 3).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Central America</div>
                  {Object.keys(countries).slice(3, 10).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">South America</div>
                  {Object.keys(countries).slice(10).map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t.language}</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t.currency}</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t.username}</h2>
              <p className="text-sm text-muted-foreground mt-2">{t.usernameDescription}</p>
            </div>
            <div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                className="h-12 text-center"
                pattern="[a-zA-Z0-9_]{3,15}"
                maxLength={15}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t.email}</h2>
            </div>
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="h-12 text-center"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t.password}</h2>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="h-12 text-center pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold">{t.upgrade}</h2>
              <p className="text-muted-foreground mt-2">{t.upgradeDescription}</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setWantsPremium(false);
                    handleSubmit();
                  }}
                  className="h-12"
                  disabled={registerMutation.isPending}
                >
                  {t.upgradeLater}
                </Button>
                <Button
                  onClick={() => {
                    setWantsPremium(true);
                    handleSubmit();
                  }}
                  className="h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  disabled={registerMutation.isPending}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {registerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t.upgradeNow
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedCountry !== "";
      case 2: return username !== "" && username.length >= 3 && username.length <= 15 && /^[a-zA-Z0-9_]+$/.test(username);
      case 3: return email !== "";
      case 4: return password !== "";
      default: return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join ORSATH</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 5</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back}
              </Button>

              {step < 5 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
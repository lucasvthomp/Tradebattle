import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Language translations
export const translations = {
  English: {
    // Navigation
    dashboard: "Dashboard",
    portfolio: "Portfolio", 
    leaderboard: "Leaderboard",
    people: "People",
    plans: "Plans",
    about: "About",
    contact: "Contact",
    settings: "Settings",
    archive: "Archive",
    logout: "Logout",
    
    // Common terms
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    back: "Back",
    next: "Next",
    finish: "Finish",
    
    // Financial terms
    balance: "Balance",
    shares: "Shares",
    price: "Price",
    change: "Change",
    volume: "Volume",
    marketCap: "Market Cap",
    totalValue: "Total Value",
    currentValue: "Current Value",
    purchasePrice: "Purchase Price",
    currentPrice: "Current Price",
    gain: "Gain",
    loss: "Loss",
    
    // Tournament terms
    tournament: "Tournament",
    tournaments: "Tournaments",
    participants: "Participants",
    timeRemaining: "Time Remaining",
    joinTournament: "Join Tournament",
    createTournament: "Create Tournament",
    
    // User interface
    firstName: "First Name",
    lastName: "Last Name",
    displayName: "Display Name",
    email: "Email",
    password: "Password",
    country: "Country",
    language: "Language",
    currency: "Currency",
    subscriptionTier: "Subscription Tier",
    
    // Account settings
    accountSettings: "Account Settings",
    personalInformation: "Personal Information",
    preferences: "Preferences",
    updateProfile: "Update Profile",
    changePassword: "Change Password",
    
    // Signup flow
    getStarted: "Get Started",
    chooseLocation: "Choose Your Location",
    enterDetails: "Enter Your Details",
    createAccount: "Create Account",
    choosePlan: "Choose Your Plan",
    signupComplete: "Welcome to ORSATH!",
    
    // Subscription plans
    free: "Free",
    premium: "Premium",
    administrator: "Administrator",
    upgrade: "Upgrade",
    upgraded: "Upgraded",
    
    // Chat
    typeMessage: "Type your message...",
    regionalChat: "Regional Chat",
    sendMessage: "Send",
  },
  
  Portuguese: {
    // Navigation
    dashboard: "Painel",
    portfolio: "Portfólio",
    leaderboard: "Classificação",
    people: "Pessoas",
    plans: "Planos",
    about: "Sobre",
    contact: "Contato",
    settings: "Configurações",
    archive: "Arquivo",
    logout: "Sair",
    
    // Common terms
    welcome: "Bem-vindo",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    view: "Ver",
    back: "Voltar",
    next: "Próximo",
    finish: "Finalizar",
    
    // Financial terms
    balance: "Saldo",
    shares: "Ações",
    price: "Preço",
    change: "Mudança",
    volume: "Volume",
    marketCap: "Cap. Mercado",
    totalValue: "Valor Total",
    currentValue: "Valor Atual",
    purchasePrice: "Preço Compra",
    currentPrice: "Preço Atual",
    gain: "Ganho",
    loss: "Perda",
    
    // Tournament terms
    tournament: "Torneio",
    tournaments: "Torneios",
    participants: "Participantes",
    timeRemaining: "Tempo Restante",
    joinTournament: "Entrar no Torneio",
    createTournament: "Criar Torneio",
    
    // User interface
    firstName: "Primeiro Nome",
    lastName: "Sobrenome",
    displayName: "Nome de Exibição",
    email: "Email",
    password: "Senha",
    country: "País",
    language: "Idioma",
    currency: "Moeda",
    subscriptionTier: "Nível de Assinatura",
    
    // Account settings
    accountSettings: "Configurações da Conta",
    personalInformation: "Informações Pessoais",
    preferences: "Preferências",
    updateProfile: "Atualizar Perfil",
    changePassword: "Alterar Senha",
    
    // Signup flow
    getStarted: "Começar",
    chooseLocation: "Escolha Sua Localização",
    enterDetails: "Digite Seus Dados",
    createAccount: "Criar Conta",
    choosePlan: "Escolha Seu Plano",
    signupComplete: "Bem-vindo ao ORSATH!",
    
    // Subscription plans
    free: "Gratuito",
    premium: "Premium",
    administrator: "Administrador",
    upgrade: "Atualizar",
    upgraded: "Atualizado",
    
    // Chat
    typeMessage: "Digite sua mensagem...",
    regionalChat: "Chat Regional",
    sendMessage: "Enviar",
  },
  
  Spanish: {
    // Navigation
    dashboard: "Panel",
    portfolio: "Portafolio",
    leaderboard: "Clasificación",
    people: "Personas",
    plans: "Planes",
    about: "Acerca",
    contact: "Contacto",
    settings: "Configuración",
    archive: "Archivo",
    logout: "Salir",
    
    // Common terms
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    view: "Ver",
    back: "Atrás",
    next: "Siguiente",
    finish: "Finalizar",
    
    // Financial terms
    balance: "Balance",
    shares: "Acciones",
    price: "Precio",
    change: "Cambio",
    volume: "Volumen",
    marketCap: "Cap. Mercado",
    totalValue: "Valor Total",
    currentValue: "Valor Actual",
    purchasePrice: "Precio Compra",
    currentPrice: "Precio Actual",
    gain: "Ganancia",
    loss: "Pérdida",
    
    // Tournament terms
    tournament: "Torneo",
    tournaments: "Torneos",
    participants: "Participantes",
    timeRemaining: "Tiempo Restante",
    joinTournament: "Unirse al Torneo",
    createTournament: "Crear Torneo",
    
    // User interface
    firstName: "Nombre",
    lastName: "Apellido",
    displayName: "Nombre Mostrado",
    email: "Email",
    password: "Contraseña",
    country: "País",
    language: "Idioma",
    currency: "Moneda",
    subscriptionTier: "Nivel de Suscripción",
    
    // Account settings
    accountSettings: "Configuración de Cuenta",
    personalInformation: "Información Personal",
    preferences: "Preferencias",
    updateProfile: "Actualizar Perfil",
    changePassword: "Cambiar Contraseña",
    
    // Signup flow
    getStarted: "Comenzar",
    chooseLocation: "Elige Tu Ubicación",
    enterDetails: "Ingresa Tus Datos",
    createAccount: "Crear Cuenta",
    choosePlan: "Elige Tu Plan",
    signupComplete: "¡Bienvenido a ORSATH!",
    
    // Subscription plans
    free: "Gratis",
    premium: "Premium",
    administrator: "Administrador",
    upgrade: "Mejorar",
    upgraded: "Mejorado",
    
    // Chat
    typeMessage: "Escribe tu mensaje...",
    regionalChat: "Chat Regional",
    sendMessage: "Enviar",
  },
};

// Currency configurations
export const currencies = {
  USD: { symbol: '$', position: 'before', decimals: 2 },
  BRL: { symbol: 'R$', position: 'before', decimals: 2 },
  ARS: { symbol: '$', position: 'before', decimals: 2 },
  MXN: { symbol: '$', position: 'before', decimals: 2 },
  CAD: { symbol: 'C$', position: 'before', decimals: 2 },
  COP: { symbol: '$', position: 'before', decimals: 2 },
  CLP: { symbol: '$', position: 'before', decimals: 0 },
  PEN: { symbol: 'S/', position: 'before', decimals: 2 },
  UYU: { symbol: '$U', position: 'before', decimals: 2 },
  EUR: { symbol: '€', position: 'after', decimals: 2 },
};

interface UserPreferencesContextType {
  language: string;
  currency: string;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  updatePreferences: (language?: string, currency?: string) => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>('English');
  const [currency, setCurrency] = useState<string>('USD');

  // Initialize preferences from user data
  useEffect(() => {
    if (user) {
      setLanguage(user.language || 'English');
      setCurrency(user.currency || 'USD');
    }
  }, [user]);

  // Translation function
  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.English;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  // Currency formatting function
  const formatCurrency = (amount: number): string => {
    const currencyConfig = currencies[currency as keyof typeof currencies] || currencies.USD;
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
    
    if (currencyConfig.position === 'before') {
      return `${currencyConfig.symbol}${formatted}`;
    } else {
      return `${formatted}${currencyConfig.symbol}`;
    }
  };

  // Update preferences function
  const updatePreferences = async (newLanguage?: string, newCurrency?: string) => {
    if (!user) return;

    const updates: any = {};
    if (newLanguage && newLanguage !== language) {
      updates.language = newLanguage;
      setLanguage(newLanguage);
    }
    if (newCurrency && newCurrency !== currency) {
      updates.currency = newCurrency;
      setCurrency(newCurrency);
    }

    if (Object.keys(updates).length > 0) {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }
      } catch (error) {
        console.error('Error updating preferences:', error);
        // Revert changes on error
        if (newLanguage) setLanguage(user.language || 'English');
        if (newCurrency) setCurrency(user.currency || 'USD');
      }
    }
  };

  const value: UserPreferencesContextType = {
    language,
    currency,
    t,
    formatCurrency,
    updatePreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
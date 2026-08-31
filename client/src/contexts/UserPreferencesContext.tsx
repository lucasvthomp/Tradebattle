import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

// Language translations
export const translations = {
  English: {
    // Navigation
    dashboard: "Trading Floor",
    portfolio: "Positions",
    leaderboard: "Standings",
    people: "Players",
    plans: "Game Plans",
    about: "The Game",
    contact: "Pit Crew",
    settings: "Player Settings",
    archive: "Past Matches",
    logout: "Exit Arena",
    
    // Common terms
    welcome: "Welcome to the arena",
    loading: "Loading the board...",
    error: "Action failed",
    success: "Locked in",
    save: "Save changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    back: "Back",
    next: "Next move",
    finish: "Finish run",
    
    // Financial terms
    balance: "Buying Power",
    shares: "Units",
    price: "Quote",
    change: "Move",
    volume: "Flow",
    marketCap: "Market Cap",
    totalValue: "Board Value",
    currentValue: "Live Value",
    purchasePrice: "Entry Price",
    currentPrice: "Live Price",
    gain: "Upside",
    loss: "Downside",
    
    // Tournament terms
    tournament: "Arena",
    tournaments: "Arenas",
    participants: "Players",
    timeRemaining: "On the Clock",
    joinTournament: "Enter Arena",
    createTournament: "Open Arena",
    
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
    accountSettings: "Player Settings",
    personalInformation: "Player Profile",
    preferences: "Play Preferences",
    updateProfile: "Save Profile",
    changePassword: "Change Passcode",
    
    // Signup flow
    getStarted: "Enter the arena",
    chooseLocation: "Set Your Home Base",
    enterDetails: "Build Your Player Card",
    createAccount: "Create Player Profile",
    choosePlan: "Choose Your Game Plan",
    signupComplete: "Welcome to Tradebattle!",
    
    // Subscription plans
    free: "Free",
    premium: "Premium",
    administrator: "Administrator",
    upgrade: "Upgrade",
    upgraded: "Upgraded",
    

    
    // Portfolio
    initialDeposit: "Initial Deposit",
    totalGainLoss: "Total Gain/Loss",
    totalInvested: "Total Invested",
    availableCash: "Available Cash",
    
    // Authentication
    signIn: "Enter the arena",
    signInDescription: "Pick up where you left off on the live market board",
    welcomeBack: "Back in the arena",
    signUp: "Create player profile",
    dontHaveAccount: "New to the arena?",
    emailAddress: "Email address",
    enterEmail: "Drop your email here",
    enterPassword: "Enter your passcode",
    logIn: "Enter arena",
    loggingIn: "Checking your entry...",
    
    // Support
    support: "Pit Crew",
    helpCenter: "Pit Crew HQ",
    faq: "Quick Answers",
    guides: "Playbooks",
    contactUs: "Call the Pit Crew",
    
    // Trading Actions
    buy: "Buy",
    sell: "Sell",
    buyStock: "Buy Stock",
    sellStock: "Sell Stock",
    search: "Search",
    searchStocks: "Search stocks...",
    addToWatchlist: "Add to Scout List",
    removeFromWatchlist: "Remove from Scout List",
    
    // Dashboard & Portfolio
    overview: "Readout",
    holdings: "Positions",
    watchlist: "Scout List",
    history: "Match History",
    analytics: "Performance Lab",
    totalPortfolioValue: "Total Board Value",
    dayChange: "Today’s Move",
    totalReturn: "Run Return",
    totalReturnPercent: "Run Return %",
    availableBalance: "Buying Power",
    investedAmount: "Capital in Play",
    unrealizedGains: "Open Upside",
    realizedGains: "Locked Gains",
    
    // Stock Information
    symbol: "Symbol",
    company: "Company",
    lastPrice: "Last Price",
    priceChange: "Price Change",
    priceChangePercent: "Price Change %",
    previousClose: "Previous Close",
    dayRange: "Day Range",
    week52Range: "52 Week Range",
    averageVolume: "Average Volume",
    marketCapitalization: "Market Capitalization",
    peRatio: "P/E Ratio",
    dividend: "Dividend",
    beta: "Beta",
    
    // Tournament Features
    joinTournamentBtn: "Enter Arena",
    createTournamentBtn: "Open Arena",
    tournamentName: "Arena Name",
    startingBalance: "Starting Capital",
    endDate: "Finish Time",
    buyIn: "Entry Fee",
    prizePool: "Prize Pool",
    status: "Match Status",
    rank: "Place",
    participantCount: "Players",
    timeLeft: "Clock",
    tournamentRules: "Arena Rules",
    leaderboardPosition: "Standings Place",
    
    // Account & Profile
    profile: "Player Card",
    account: "Player Account",
    profilePicture: "Profile Picture",
    username: "Username",
    fullName: "Full Name",
    dateOfBirth: "Date of Birth",
    phoneNumber: "Phone Number",
    address: "Address",
    city: "City",
    state: "State",
    postalCode: "Postal Code",
    bio: "Player Bio",
    
    // Financial Management
    deposit: "Add Capital",
    withdraw: "Cash Out",
    transfer: "Transfer",
    transaction: "Ledger Entry",
    transactions: "Ledger",
    amount: "Amount",
    fee: "Fee",
    total: "Total",
    processingTime: "Processing Time",
    bankAccount: "Bank Account",
    creditCard: "Credit Card",
    paymentMethod: "Payment Method",
    siteCash: "Arena Cash",
    
    // Time & Dates
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    allTime: "All Time",
    dateRange: "Date Range",
    from: "From",
    to: "To",
    
    // Actions & Buttons
    submit: "Send it",
    confirm: "Lock it in",
    apply: "Apply",
    reset: "Reset run",
    clear: "Clear",
    refresh: "Refresh board",
    update: "Save update",
    create: "Create",
    join: "Enter",
    leave: "Leave arena",
    close: "Close",
    open: "Open",
    
    // Status & Messages
    active: "Live",
    inactive: "Offline",
    completed: "Final",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    expired: "Expired",
    
    // Notifications & Alerts
    notification: "Alert",
    notifications: "Alerts",
    alert: "Alert",
    warning: "Warning",
    info: "Information",
    noData: "No board data yet",
    noResults: "No matches found",
    searchNoResults: "No symbols match that scout",
    
    // Navigation & Layout
    home: "Arena Home",
    hub: "Control Room",
    menu: "Menu",
    sidebar: "Sidebar",
    header: "Header",
    footer: "Footer",
    breadcrumb: "Breadcrumb",
    pagination: "Pagination",
    
    // Forms & Validation
    required: "Required",
    optional: "Optional",
    invalid: "Invalid",
    valid: "Valid",
    pleaseEnter: "Enter this to continue",
    pleaseSelect: "Choose an option",
    fieldRequired: "This field is needed",
    invalidEmail: "That email doesn’t look right",
    passwordTooShort: "Passcode needs more reps",
    
    // Market Status
    marketOpen: "Market Live",
    marketClosed: "Market Closed",
    marketHours: "Market Window",
    afterHours: "After Hours",
    preMarket: "Pre-Market",
    tradingHalted: "Market Paused",
    
    // Performance & Statistics
    performance: "Performance",
    statistics: "Match Stats",
    winRate: "Win Rate",
    profitLoss: "P&L",
    bestPerformance: "Best Run",
    worstPerformance: "Toughest Run",
    averageReturn: "Average Run",
    sharpeRatio: "Sharpe Ratio",
    volatility: "Volatility",
    
    // Social & Community
    chat: "Comms",
    message: "Message",
    send: "Send",
    online: "In the arena",
    offline: "Away",
    members: "Players",
    community: "The Field",
    social: "Social",
    
    // Help & Documentation
    help: "Help",
    documentation: "Documentation",
    tutorial: "Tutorial",
    gettingStarted: "Getting Started",
    userManual: "User Manual",
    videoTutorials: "Video Tutorials",
    
    // Settings & Preferences
    general: "General",
    security: "Security",
    privacy: "Privacy",
    notificationsSettings: "Alerts",
    appearance: "Display",
    theme: "Theme",
    darkMode: "Dark Arena",
    lightMode: "Light Arena",
    
    // Subscription & Billing
    subscription: "Subscription",
    billing: "Billing",
    plan: "Plan",
    upgradeAccount: "Upgrade",
    downgrade: "Downgrade",
    renew: "Renew",
    expire: "Expire",
    invoice: "Invoice",
    receipt: "Receipt",
    
    // Errors & Issues
    errorOccurred: "We hit a rough patch",
    tryAgain: "Run it back",
    contactSupport: "Call the Pit Crew",
    pageNotFound: "That page left the board",
    accessDenied: "That area is locked",
    sessionExpired: "Your session timed out",
    connectionLost: "Connection dropped",
    
    // Brand & Legal
    brandName: "TRADEBATTLE",
    tagline: "A live-market strategy game for players who want an edge",
    termsOfService: "Arena Terms",
    privacyPolicy: "Privacy Rules",
    cookiePolicy: "Cookie Policy",
    disclaimer: "Disclaimer",
    
    // Miscellaneous
    more: "More",
    less: "Less",
    all: "All",
    none: "None",
    other: "Other",
    misc: "Miscellaneous",
    details: "Details",
    summary: "Summary",
    advanced: "Advanced",
    basic: "Basic",
    actions: "Actions",
    processing: "Working the play...",
    
    // Greetings
    goodMorning: "Good morning, player",
    goodAfternoon: "Good afternoon, player",
    goodEvening: "Good evening, player",
    
    // Hub specific
    hubWelcomeMessage: "The board is live. What’s your next move?",
    dashboardDescription: "Read the tape, manage your positions, and make the call",
    joinTournamentDescription: "Enter the field and climb the standings",
    leaderboardDescription: "See who has the sharpest run right now",
    events: "Match Events",
    
    // Additional UI messages
    startTradingMessage: "Make your first move to see positions here",
    addedToAccount: "is now in your arena cash",
    withdrawnFromAccount: "left your arena cash",
    enterUsername: "Choose your player name",
    currentHoldings: "Open Positions",
    adminRole: "Match Director",
    supportTeam: "Pit Crew",
    invalidShares: "Enter a valid number of units",
    stockPurchased: "Opened position",
    sharesUnit: "units",
    sellPosition: "Close position",

    // Chat & Social
    globalChat: "Field Comms",
    noMessagesYet: "No comms yet. Call the first play.",
    messageEveryone: "Message the field...",
    viewFullProfile: "View Player Card",
    sendTip: "Send Boost",
    sendTipTo: "Send Boost to",
    tipDescription: "Send a boost from your arena cash to back this player.",
    enterAmount: "Enter boost amount",
    yourBalance: "Your buying power",
    sending: "Sending boost...",

    // People
    searchByName: "Scout a player...",
    newestMembers: "Newest Players",
    oldestMembers: "Longest Tenure",
    mostTrades: "Most Reps",
    alphabetical: "A to Z",
    allMembers: "All Players",
    administrators: "Match Directors",
    viewProfile: "View Player Card",
    backToPeople: "Back to Players",
    memberSince: "Joined the field",
    totalTrades: "Total Reps",
    tradingStreak: "Hot Streak",
    tournamentsJoined: "Arenas Entered",
    noPeopleFound: "No players on the board",
    errorLoadingUsers: "Couldn’t load the field",
    reloadPage: "Reload the Field",
    showing: "Showing",
    personUnit: "person",
    peopleUnit: "people",
    matching: "matching",

    // Trades
    recentTrades: "Recent Moves",
    noTradesYet: "No moves yet",
    bought: "Opened",
    sold: "Closed",
    sharesAt: "units @",

    // Archive
    searchTournaments: "Scout arenas...",
    noMatchingTournaments: "No arenas match that search",
    noCompletedTournaments: "No finished arenas yet",
    backToArchive: "Back to Past Matches",
    startingCash: "Starting Capital",
    duration: "Match Length",
    ended: "Final Bell",
    finalLeaderboard: "Final Standings",
    noParticipantsRecorded: "No players recorded",
    tournamentNotFound: "Arena not found",
    goBack: "Back to safety",
    players: "Players",

    // Rewards
    rewards: "Unlockables",
    comingSoon: "On the way",
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
    signupComplete: "Bem-vindo ao Tradebattle!",
    
    // Subscription plans
    free: "Gratuito",
    premium: "Premium",
    administrator: "Administrador",
    upgrade: "Atualizar",
    upgraded: "Atualizado",
    

    
    // Portfolio
    initialDeposit: "Depósito Inicial",
    totalGainLoss: "Ganho/Perda Total",
    totalInvested: "Total Investido",
    availableCash: "Dinheiro Disponível",
    
    // Authentication
    signIn: "Entrar em",
    signInDescription: "Acesse sua plataforma de competição de negociação simulada",
    welcomeBack: "Bem-vindo de Volta",
    signUp: "Cadastrar-se",
    dontHaveAccount: "Não tem uma conta?",
    emailAddress: "Endereço de e-mail",
    enterEmail: "Digite seu e-mail",
    enterPassword: "Digite sua senha",
    logIn: "Entrar",
    loggingIn: "Entrando...",
    
    // Support
    support: "Suporte",
    helpCenter: "Central de Ajuda",
    faq: "Perguntas Frequentes",
    guides: "Guias",
    contactUs: "Contate-nos",
    
    // Trading Actions
    buy: "Comprar",
    sell: "Vender",
    buyStock: "Comprar Ação",
    sellStock: "Vender Ação",
    search: "Pesquisar",
    searchStocks: "Pesquisar ações...",
    addToWatchlist: "Adicionar à Lista de Observação",
    removeFromWatchlist: "Remover da Lista de Observação",
    
    // Dashboard & Portfolio
    overview: "Visão Geral",
    holdings: "Participações",
    watchlist: "Lista de Observação",
    history: "Histórico",
    analytics: "Análises",
    totalPortfolioValue: "Valor Total do Portfólio",
    dayChange: "Mudança do Dia",
    totalReturn: "Retorno Total",
    totalReturnPercent: "% Retorno Total",
    availableBalance: "Saldo Disponível",
    investedAmount: "Valor Investido",
    unrealizedGains: "Ganhos Não Realizados",
    realizedGains: "Ganhos Realizados",
    
    // Stock Information
    symbol: "Símbolo",
    company: "Empresa",
    lastPrice: "Último Preço",
    priceChange: "Mudança de Preço",
    priceChangePercent: "% Mudança de Preço",
    previousClose: "Fechamento Anterior",
    dayRange: "Faixa do Dia",
    week52Range: "Faixa 52 Semanas",
    averageVolume: "Volume Médio",
    marketCapitalization: "Capitalização de Mercado",
    peRatio: "Relação P/L",
    dividend: "Dividendo",
    beta: "Beta",
    
    // Tournament Features
    joinTournamentBtn: "Participar do Torneio",
    createTournamentBtn: "Criar Torneio",
    tournamentName: "Nome do Torneio",
    startingBalance: "Saldo Inicial",
    endDate: "Data de Término",
    buyIn: "Buy-in",
    prizePool: "Prêmio Acumulado",
    status: "Status",
    rank: "Posição",
    participantCount: "Participantes",
    timeLeft: "Tempo Restante",
    tournamentRules: "Regras do Torneio",
    leaderboardPosition: "Posição no Ranking",
    
    // Account & Profile
    profile: "Perfil",
    account: "Conta",
    profilePicture: "Foto do Perfil",
    username: "Nome de Usuário",
    fullName: "Nome Completo",
    dateOfBirth: "Data de Nascimento",
    phoneNumber: "Número de Telefone",
    address: "Endereço",
    city: "Cidade",
    state: "Estado",
    postalCode: "CEP",
    bio: "Biografia",
    
    // Financial Management
    deposit: "Depositar",
    withdraw: "Sacar",
    transfer: "Transferir",
    transaction: "Transação",
    transactions: "Transações",
    amount: "Valor",
    fee: "Taxa",
    total: "Total",
    processingTime: "Tempo de Processamento",
    bankAccount: "Conta Bancária",
    creditCard: "Cartão de Crédito",
    paymentMethod: "Método de Pagamento",
    siteCash: "Dinheiro do Site",
    
    // Time & Dates
    today: "Hoje",
    yesterday: "Ontem",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mês",
    thisYear: "Este Ano",
    allTime: "Todo o Tempo",
    dateRange: "Período",
    from: "De",
    to: "Para",
    
    // Actions & Buttons
    submit: "Enviar",
    confirm: "Confirmar",
    apply: "Aplicar",
    reset: "Redefinir",
    clear: "Limpar",
    refresh: "Atualizar",
    update: "Atualizar",
    create: "Criar",
    join: "Participar",
    leave: "Sair",
    close: "Fechar",
    open: "Abrir",
    
    // Status & Messages
    active: "Ativo",
    inactive: "Inativo",
    completed: "Concluído",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
    expired: "Expirado",
    
    // Notifications & Alerts
    notification: "Notificação",
    notifications: "Notificações",
    alert: "Alerta",
    warning: "Aviso",
    info: "Informação",
    noData: "Nenhum dado disponível",
    noResults: "Nenhum resultado encontrado",
    searchNoResults: "Nenhuma ação encontrada para sua pesquisa",
    
    // Navigation & Layout
    home: "Início",
    hub: "Central",
    menu: "Menu",
    sidebar: "Barra Lateral",
    header: "Cabeçalho",
    footer: "Rodapé",
    breadcrumb: "Navegação",
    pagination: "Paginação",
    
    // Forms & Validation
    required: "Obrigatório",
    optional: "Opcional",
    invalid: "Inválido",
    valid: "Válido",
    pleaseEnter: "Por favor digite",
    pleaseSelect: "Por favor selecione",
    fieldRequired: "Este campo é obrigatório",
    invalidEmail: "Endereço de email inválido",
    passwordTooShort: "Senha muito curta",
    
    // Market Status
    marketOpen: "Mercado Aberto",
    marketClosed: "Mercado Fechado",
    marketHours: "Horário do Mercado",
    afterHours: "Após o Horário",
    preMarket: "Pré-Mercado",
    tradingHalted: "Negociação Suspensa",
    
    // Performance & Statistics
    performance: "Desempenho",
    statistics: "Estatísticas",
    winRate: "Taxa de Vitória",
    profitLoss: "Lucro/Prejuízo",
    bestPerformance: "Melhor Desempenho",
    worstPerformance: "Pior Desempenho",
    averageReturn: "Retorno Médio",
    sharpeRatio: "Índice de Sharpe",
    volatility: "Volatilidade",
    
    // Social & Community
    chat: "Chat",
    message: "Mensagem",
    send: "Enviar",
    online: "Online",
    offline: "Offline",
    members: "Membros",
    community: "Comunidade",
    social: "Social",
    
    // Help & Documentation
    help: "Ajuda",
    documentation: "Documentação",
    tutorial: "Tutorial",
    gettingStarted: "Começando",
    userManual: "Manual do Usuário",
    videoTutorials: "Tutoriais em Vídeo",
    
    // Settings & Preferences
    general: "Geral",
    security: "Segurança",
    privacy: "Privacidade",
    notificationsSettings: "Notificações",
    appearance: "Aparência",
    theme: "Tema",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    
    // Subscription & Billing
    subscription: "Assinatura",
    billing: "Cobrança",
    plan: "Plano",
    upgradeAccount: "Fazer Upgrade",
    downgrade: "Fazer Downgrade",
    renew: "Renovar",
    expire: "Expirar",
    invoice: "Fatura",
    receipt: "Recibo",
    
    // Errors & Issues
    errorOccurred: "Ocorreu um erro",
    tryAgain: "Tente novamente",
    contactSupport: "Contate o suporte",
    pageNotFound: "Página não encontrada",
    accessDenied: "Acesso negado",
    sessionExpired: "Sessão expirada",
    connectionLost: "Conexão perdida",
    
    // Brand & Legal
    brandName: "TRADEBATTLE",
    tagline: "Plataforma de competição de trading simulado para traders aspirantes",
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
    cookiePolicy: "Política de Cookies",
    disclaimer: "Isenção de Responsabilidade",
    
    // Miscellaneous
    more: "Mais",
    less: "Menos",
    all: "Todos",
    none: "Nenhum",
    other: "Outro",
    misc: "Diversos",
    details: "Detalhes",
    summary: "Resumo",
    advanced: "Avançado",
    basic: "Básico",
    actions: "Ações",
    processing: "Processando...",
    
    // Greetings
    goodMorning: "Bom Dia",
    goodAfternoon: "Boa Tarde",
    goodEvening: "Boa Noite",
    
    // Hub specific
    hubWelcomeMessage: "Pronto para deixar sua marca nos mercados?",
    dashboardDescription: "Entre no seu painel de negociação pessoal",
    joinTournamentDescription: "Compita contra traders de todo o mundo",
    leaderboardDescription: "Veja onde você está globalmente",
    events: "Eventos",
    
    // Additional UI messages
    startTradingMessage: "Comece a negociar para ver suas posições aqui",
    addedToAccount: "foi adicionado à sua conta",
    withdrawnFromAccount: "foi retirado da sua conta",
    enterUsername: "Digite seu nome de usuário",
    currentHoldings: "Posições Atuais",
    adminRole: "Administrador",
    supportTeam: "Suporte",
    invalidShares: "Por favor, digite um número válido de ações",
    stockPurchased: "Ação comprada",
    sharesUnit: "ações",
    sellPosition: "Vender ação",

    // Chat & Social
    globalChat: "Chat Global",
    noMessagesYet: "Nenhuma mensagem ainda. Comece a conversa!",
    messageEveryone: "Mensagem para todos...",
    viewFullProfile: "Ver Perfil Completo",
    sendTip: "Enviar Gorjeta",
    sendTipTo: "Enviar Gorjeta para",
    tipDescription: "Envie uma gorjeta do seu saldo para apoiar este usuário.",
    enterAmount: "Digite o valor",
    yourBalance: "Seu saldo",
    sending: "Enviando...",

    // People
    searchByName: "Buscar por nome ou usuário...",
    newestMembers: "Membros Recentes",
    oldestMembers: "Membros Antigos",
    mostTrades: "Mais Negociações",
    alphabetical: "Alfabético",
    allMembers: "Todos os Membros",
    administrators: "Administradores",
    viewProfile: "Ver Perfil",
    backToPeople: "Voltar para Pessoas",
    memberSince: "Membro desde",
    totalTrades: "Total de Negociações",
    tradingStreak: "Sequência de Negociação",
    tournamentsJoined: "Torneios Participados",
    noPeopleFound: "Nenhuma pessoa encontrada",
    errorLoadingUsers: "Erro ao Carregar Usuários",
    reloadPage: "Recarregar Página",
    showing: "Mostrando",
    personUnit: "pessoa",
    peopleUnit: "pessoas",
    matching: "correspondendo a",

    // Trades
    recentTrades: "Negociações Recentes",
    noTradesYet: "Nenhuma negociação ainda",
    bought: "Comprou",
    sold: "Vendeu",
    sharesAt: "ações @",

    // Archive
    searchTournaments: "Buscar torneios...",
    noMatchingTournaments: "Nenhum torneio encontrado",
    noCompletedTournaments: "Nenhum torneio concluído ainda",
    backToArchive: "Voltar ao Arquivo",
    startingCash: "Capital Inicial",
    duration: "Duração",
    ended: "Encerrado",
    finalLeaderboard: "Classificação Final",
    noParticipantsRecorded: "Nenhum participante registrado",
    tournamentNotFound: "Torneio não encontrado",
    goBack: "Voltar",
    players: "Jogadores",

    // Rewards
    rewards: "Recompensas",
    comingSoon: "Em Breve",
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
    signupComplete: "¡Bienvenido a Tradebattle!",
    
    // Subscription plans
    free: "Gratis",
    premium: "Premium",
    administrator: "Administrador",
    upgrade: "Mejorar",
    upgraded: "Mejorado",
    

    
    // Portfolio
    initialDeposit: "Depósito Inicial",
    totalGainLoss: "Ganancia/Pérdida Total",
    totalInvested: "Total Invertido",
    availableCash: "Efectivo Disponible",
    
    // Authentication
    signIn: "Iniciar sesión en",
    signInDescription: "Accede a tu plataforma de competición de trading simulado",
    welcomeBack: "Bienvenido de Vuelta",
    signUp: "Registrarse",
    dontHaveAccount: "¿No tienes una cuenta?",
    emailAddress: "Dirección de correo electrónico",
    password: "Contraseña",
    enterEmail: "Ingresa tu email",
    enterPassword: "Ingresa tu contraseña",
    logIn: "Iniciar sesión",
    loggingIn: "Iniciando sesión...",
    
    // Support
    support: "Soporte",
    helpCenter: "Centro de Ayuda",
    faq: "Preguntas Frecuentes",
    guides: "Guías",
    contactUs: "Contáctanos",
    
    // Trading Actions
    buy: "Comprar",
    sell: "Vender",
    buyStock: "Comprar Acción",
    sellStock: "Vender Acción",
    search: "Buscar",
    searchStocks: "Buscar acciones...",
    addToWatchlist: "Agregar a Lista de Seguimiento",
    removeFromWatchlist: "Quitar de Lista de Seguimiento",
    
    // Dashboard & Portfolio
    overview: "Resumen",
    holdings: "Tenencias",
    watchlist: "Lista de Seguimiento",
    history: "Historial",
    analytics: "Análisis",
    totalPortfolioValue: "Valor Total del Portafolio",
    dayChange: "Cambio del Día",
    totalReturn: "Retorno Total",
    totalReturnPercent: "% Retorno Total",
    availableBalance: "Balance Disponible",
    investedAmount: "Cantidad Invertida",
    unrealizedGains: "Ganancias No Realizadas",
    realizedGains: "Ganancias Realizadas",
    
    // Stock Information
    symbol: "Símbolo",
    company: "Empresa",
    lastPrice: "Último Precio",
    priceChange: "Cambio de Precio",
    priceChangePercent: "% Cambio de Precio",
    previousClose: "Cierre Anterior",
    dayRange: "Rango del Día",
    week52Range: "Rango 52 Semanas",
    averageVolume: "Volumen Promedio",
    marketCapitalization: "Capitalización de Mercado",
    peRatio: "Relación P/E",
    dividend: "Dividendo",
    beta: "Beta",
    
    // Tournament Features
    joinTournamentBtn: "Unirse al Torneo",
    createTournamentBtn: "Crear Torneo",
    tournamentName: "Nombre del Torneo",
    startingBalance: "Balance Inicial",
    endDate: "Fecha de Finalización",
    buyIn: "Entrada",
    prizePool: "Pozo de Premios",
    status: "Estado",
    rank: "Posición",
    participantCount: "Participantes",
    timeLeft: "Tiempo Restante",
    tournamentRules: "Reglas del Torneo",
    leaderboardPosition: "Posición en la Clasificación",
    
    // Account & Profile
    profile: "Perfil",
    account: "Cuenta",
    profilePicture: "Foto de Perfil",
    username: "Nombre de Usuario",
    fullName: "Nombre Completo",
    dateOfBirth: "Fecha de Nacimiento",
    phoneNumber: "Número de Teléfono",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado",
    postalCode: "Código Postal",
    bio: "Biografía",
    
    // Financial Management
    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",
    transaction: "Transacción",
    transactions: "Transacciones",
    amount: "Cantidad",
    fee: "Comisión",
    total: "Total",
    processingTime: "Tiempo de Procesamiento",
    bankAccount: "Cuenta Bancaria",
    creditCard: "Tarjeta de Crédito",
    paymentMethod: "Método de Pago",
    siteCash: "Efectivo del Sitio",
    
    // Time & Dates
    today: "Hoy",
    yesterday: "Ayer",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    thisYear: "Este Año",
    allTime: "Todo el Tiempo",
    dateRange: "Rango de Fechas",
    from: "Desde",
    to: "Hasta",
    
    // Actions & Buttons
    submit: "Enviar",
    confirm: "Confirmar",
    apply: "Aplicar",
    reset: "Restablecer",
    clear: "Limpiar",
    refresh: "Actualizar",
    update: "Actualizar",
    create: "Crear",
    join: "Unirse",
    leave: "Salir",
    close: "Cerrar",
    open: "Abrir",
    
    // Status & Messages
    active: "Activo",
    inactive: "Inactivo",
    completed: "Completado",
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    expired: "Expirado",
    
    // Notifications & Alerts
    notification: "Notificación",
    notifications: "Notificaciones",
    alert: "Alerta",
    warning: "Advertencia",
    info: "Información",
    noData: "No hay datos disponibles",
    noResults: "No se encontraron resultados",
    searchNoResults: "No se encontraron acciones que coincidan con tu búsqueda",
    
    // Navigation & Layout
    home: "Inicio",
    hub: "Centro",
    menu: "Menú",
    sidebar: "Barra Lateral",
    header: "Encabezado",
    footer: "Pie de Página",
    breadcrumb: "Ruta de Navegación",
    pagination: "Paginación",
    
    // Forms & Validation
    required: "Requerido",
    optional: "Opcional",
    invalid: "Inválido",
    valid: "Válido",
    pleaseEnter: "Por favor ingresa",
    pleaseSelect: "Por favor selecciona",
    fieldRequired: "Este campo es requerido",
    invalidEmail: "Dirección de correo inválida",
    passwordTooShort: "Contraseña muy corta",
    
    // Market Status
    marketOpen: "Mercado Abierto",
    marketClosed: "Mercado Cerrado",
    marketHours: "Horario del Mercado",
    afterHours: "Fuera de Horario",
    preMarket: "Previo al Mercado",
    tradingHalted: "Trading Suspendido",
    
    // Performance & Statistics
    performance: "Rendimiento",
    statistics: "Estadísticas",
    winRate: "Tasa de Ganancia",
    profitLoss: "Ganancia/Pérdida",
    bestPerformance: "Mejor Rendimiento",
    worstPerformance: "Peor Rendimiento",
    averageReturn: "Retorno Promedio",
    sharpeRatio: "Ratio de Sharpe",
    volatility: "Volatilidad",
    
    // Social & Community
    chat: "Chat",
    message: "Mensaje",
    send: "Enviar",
    online: "En Línea",
    offline: "Desconectado",
    members: "Miembros",
    community: "Comunidad",
    social: "Social",
    
    // Help & Documentation
    help: "Ayuda",
    documentation: "Documentación",
    tutorial: "Tutorial",
    gettingStarted: "Comenzando",
    userManual: "Manual de Usuario",
    videoTutorials: "Tutoriales en Video",
    
    // Settings & Preferences
    general: "General",
    security: "Seguridad",
    privacy: "Privacidad",
    notificationsSettings: "Notificaciones",
    appearance: "Apariencia",
    theme: "Tema",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    
    // Subscription & Billing
    subscription: "Suscripción",
    billing: "Facturación",
    plan: "Plan",
    upgradeAccount: "Mejorar",
    downgrade: "Degradar",
    renew: "Renovar",
    expire: "Expirar",
    invoice: "Factura",
    receipt: "Recibo",
    
    // Errors & Issues
    errorOccurred: "Ocurrió un error",
    tryAgain: "Intentar nuevamente",
    contactSupport: "Contactar soporte",
    pageNotFound: "Página no encontrada",
    accessDenied: "Acceso denegado",
    sessionExpired: "Sesión expirada",
    connectionLost: "Conexión perdida",
    
    // Brand & Legal
    brandName: "TRADEBATTLE",
    tagline: "Plataforma de competición de trading simulado para traders aspirantes",
    termsOfService: "Términos de Servicio",
    privacyPolicy: "Política de Privacidad",
    cookiePolicy: "Política de Cookies",
    disclaimer: "Descargo de Responsabilidad",
    
    // Miscellaneous
    more: "Más",
    less: "Menos",
    all: "Todo",
    none: "Ninguno",
    other: "Otro",
    misc: "Misceláneo",
    details: "Detalles",
    summary: "Resumen",
    advanced: "Avanzado",
    basic: "Básico",
    actions: "Acciones",
    processing: "Procesando...",
    
    // Greetings
    goodMorning: "Buenos Días",
    goodAfternoon: "Buenas Tardes",
    goodEvening: "Buenas Noches",
    
    // Hub specific
    hubWelcomeMessage: "¿Listo para dejar tu marca en los mercados?",
    dashboardDescription: "Accede a tu panel de trading personal",
    joinTournamentDescription: "Compite contra traders de todo el mundo",
    leaderboardDescription: "Ve dónde te encuentras globalmente",
    events: "Eventos",
    
    // Additional UI messages
    startTradingMessage: "Comienza a operar para ver tus posiciones aquí",
    addedToAccount: "ha sido agregado a tu cuenta",
    withdrawnFromAccount: "ha sido retirado de tu cuenta",
    enterUsername: "Ingresa tu nombre de usuario",
    currentHoldings: "Posiciones Actuales",
    adminRole: "Administrador",
    supportTeam: "Soporte",
    invalidShares: "Por favor, ingresa un número válido de acciones",
    stockPurchased: "Acción comprada",
    sharesUnit: "acciones",
    sellPosition: "Vender acción",

    // Chat & Social
    globalChat: "Chat Global",
    noMessagesYet: "No hay mensajes aún. ¡Comienza la conversación!",
    messageEveryone: "Mensaje a todos...",
    viewFullProfile: "Ver Perfil Completo",
    sendTip: "Enviar Propina",
    sendTipTo: "Enviar Propina a",
    tipDescription: "Envía una propina de tu saldo para apoyar a este usuario.",
    enterAmount: "Ingresa el monto",
    yourBalance: "Tu saldo",
    sending: "Enviando...",

    // People
    searchByName: "Buscar por nombre o usuario...",
    newestMembers: "Miembros Recientes",
    oldestMembers: "Miembros Antiguos",
    mostTrades: "Más Operaciones",
    alphabetical: "Alfabético",
    allMembers: "Todos los Miembros",
    administrators: "Administradores",
    viewProfile: "Ver Perfil",
    backToPeople: "Volver a Personas",
    memberSince: "Miembro desde",
    totalTrades: "Total de Operaciones",
    tradingStreak: "Racha de Trading",
    tournamentsJoined: "Torneos Unidos",
    noPeopleFound: "No se encontraron personas",
    errorLoadingUsers: "Error al Cargar Usuarios",
    reloadPage: "Recargar Página",
    showing: "Mostrando",
    personUnit: "persona",
    peopleUnit: "personas",
    matching: "coincidiendo con",

    // Trades
    recentTrades: "Operaciones Recientes",
    noTradesYet: "Sin operaciones aún",
    bought: "Compró",
    sold: "Vendió",
    sharesAt: "acciones @",

    // Archive
    searchTournaments: "Buscar torneos...",
    noMatchingTournaments: "No se encontraron torneos",
    noCompletedTournaments: "No hay torneos completados aún",
    backToArchive: "Volver al Archivo",
    startingCash: "Capital Inicial",
    duration: "Duración",
    ended: "Terminado",
    finalLeaderboard: "Clasificación Final",
    noParticipantsRecorded: "Sin participantes registrados",
    tournamentNotFound: "Torneo no encontrado",
    goBack: "Volver",
    players: "Jugadores",

    // Rewards
    rewards: "Recompensas",
    comingSoon: "Próximamente",
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
  formatCurrency: (amount: number, sourceCurrency?: string) => string;
  convertAndFormatCurrency: (amount: number, sourceCurrency: string) => string;
  formatNumber: (value: number, decimals?: number) => string;
  exchangeRates: Record<string, number>;
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
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Initialize preferences from user data
  useEffect(() => {
    if (user) {
      setLanguage(user.language || 'English');
      setCurrency(user.currency || 'USD');
    }
  }, [user]);

  // Fetch exchange rates when currency changes
  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (currency !== 'USD') {
        try {
          const response = await fetch(`/api/exchange-rates/USD`);
          if (response.ok) {
            const data = await response.json();
            setExchangeRates(data.data.rates || {});
          }
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
          setExchangeRates({});
        }
      } else {
        setExchangeRates({});
      }
    };

    fetchExchangeRates();
  }, [currency]);

  // Translation function
  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.English;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  // Currency formatting function (backwards compatible)
  const formatCurrency = (amount: number, sourceCurrency: string = 'USD'): string => {
    // Convert amount if needed
    let convertedAmount = amount;
    if (sourceCurrency !== currency && exchangeRates[currency]) {
      convertedAmount = amount * exchangeRates[currency];
    }
    
    const currencyConfig = currencies[currency as keyof typeof currencies] || currencies.USD;
    const formatted = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
    
    if (currencyConfig.position === 'before') {
      return `${currencyConfig.symbol}${formatted}`;
    } else {
      return `${formatted}${currencyConfig.symbol}`;
    }
  };

  // Convert and format currency function
  const convertAndFormatCurrency = (amount: number, sourceCurrency: string): string => {
    return formatCurrency(amount, sourceCurrency);
  };

  // Format plain numbers with commas (for non-currency numbers)
  const formatNumber = (value: number, decimals: number = 0): string => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Update preferences function
  const updatePreferences = async (newLanguage?: string, newCurrency?: string) => {
    if (!user) return;

    const updates: any = {};
    if (newLanguage && newLanguage !== language) {
      updates.language = newLanguage;
    }
    if (newCurrency && newCurrency !== currency) {
      updates.currency = newCurrency;
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

        // Update state after successful API call
        if (newLanguage) setLanguage(newLanguage);
        if (newCurrency) setCurrency(newCurrency);
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw error; // Propagate error to caller
      }
    }
  };

  const value: UserPreferencesContextType = {
    language,
    currency,
    t,
    formatCurrency,
    convertAndFormatCurrency,
    formatNumber,
    exchangeRates,
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

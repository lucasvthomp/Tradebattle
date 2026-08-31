export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  cardPosition: "top" | "bottom" | "left" | "right" | "center";
  route?: string;
}

export const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Tradebattle!",
    description:
      "Let's take a quick look around. This'll only take a minute!",
    targetSelector: ".tour-hub-hero",
    cardPosition: "center",
  },
  {
    id: "balance",
    title: "Your Balance",
    description:
      "This is your arena cash. Use it to enter arenas, then tap to add capital or cash out.",
    targetSelector: '[data-tour="balance"]',
    cardPosition: "bottom",
  },
  {
    id: "sidebar",
    title: "Navigate Around",
    description:
      "Use the sidebar to jump between the Trading Floor, Arenas, Standings, and more.",
    targetSelector: '[data-tour="sidebar"]',
    cardPosition: "right",
  },
  {
    id: "tournaments",
    title: "Enter an arena",
    description:
      "Browse arenas, lock in your entry, and compete for the payout. This is where the action starts!",
    targetSelector: '[data-tour="nav-tournaments"]',
    cardPosition: "right",
  },
  {
    id: "chart",
    title: "Trading Floor",
    description:
      "Your command center. View live charts, track positions, and execute trades.",
    targetSelector: '[data-tour="chart-area"]',
    cardPosition: "center",
    route: "/dashboard",
  },
  {
    id: "trading",
    title: "Place a Trade",
    description:
      "Search for a stock, pick Buy or Short, set your amount, and confirm. Happy trading!",
    targetSelector: '[data-tour="trading-sidebar"]',
    cardPosition: "left",
  },
];

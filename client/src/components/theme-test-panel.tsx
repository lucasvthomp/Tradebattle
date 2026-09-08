import { useEffect, useState } from "react";
import { Palette, RotateCcw, X } from "lucide-react";

type ThemePreset = {
  id: string;
  label: string;
  swatches: [string, string];
  deep: string;
  base: string;
  mid: string;
  raised: string;
  purple: string;
  purpleLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
};

const DEFAULT_THEME = "trade";
const STORAGE_KEY = "tradebattle-theme-preview";

const themes: ThemePreset[] = [
  {
    id: "trade",
    label: "Trade",
    swatches: ["#7c3aed", "#f3c65b"],
    deep: "#0f0724",
    base: "#140b2b",
    mid: "#21113f",
    raised: "#2d1958",
    purple: "#7c3aed",
    purpleLight: "#a77bff",
    accent: "#f3c65b",
    accentDark: "#d5a73c",
    accentLight: "#ffdc79",
  },
  {
    id: "ocean",
    label: "Ocean",
    swatches: ["#1597b4", "#ffb24a"],
    deep: "#071c2b",
    base: "#0a2d40",
    mid: "#0e4d5c",
    raised: "#126b74",
    purple: "#1597b4",
    purpleLight: "#78e1e0",
    accent: "#ffb24a",
    accentDark: "#df7b2e",
    accentLight: "#ffd47d",
  },
  {
    id: "sunset",
    label: "Sunset",
    swatches: ["#d84e91", "#ffbd61"],
    deep: "#24101d",
    base: "#3b1629",
    mid: "#5b1f38",
    raised: "#7b2b42",
    purple: "#d84e91",
    purpleLight: "#ff9aca",
    accent: "#ffbd61",
    accentDark: "#dd7b3d",
    accentLight: "#ffdfa4",
  },
  {
    id: "field",
    label: "Field",
    swatches: ["#3ab77f", "#f2c95c"],
    deep: "#0c201b",
    base: "#10362a",
    mid: "#1b513c",
    raised: "#2a6b4e",
    purple: "#3ab77f",
    purpleLight: "#9af0bc",
    accent: "#f2c95c",
    accentDark: "#c39a35",
    accentLight: "#ffe79b",
  },
];

function rgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function applyTheme(theme: ThemePreset) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const site = document.querySelector<HTMLElement>(".tradebattle-site");
  const targets = [root, site].filter(Boolean) as HTMLElement[];
  const variables: Record<string, string> = {
    "--tb-purple-950": theme.deep,
    "--tb-purple-900": theme.base,
    "--tb-purple-850": theme.base,
    "--tb-purple-800": theme.mid,
    "--tb-purple-750": theme.mid,
    "--tb-purple-700": theme.raised,
    "--tb-purple-600": theme.purple,
    "--tb-purple-500": theme.purple,
    "--tb-purple-400": theme.purpleLight,
    "--tb-purple-300": theme.purpleLight,
    "--tb-purple-wash": rgba(theme.purpleLight, 0.12),
    "--tb-purple-edge": rgba(theme.purpleLight, 0.3),
    "--tb-purple-glow": rgba(theme.purpleLight, 0.22),
    "--tb-gold-800": theme.accentDark,
    "--tb-gold-700": theme.accentDark,
    "--tb-gold-600": theme.accentDark,
    "--tb-gold-500": theme.accent,
    "--tb-gold-400": theme.accentLight,
    "--tb-gold-300": theme.accentLight,
    "--tb-gold-wash": rgba(theme.accent, 0.12),
    "--tb-gold-edge": rgba(theme.accent, 0.34),
    "--tb-gold-glow": rgba(theme.accent, 0.24),
    "--tb-accent": theme.accent,
    "--tb-accent-1": theme.accentDark,
    "--tb-accent-2": theme.accent,
    "--tb-accent-3": theme.accentLight,
    "--tb-accent-4": theme.purpleLight,
    "--tb-state-positive": theme.accent,
    "--tb-state-info": theme.purpleLight,
    "--tb-surface-950": theme.deep,
    "--tb-surface-900": theme.base,
    "--tb-surface-850": theme.base,
    "--tb-surface-800": theme.mid,
    "--tb-surface-750": theme.mid,
    "--tb-surface-700": theme.raised,
    "--tb-border": rgba(theme.purpleLight, 0.3),
    "--site-bg": theme.base,
    "--site-panel": theme.mid,
    "--site-panel-raised": theme.raised,
    "--site-edge": rgba(theme.purpleLight, 0.3),
    "--site-mint": theme.accent,
    "--tb-gradient-page": `linear-gradient(160deg, ${theme.base} 0%, ${theme.mid} 52%, ${theme.base} 100%)`,
    "--tb-gradient-panel": `linear-gradient(180deg, ${theme.mid} 0%, ${theme.base} 100%)`,
    "--tb-gradient-panel-raised": `linear-gradient(135deg, ${theme.raised} 0%, ${theme.mid} 72%)`,
    "--tb-gradient-action": `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`,
    "--tb-gradient-action-hover": `linear-gradient(135deg, ${theme.accent}, ${theme.accentLight})`,
    "--tb-gradient-accent": `linear-gradient(135deg, ${theme.purple}, ${theme.purpleLight})`,
  };

  for (const target of targets) {
    for (const [name, value] of Object.entries(variables)) target.style.setProperty(name, value);
  }
}

export function ThemeTestPanel() {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    const theme = themes.find((item) => item.id === saved) || themes[0];
    setActiveTheme(theme.id);
    applyTheme(theme);
  }, []);

  const chooseTheme = (theme: ThemePreset) => {
    setActiveTheme(theme.id);
    window.localStorage.setItem(STORAGE_KEY, theme.id);
    applyTheme(theme);
  };

  const resetTheme = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    chooseTheme(themes[0]);
  };

  return (
    <aside className={`theme-test-panel ${open ? "is-open" : ""}`} aria-label="Theme testing panel">
      <button
        type="button"
        className="theme-test-tab"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="theme-test-drawer"
        title="Test color themes"
      >
        <Palette size={15} aria-hidden="true" />
        <span>Theme</span>
      </button>
      <div id="theme-test-drawer" className="theme-test-drawer" hidden={!open}>
        <div className="theme-test-heading">
          <div>
            <span className="theme-test-kicker">TEST MODE</span>
            <strong>Color themes</strong>
          </div>
          <button type="button" className="theme-test-close" onClick={() => setOpen(false)} aria-label="Close theme testing panel">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <p>Preview the unified palette across the whole site. Your choice stays local to this browser.</p>
        <div className="theme-test-options">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-test-option ${activeTheme === theme.id ? "is-selected" : ""}`}
              onClick={() => chooseTheme(theme)}
              aria-pressed={activeTheme === theme.id}
            >
              <span className="theme-test-swatches" aria-hidden="true">
                <i style={{ background: theme.swatches[0] }} />
                <i style={{ background: theme.swatches[1] }} />
              </span>
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="theme-test-reset" onClick={resetTheme}>
          <RotateCcw size={13} aria-hidden="true" /> Reset Trade theme
        </button>
      </div>
    </aside>
  );
}

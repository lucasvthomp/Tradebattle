import type { ReactNode, SVGProps } from "react";

export type TradebattleIconName =
  | "home"
  | "arena"
  | "blitz"
  | "rankings"
  | "players"
  | "rewards"
  | "support"
  | "settings"
  | "archive"
  | "admin"
  | "cash"
  | "chat"
  | "market"
  | "trend"
  | "success"
  | "search"
  | "close"
  | "refresh"
  | "arrow-right"
  | "chevron-right"
  | "timer"
  | "bell"
  | "flag"
  | "info";

type TradebattleIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: TradebattleIconName;
  size?: number | string;
};

const iconShapes: Record<TradebattleIconName, ReactNode> = {
  home: (
    <g>
      <path d="M4.5 10.6 12 4.8l7.5 5.8v7.6a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z" />
      <path d="M9.2 19.2v-5.4h5.6v5.4M3.8 10.8 12 4.4l8.2 6.4" />
      <path className="tradebattle-custom-icon-accent" d="M8.4 10.7h7.2" />
    </g>
  ),
  arena: (
    <g>
      <rect x="3.6" y="4.2" width="16.8" height="15.6" rx="3.2" />
      <path d="M7.3 15.6V9.2M10.8 15.6v-3.9M14.3 15.6V7.4M17.8 15.6v-6" />
      <path className="tradebattle-custom-icon-accent" d="m6.5 12.8 3-2.1 3.2 1.4 4.8-4" />
      <path className="tradebattle-custom-icon-accent" d="M15.8 8.1h1.7v1.7" />
    </g>
  ),
  blitz: (
    <g>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.8v4.7l3.1 1.8" />
      <path className="tradebattle-custom-icon-accent" d="m16.8 5.5 2.6.2-.2 2.6M19.2 5.7a8.2 8.2 0 0 1 1 4.1" />
      <path d="M7.2 18.5a8.2 8.2 0 0 1-3-5.9" />
    </g>
  ),
  rankings: (
    <g>
      <path d="M4.2 18.9h15.6" />
      <rect x="5.1" y="13.2" width="3.6" height="5.7" rx="1" />
      <rect x="10.2" y="8.9" width="3.6" height="10" rx="1" />
      <rect x="15.3" y="11.1" width="3.6" height="7.8" rx="1" />
      <path className="tradebattle-custom-icon-accent" d="M12 4.1v3.2M10.4 5.7h3.2" />
    </g>
  ),
  players: (
    <g>
      <circle cx="9" cy="8.4" r="3" />
      <path d="M3.8 18.7c.3-3.2 2.1-5 5.2-5s4.9 1.8 5.2 5M15.8 10.6a2.5 2.5 0 1 0-.4-4.9M16.1 14.2c2.3.3 3.7 1.8 4.1 4.5" />
      <path className="tradebattle-custom-icon-accent" d="M7.1 8.4h3.8" />
    </g>
  ),
  rewards: (
    <g>
      <path d="M4.3 8.1h15.4v10.2a1.4 1.4 0 0 1-1.4 1.4H5.7a1.4 1.4 0 0 1-1.4-1.4z" />
      <path d="M3.6 8.1h16.8v-2A1.6 1.6 0 0 0 18.8 4H5.2a1.6 1.6 0 0 0-1.6 1.6zM12 8.1v11.6" />
      <circle className="tradebattle-custom-icon-accent-fill" cx="15.9" cy="12.5" r="2.2" />
      <path d="M15.9 11.5v2M14.9 12.5h2" />
    </g>
  ),
  support: (
    <g>
      <path d="M4.1 5.3h15.8v10.4H10l-4.9 3v-3H4.1z" />
      <path className="tradebattle-custom-icon-accent" d="M8 9.2h8M8 12.1h5.4" />
    </g>
  ),
  settings: (
    <g>
      <path d="m12 3.8 1.1 1.8 2.1.5 1.8-1.1 1.2 1.2-1.1 1.8.5 2.1 1.8 1.1v1.7l-1.8 1.1-.5 2.1 1.1 1.8-1.2 1.2-1.8-1.1-2.1.5-1.1 1.8h-1.7l-1.1-1.8-2.1-.5-1.8 1.1-1.2-1.2 1.1-1.8-.5-2.1-1.8-1.1v-1.7l1.8-1.1.5-2.1-1.1-1.8 1.2-1.2 1.8 1.1 2.1-.5 1.1-1.8z" />
      <circle cx="12" cy="12" r="3.1" />
      <circle className="tradebattle-custom-icon-accent-fill" cx="12" cy="12" r="1" />
    </g>
  ),
  archive: (
    <g>
      <path d="M4.1 6.3h15.8v12.1a1.3 1.3 0 0 1-1.3 1.3H5.4a1.3 1.3 0 0 1-1.3-1.3z" />
      <path d="M3.7 6.3V4.8h16.6v1.5M9 11.1h6M10.2 14.1h3.6" />
      <path className="tradebattle-custom-icon-accent" d="M8.2 4.8v2M15.8 4.8v2" />
    </g>
  ),
  admin: (
    <g>
      <path d="M12 3.5 19 6v5.4c0 4.2-2.6 7.3-7 9.1-4.4-1.8-7-4.9-7-9.1V6z" />
      <path className="tradebattle-custom-icon-accent" d="M9.6 11.8a2.4 2.4 0 1 1 4.8 0v1.1H9.6zM12 12.9v3.1" />
    </g>
  ),
  cash: (
    <g>
      <ellipse cx="9" cy="7.2" rx="5.7" ry="2.2" />
      <path d="M3.3 7.2v4.2c0 1.2 2.6 2.2 5.7 2.2s5.7-1 5.7-2.2V7.2M6 13.4v3.4c0 1.2 2.6 2.2 5.7 2.2s5.7-1 5.7-2.2v-4.1" />
      <path className="tradebattle-custom-icon-accent" d="M18.5 8.4h1.2v5.8" />
      <circle className="tradebattle-custom-icon-accent-fill" cx="9" cy="7.2" r="1.1" />
    </g>
  ),
  chat: (
    <g>
      <path d="M3.8 5.2h16.4v10.5H10l-5.1 3.1v-3H3.8z" />
      <path className="tradebattle-custom-icon-accent" d="M8 9.5h8M8 12.2h5.1" />
    </g>
  ),
  market: (
    <g>
      <path d="M4.1 19.1h15.8M5.6 15.6v-4.1M10.1 15.6V8.4M14.6 15.6v-5.2M19.1 15.6V6.1" />
      <path className="tradebattle-custom-icon-accent" d="m4.8 10.4 4-2.3 4.3 1.1 5.8-5" />
      <path className="tradebattle-custom-icon-accent" d="M16.8 4.2h2.1v2.1" />
    </g>
  ),
  trend: (
    <g>
      <path d="M4.1 17.8 8.4 13l3.2 2.3 7-8.1" />
      <path className="tradebattle-custom-icon-accent" d="M14.8 7.2h3.8V11" />
      <circle className="tradebattle-custom-icon-accent-fill" cx="8.4" cy="13" r="1.3" />
      <circle className="tradebattle-custom-icon-accent-fill" cx="11.6" cy="15.3" r="1.3" />
    </g>
  ),
  success: (
    <g>
      <circle cx="12" cy="12" r="8.3" />
      <path className="tradebattle-custom-icon-accent" d="m8 12.2 2.6 2.6 5.6-5.7" />
    </g>
  ),
  search: (
    <g>
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4.5 4.5" />
      <path className="tradebattle-custom-icon-accent" d="M8.5 10.8h4.6" />
    </g>
  ),
  close: (
    <g>
      <path d="m7 7 10 10M17 7 7 17" />
      <circle className="tradebattle-custom-icon-accent" cx="12" cy="12" r="8.2" />
    </g>
  ),
  refresh: (
    <g>
      <path d="M18.6 8.8A7.1 7.1 0 1 0 19 13" />
      <path className="tradebattle-custom-icon-accent" d="M15.7 5.2h3.8V9" />
    </g>
  ),
  "arrow-right": (
    <g>
      <path d="M4.2 12h14.7" />
      <path className="tradebattle-custom-icon-accent" d="m14.5 7.6 4.4 4.4-4.4 4.4" />
    </g>
  ),
  "chevron-right": (
    <path className="tradebattle-custom-icon-accent" d="m9.3 5.9 6.1 6.1-6.1 6.1" />
  ),
  timer: (
    <g>
      <circle cx="12" cy="13" r="7.1" />
      <path d="M9.5 3.8h5M12 5.8V4M12 13l3.2-2.1" />
      <path className="tradebattle-custom-icon-accent" d="M17.8 7.2 19.1 6" />
    </g>
  ),
  bell: (
    <g>
      <path d="M5.5 16.6h13l-1.5-2.2V10a5 5 0 0 0-10 0v4.4z" />
      <path d="M9.7 19.1h4.6" />
      <path className="tradebattle-custom-icon-accent" d="M12 5v1.2" />
    </g>
  ),
  flag: (
    <g>
      <path d="M6.3 20V4.2M6.3 5.1c3.3-2 5.3 2 9.7 0v7.1c-4.4 2-6.4-2-9.7 0" />
      <path className="tradebattle-custom-icon-accent" d="M6.3 17.2h4.1" />
    </g>
  ),
  info: (
    <g>
      <circle cx="12" cy="12" r="8.2" />
      <path className="tradebattle-custom-icon-accent" d="M12 10.9v5M12 7.9h.01" />
    </g>
  ),
};

export function TradebattleIcon({ name, size = 20, className, style, ...props }: TradebattleIconProps) {
  return (
    <svg
      {...props}
      className={["tradebattle-custom-icon", "tradebattle-custom-icon-" + name, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
      focusable="false"
      style={style}
      data-icon="tradebattle"
    >
      {iconShapes[name]}
    </svg>
  );
}

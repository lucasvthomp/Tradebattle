import type { CSSProperties } from "react";

export type GameIconName =
  | "bell"
  | "briefcase"
  | "chart"
  | "chest"
  | "coins"
  | "controller"
  | "gift"
  | "gears"
  | "lightning"
  | "market-arrows"
  | "market-tile"
  | "medal"
  | "rocket"
  | "shield"
  | "swords"
  | "target"
  | "trading-calendar"
  | "exchange-bell"
  | "trophy";

const iconSources: Record<GameIconName, string> = {
  bell: "/assets/tradebattle-visuals/bell.png",
  briefcase: "/assets/tradebattle-visuals/money-bag.png",
  chart: "/assets/tradebattle-visuals/market-chart.png",
  chest: "/assets/tradebattle-visuals/chest.png",
  coins: "/assets/tradebattle-visuals/money-bag.png",
  controller: "/assets/tradebattle-visuals/controller.png",
  gift: "/assets/tradebattle-visuals/gift.png",
  gears: "/assets/tradebattle-visuals/gears.png",
  lightning: "/assets/tradebattle-visuals/lightning.png",
  "market-arrows": "/assets/tradebattle-visuals/market-arrows.png",
  "market-tile": "/assets/tradebattle-visuals/market-chart.png",
  medal: "/assets/tradebattle-visuals/medal.png",
  rocket: "/assets/tradebattle-visuals/rocket.png",
  shield: "/assets/tradebattle-visuals/shield.png",
  swords: "/assets/tradebattle-visuals/swords.png",
  target: "/assets/tradebattle-visuals/target.png",
  "trading-calendar": "/assets/tradebattle-visuals/trading-calendar.png",
  "exchange-bell": "/assets/tradebattle-visuals/exchange-bell.png",
  trophy: "/assets/tradebattle-visuals/trophy.png",
};

type GameIconProps = {
  name: GameIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
};

export function GameIcon({ name, size = 32, className, style, alt = "" }: GameIconProps) {
  return (
    <img
      src={iconSources[name]}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", ...style }}
    />
  );
}

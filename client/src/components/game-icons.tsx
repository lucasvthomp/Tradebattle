import type { CSSProperties } from "react";

export type GameIconName =
  | "bell"
  | "briefcase"
  | "chart"
  | "chest"
  | "coins"
  | "gift"
  | "lightning"
  | "market-tile"
  | "medal"
  | "shield"
  | "swords"
  | "trophy";

const iconSources: Record<GameIconName, string> = {
  bell: "/assets/tradebattle-icon-bell.png",
  briefcase: "/assets/tradebattle-icon-briefcase.png",
  chart: "/assets/tradebattle-icon-chart.png",
  chest: "/assets/tradebattle-icon-chest.png",
  coins: "/assets/tradebattle-icon-coins.png",
  gift: "/assets/tradebattle-icon-gift.png",
  lightning: "/assets/tradebattle-icon-lightning.png",
  "market-tile": "/assets/tradebattle-icon-market-tile.png",
  medal: "/assets/tradebattle-icon-medal.png",
  shield: "/assets/tradebattle-icon-shield.png",
  swords: "/assets/tradebattle-icon-swords.png",
  trophy: "/assets/tradebattle-icon-trophy.png",
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

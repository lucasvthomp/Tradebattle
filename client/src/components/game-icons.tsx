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
  bell: "/assets/tradebattle-visuals/bell.png",
  briefcase: "/assets/tradebattle-visuals/money-bag.png",
  chart: "/assets/tradebattle-visuals/market-chart.png",
  chest: "/assets/tradebattle-visuals/chest.png",
  coins: "/assets/tradebattle-visuals/money-bag.png",
  gift: "/assets/tradebattle-visuals/gift.png",
  lightning: "/assets/tradebattle-visuals/lightning.png",
  "market-tile": "/assets/tradebattle-visuals/market-chart.png",
  medal: "/assets/tradebattle-visuals/medal.png",
  shield: "/assets/tradebattle-visuals/shield.png",
  swords: "/assets/tradebattle-visuals/swords.png",
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

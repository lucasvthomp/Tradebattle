import { TradebattleIcon } from "@/components/tradebattle-icons";
import { WidgetWrapper } from "./WidgetWrapper";
import { Trophy } from "lucide-react";
import { TournamentLeaderboard } from "@/components/tournaments/TournamentLeaderboard";

interface LeaderboardWidgetProps {
  tournamentId: number;
  onViewFull: () => void;
  onRemove?: () => void;
}

export function LeaderboardWidget({
  tournamentId,
  onViewFull,
  onRemove
}: LeaderboardWidgetProps) {
  return (
    <WidgetWrapper
      title="Rankings"
      icon={<TradebattleIcon name="rankings" className="w-4 h-4" />}
      onRemove={onRemove}
    >
      <TournamentLeaderboard
        tournamentId={tournamentId}
        onViewFullLeaderboard={onViewFull}
      />
    </WidgetWrapper>
  );
}

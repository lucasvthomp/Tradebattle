import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Trophy, DollarSign, Users } from "lucide-react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface BuyInIncentiveBoxProps {
  buyInAmount: number;
  maxPlayers: number;
  currentPlayers?: number;
  variant?: "tournament" | "creation" | "join";
}

export function BuyInIncentiveBox({ 
  buyInAmount, 
  maxPlayers, 
  currentPlayers = 0,
  variant = "tournament" 
}: BuyInIncentiveBoxProps) {
  const { formatCurrency } = useUserPreferences();
  
  if (buyInAmount <= 0) return null;

  const totalPot = buyInAmount * maxPlayers;
  const currentPot = buyInAmount * currentPlayers;
  const winnerAmount = totalPot * 0.95;
  const platformFee = totalPot * 0.05;

  const getVariantStyles = () => {
    switch (variant) {
      case "creation":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "join":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "creation":
        return "text-green-600";
      case "join":
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "creation":
        return "text-green-800 dark:text-green-200";
      case "join":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-yellow-800 dark:text-yellow-200";
    }
  };

  const getSecondaryTextColor = () => {
    switch (variant) {
      case "creation":
        return "text-green-700 dark:text-green-300";
      case "join":
        return "text-blue-700 dark:text-blue-300";
      default:
        return "text-yellow-700 dark:text-yellow-300";
    }
  };

  return (
    <Card className={`border ${getVariantStyles()}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Gift className={`w-5 h-5 ${getIconColor()}`} />
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {variant === "creation" 
              ? "Buy-in Tournament Benefits"
              : variant === "join"
              ? "Tournament Prize Pool"
              : "Prize Pool Active"
            }
          </p>
          <Badge variant="secondary" className="text-xs">
            <Trophy className="w-3 h-3 mr-1" />
            {formatCurrency(buyInAmount)} entry
          </Badge>
        </div>

        {/* Prize breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className={`text-lg font-bold ${getTextColor()}`}>
              {formatCurrency(currentPlayers > 0 ? currentPot : totalPot)}
            </div>
            <div className={`text-xs ${getSecondaryTextColor()}`}>
              {currentPlayers > 0 ? "Current" : "Max"} Prize Pool
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getTextColor()}`}>
              {formatCurrency(winnerAmount)}
            </div>
            <div className={`text-xs ${getSecondaryTextColor()}`}>
              Winner Takes (95%)
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className={`text-xs ${getSecondaryTextColor()} space-y-1`}>
          {variant === "creation" ? (
            <>
              <div className="flex items-center space-x-2">
                <Trophy className="w-3 h-3" />
                <span>Creates competitive prize pool for winners</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3" />
                <span>Attracts more serious and skilled traders</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-3 h-3" />
                <span>Platform takes only 5% commission</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span>Entry Fee:</span>
                <span className="font-medium">{formatCurrency(buyInAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform Fee:</span>
                <span className="font-medium">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Players:</span>
                <span className="font-medium">{currentPlayers}/{maxPlayers}</span>
              </div>
            </>
          )}
        </div>

        {/* Progress bar for current vs max pot */}
        {currentPlayers > 0 && currentPlayers < maxPlayers && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className={getSecondaryTextColor()}>Prize Pool Progress</span>
              <span className={getSecondaryTextColor()}>{Math.round((currentPlayers / maxPlayers) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  variant === "creation" ? "bg-green-500" :
                  variant === "join" ? "bg-blue-500" : "bg-yellow-500"
                }`}
                style={{ width: `${(currentPlayers / maxPlayers) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
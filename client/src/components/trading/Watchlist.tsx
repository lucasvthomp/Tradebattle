import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchlistProps {
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  tournamentId?: number;
}

export function Watchlist({ selectedSymbol, onSymbolSelect, tournamentId }: WatchlistProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: popularData, isLoading: isLoadingPopular } = useQuery({
    queryKey: ["/api/popular", tournamentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tournamentId) params.append('tournamentId', tournamentId.toString());
      const url = `/api/popular${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch popular stocks');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["/api/search", searchQuery, tournamentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tournamentId) params.append('tournamentId', tournamentId.toString());
      const url = `/api/search/${searchQuery}${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const watchlistItems = useMemo(() => {
    const stocks = (popularData as any)?.data || [];
    return stocks.map((s: any) => ({
      symbol: s.symbol,
      price: s.price || 0,
      change: s.change || 0,
      percentChange: s.percentChange || 0,
    }));
  }, [popularData]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const results = (searchData as any)?.data || [];
    return results.slice(0, 6);
  }, [searchData, searchQuery]);

  const handleSearchSelect = (symbol: string) => {
    onSymbolSelect(symbol);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div
        className="px-3 py-2.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid #0E2040" }}
      >
        <h3 className="text-sm font-bold" style={{ color: "#E3B341" }}>
          Watchlist
        </h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{
            backgroundColor: "rgba(6, 182, 212, 0.15)",
            color: "#E3B341",
          }}
        >
          {watchlistItems.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-3 py-2" style={{ borderBottom: "1px solid #0E2040" }}>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "#94A3B8" }}
          />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="h-8 pl-8 text-xs"
            style={{
              backgroundColor: "#080C14",
              borderColor: "#0E2040",
              color: "#FFFFFF",
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.length >= 2 && (
          <div
            className="mt-1 rounded-lg overflow-hidden"
            style={{ backgroundColor: "#080C14", border: "1px solid #0E2040" }}
          >
            {isSearching ? (
              <div className="px-3 py-2 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result: any) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSearchSelect(result.symbol)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-[#091525] flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-bold" style={{ color: "#FFFFFF" }}>
                      {result.symbol}
                    </span>
                    {result.name && (
                      <span className="ml-2" style={{ color: "#94A3B8" }}>
                        {result.name}
                      </span>
                    )}
                  </div>
                  {result.exchange && (
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>
                      {result.exchange}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center">
                <span className="text-xs" style={{ color: "#94A3B8" }}>
                  No stocks found
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock List */}
      <ScrollArea className="flex-1">
        {isLoadingPopular ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="px-3 py-2.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(31, 41, 55, 0.5)" }}
              >
                <Skeleton className="h-4 w-12" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : watchlistItems.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <span className="text-xs" style={{ color: "#94A3B8" }}>
              No stocks available
            </span>
          </div>
        ) : (
          watchlistItems.map((item: any) => (
            <button
              key={item.symbol}
              onClick={() => onSymbolSelect(item.symbol)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs transition-colors hover:bg-[#091525]"
              style={{
                backgroundColor: selectedSymbol === item.symbol ? "#091525" : "transparent",
                borderLeft: selectedSymbol === item.symbol ? "2px solid #E3B341" : "2px solid transparent",
                borderBottom: "1px solid rgba(31, 41, 55, 0.5)",
              }}
            >
              <span
                className="font-bold"
                style={{ color: selectedSymbol === item.symbol ? "#E3B341" : "#FFFFFF" }}
              >
                {item.symbol}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium" style={{ color: "#F1F5F9" }}>
                  ${item.price.toFixed(2)}
                </span>
                <span
                  className="font-semibold min-w-[60px] text-right"
                  style={{ color: item.change >= 0 ? "#10B981" : "#EF4444" }}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.percentChange.toFixed(2)}%
                </span>
              </div>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}

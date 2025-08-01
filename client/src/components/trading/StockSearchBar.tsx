import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StockSearchBarProps {
  type: "purchase" | "watchlist";
  placeholder?: string;
}

export function StockSearchBar({ type, placeholder }: StockSearchBarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);

  // Search for stocks
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length > 1,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      return apiRequest("POST", `/api/watchlist`, { symbol });
    },
    onSuccess: () => {
      toast({ title: "Stock added to watchlist!" });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      setSearchQuery("");
      setSelectedStock(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add to watchlist",
        variant: "destructive"
      });
    }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(`/api/quote/${searchQuery.toUpperCase()}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedStock(data.data);
      } else {
        toast({
          title: "Stock not found",
          description: "Please check the symbol and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for stock",
        variant: "destructive"
      });
    }
  };

  const handleAddToWatchlist = () => {
    if (selectedStock) {
      addToWatchlistMutation.mutate(selectedStock.symbol);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder || `Search stocks to ${type === 'purchase' ? 'buy' : 'watch'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSearch}
          disabled={!searchQuery.trim() || searchLoading}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {selectedStock && (
        <div className="p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{selectedStock.symbol}</h4>
              <p className="text-sm text-muted-foreground">{selectedStock.companyName || selectedStock.shortName}</p>
              <p className="text-sm font-medium">${selectedStock.price?.toFixed(2)}</p>
            </div>
            <div className="flex space-x-2">
              {type === "watchlist" && (
                <Button
                  size="sm"
                  onClick={handleAddToWatchlist}
                  disabled={addToWatchlistMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Watchlist
                </Button>
              )}
              {type === "purchase" && (
                <Button
                  size="sm"
                  onClick={() => {
                    // This would open a buy dialog - we'll implement this next
                    toast({ title: "Buy dialog would open here" });
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Buy Stock
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
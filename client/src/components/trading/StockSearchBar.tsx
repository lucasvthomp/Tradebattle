import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { BuyStockDialog } from "./BuyStockDialog";

interface StockSearchBarProps {
  type: "purchase" | "watchlist";
  placeholder?: string;
  tournamentId?: number;
  onStockSelect?: (stock: any) => void;
}

export function StockSearchBar({ type, placeholder, tournamentId, onStockSelect }: StockSearchBarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatCurrency, t } = useUserPreferences();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for stocks with debouncing
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/search", searchQuery],
    enabled: searchQuery.length > 1,
    staleTime: 5000, // Cache for 5 seconds
  });

  const suggestions = (searchResults as any)?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when we have results
  useEffect(() => {
    if (suggestions.length > 0 && searchQuery.length > 1) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [suggestions, searchQuery]);

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (watchlistData: any) => {
      return apiRequest("POST", `/api/watchlist`, watchlistData);
    },
    onSuccess: () => {
      toast({ title: t('addToWatchlist') });
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

  const handleSelectStock = async (stock: any) => {
    try {
      const response = await fetch(`/api/quote/${stock.symbol}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedStock({ ...stock, price: data.data.price });
        setShowDropdown(false);
        setSearchQuery(stock.symbol);
        
        // For watchlist type, automatically add to watchlist when stock is selected
        if (type === "watchlist") {
          const watchlistData = {
            symbol: stock.symbol,
            companyName: stock.name || stock.shortName || stock.companyName || stock.symbol,
            notes: ""
          };
          addToWatchlistMutation.mutate(watchlistData);
        } else if (type === "purchase") {
          if (onStockSelect) {
            // Use parent callback for purchase (dashboard handles this)
            onStockSelect({ ...stock, price: data.data.price });
            setSearchQuery("");
            setSelectedStock(null);
          } else {
            // Fallback to internal dialog
            setShowBuyDialog(true);
          }
        }
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
        description: "Failed to get stock price",
        variant: "destructive"
      });
    }
  };

  const handleAddToWatchlist = () => {
    if (selectedStock) {
      const watchlistData = {
        symbol: selectedStock.symbol,
        companyName: selectedStock.name || selectedStock.shortName || selectedStock.companyName || selectedStock.symbol,
        notes: ""
      };
      addToWatchlistMutation.mutate(watchlistData);
      setSearchQuery("");
      setSelectedStock(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectStock(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setHighlightedIndex(-1);
    if (value.length === 0) {
      setSelectedStock(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder || `Search stocks to ${type === 'purchase' ? 'buy' : 'watch'}...`}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => {
            if (suggestions.length > 0 && searchQuery.length > 1) {
              setShowDropdown(true);
            }
          }}
          className="pl-10"
        />
        {searchLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown with suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.slice(0, 8).map((stock: any, index: number) => (
            <div
              key={stock.symbol || index}
              className={`px-4 py-3 cursor-pointer border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors ${
                index === highlightedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSelectStock(stock)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {stock.name || stock.shortName || stock.companyName}
                    </span>
                  </div>
                  {stock.exchange && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {stock.exchange}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {type === 'purchase' ? 'Buy' : 'Watch'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected stock actions */}
      {selectedStock && (
        <div className="mt-3 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{selectedStock.symbol}</h4>
              <p className="text-sm text-muted-foreground">{selectedStock.name || selectedStock.shortName || selectedStock.companyName}</p>
              {selectedStock.price && (
                <p className="text-sm font-medium">{formatCurrency(selectedStock.price)}</p>
              )}
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
                  onClick={() => setShowBuyDialog(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Buy Stock
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Buy Stock Dialog */}
      <BuyStockDialog
        open={showBuyDialog}
        onOpenChange={setShowBuyDialog}
        stock={selectedStock}
      />
    </div>
  );
}
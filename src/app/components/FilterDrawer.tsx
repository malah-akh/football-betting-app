import * as React from "react";

import { Button } from "@/app/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/components/ui/utils";
import { Search } from "lucide-react";

export type MatchStatus = "ALL" | "LIVE" | "UPCOMING" | "FINISHED";

export interface FilterState {
  status: MatchStatus;
  country: string[];
  league: string | null;
  hasTip: boolean;
  premiumOnly: boolean;
}

export interface LeagueOption {
  name: string;
  country: string;
}

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
  availableCountries: string[];
  availableLeagues: LeagueOption[];
}

export function FilterDrawer({
  open,
  onOpenChange,
  currentFilters,
  onApply,
  onReset,
  availableCountries,
  availableLeagues,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(currentFilters);
  const [countrySearchQuery, setCountrySearchQuery] = React.useState("");
  const [leagueSearchQuery, setLeagueSearchQuery] = React.useState("");
  const [visibleLeaguesCount, setVisibleLeaguesCount] = React.useState(5);

  const filteredCountries = React.useMemo(() => {
    return availableCountries.filter((country) =>
      country.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [availableCountries, countrySearchQuery]);

  const filteredLeagues = React.useMemo(() => {
    // Safety check for availableLeagues
    if (!availableLeagues) return [];

    // First, filter by selected countries in the local state
    let leagues = availableLeagues;
    if (localFilters.country.length > 0) {
      leagues = leagues.filter((l) => l && l.country && localFilters.country.includes(l.country));
    }
    
    // Then filter by search query
    return leagues
      .filter((l) => l && l.name && l.name.toLowerCase().includes(leagueSearchQuery.toLowerCase()))
      .map(l => l.name); // Convert back to string[] for display
  }, [availableLeagues, leagueSearchQuery, localFilters.country]);

  const displayedLeagues = React.useMemo(() => {
    return filteredLeagues.slice(0, visibleLeaguesCount);
  }, [filteredLeagues, visibleLeaguesCount]);

  // Sync local state when drawer opens or currentFilters change externally
  React.useEffect(() => {
    if (open) {
      setLocalFilters(currentFilters);
      setCountrySearchQuery(""); // Reset search on reopen
      setLeagueSearchQuery(""); // Reset search on reopen
      setVisibleLeaguesCount(5); // Reset paging on reopen
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    // Ideally the parent will update currentFilters which will trigger the useEffect,
    // but we can also anticipate the reset state if we knew the defaults.
    // For now, let's rely on the parent updating `currentFilters` or simply closing.
    // However, usually "Reset" might just reset the form but keep it open?
    // The prompt says "onReset: () => void".
    // I'll assume onReset clears the parent state.
    // If we want to clear local state immediately for UX:
    setLocalFilters({
        status: "ALL",
        country: [],
        league: null,
        hasTip: false,
        premiumOnly: false,
    });
  };

  const toggleStatus = (status: MatchStatus) => {
    setLocalFilters((prev) => ({ ...prev, status }));
  };

  const toggleCountry = (country: string) => {
    setLocalFilters((prev) => {
      const currentCountries = prev.country;
      const isSelected = currentCountries.includes(country);
      return {
        ...prev,
        country: isSelected
          ? currentCountries.filter((c) => c !== country)
          : [...currentCountries, country],
      };
    });
  };

  const toggleLeague = (league: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      league: prev.league === league ? null : league,
    }));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] flex flex-col bg-slate-50 rounded-t-[20px] max-w-7xl mx-auto">
        <DrawerHeader className="text-left px-5 pt-6 pb-2">
          <DrawerTitle className="text-xl font-bold text-[#3e4855]">Filter Matches</DrawerTitle>
          <DrawerDescription className="text-gray-500">
            Customize your feed to find the best opportunities.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-8">
          {/* Status Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#3e4855] uppercase tracking-wider">
              Match Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["ALL", "LIVE", "UPCOMING", "FINISHED"] as MatchStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm border",
                    localFilters.status === status
                      ? "bg-[#3e4855] text-white border-[#3e4855] shadow-md transform scale-[1.02]"
                      : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                  )}
                >
                  {status === "ALL" ? "All Matches" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Content Filters */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold text-[#3e4855] uppercase tracking-wider">
              Content Preferences
            </h3>
            <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex flex-col">
                    <Label htmlFor="has-tip" className="text-base font-semibold text-[#3e4855]">Matches with Tips</Label>
                    <span className="text-xs text-gray-400">Only show analyzed games</span>
                </div>
                <Switch
                  id="has-tip"
                  checked={localFilters.hasTip}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, hasTip: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between pt-3">
                <div className="flex flex-col">
                    <Label htmlFor="premium-only" className="text-base font-semibold text-[#3e4855]">Premium Only</Label>
                    <span className="text-xs text-gray-400">High-confidence VIP selections</span>
                </div>
                
                <Switch
                  id="premium-only"
                  checked={localFilters.premiumOnly}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, premiumOnly: checked }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Country Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[#3e4855] uppercase tracking-wider">
              Country
            </h3>
            
            {/* Country Search */}
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search countries..."
                 value={countrySearchQuery}
                 onChange={(e) => setCountrySearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3e4855]/20 focus:border-[#3e4855] transition-all"
               />
            </div>

            <div className="flex flex-wrap gap-2">
                {filteredCountries.length > 0 ? filteredCountries.map((country) => (
                  <button
                    type="button"
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm",
                      localFilters.country.includes(country)
                        ? "bg-[#3e4855] text-white border-[#3e4855] shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {country}
                  </button>
                )) : <span className="text-sm text-gray-400 italic w-full text-center py-2">No countries match your search</span>}
            </div>
          </section>

          {/* League Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#3e4855] uppercase tracking-wider">
                League
                </h3>
                {localFilters.league && (
                    <button type="button" onClick={() => toggleLeague(localFilters.league!)} className="text-xs text-red-500 font-medium px-2">Clear</button>
                )}
            </div>

            {/* League Search */}
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search leagues..."
                 value={leagueSearchQuery}
                 onChange={(e) => {
                    setLeagueSearchQuery(e.target.value);
                    setVisibleLeaguesCount(5); // Reset visible count on search
                 }}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3e4855]/20 focus:border-[#3e4855] transition-all"
               />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {displayedLeagues.length > 0 ? (
                <>
                  {displayedLeagues.map((league) => (
                    <button
                      type="button"
                      key={league}
                      onClick={() => toggleLeague(league)}
                      className={cn(
                        "w-full text-left px-5 py-3.5 text-sm transition-colors flex items-center justify-between group",
                        localFilters.league === league
                          ? "bg-slate-50 text-[#3e4855] font-bold"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span className="truncate pr-4">{league}</span>
                      {localFilters.league === league && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3e4855]" />
                      )}
                    </button>
                  ))}
                  {displayedLeagues.length < filteredLeagues.length && (
                      <button 
                        type="button"
                        onClick={() => setVisibleLeaguesCount(prev => prev + 10)}
                        className="w-full py-3 text-xs font-semibold text-[#3e4855] bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        Show More ({filteredLeagues.length - displayedLeagues.length})
                      </button>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400 italic">
                  {availableLeagues.length === 0 
                     ? (localFilters.country.length > 0 ? "No leagues found for selected countries." : "Select active matches to see leagues.") 
                     : "No leagues match your search."}
                </div>
              )}
            </div>
          </section>
        </div>

        <DrawerFooter className="pt-4 pb-8 px-5 border-t border-gray-100 bg-white">
          <Button onClick={handleApply} className="w-full bg-[#3e4855] hover:bg-[#2d3540] h-12 text-base font-bold rounded-xl shadow-md">
            Apply Filters
          </Button>
          <Button variant="ghost" onClick={handleReset} className="w-full text-gray-500 h-10 mt-2 hover:bg-gray-50 rounded-xl">
            Reset All
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import * as React from "react";

import { Button } from "@/app/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/app/components/ui/drawer";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/components/ui/utils";

export type MatchStatus = "ALL" | "LIVE" | "UPCOMING" | "FINISHED";

export interface FilterState {
  status: MatchStatus;
  country: string | null;
  league: string | null;
  hasTip: boolean;
  premiumOnly: boolean;
}

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
  availableCountries: string[];
  availableLeagues: string[];
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

  // Sync local state when drawer opens or currentFilters change externally
  React.useEffect(() => {
    if (open) {
      setLocalFilters(currentFilters);
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
        country: null,
        league: null,
        hasTip: false,
        premiumOnly: false,
    });
  };

  const toggleStatus = (status: MatchStatus) => {
    setLocalFilters((prev) => ({ ...prev, status }));
  };

  const toggleCountry = (country: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      country: prev.country === country ? null : country,
    }));
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
            <ScrollArea className="w-full whitespace-nowrap -mx-5 px-5">
              <div className="flex w-max gap-3 pb-2">
                {availableCountries.length > 0 ? availableCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-semibold transition-all border shadow-sm",
                      localFilters.country === country
                        ? "bg-[#3e4855] text-white border-[#3e4855] shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {country}
                  </button>
                )) : <span className="text-sm text-gray-400 italic">No specific countries found</span>}
              </div>
            </ScrollArea>
          </section>

          {/* League Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#3e4855] uppercase tracking-wider">
                League
                </h3>
                {localFilters.league && (
                    <button onClick={() => toggleLeague(localFilters.league!)} className="text-xs text-red-500 font-medium px-2">Clear</button>
                )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {availableLeagues.length > 0 ? availableLeagues.map((league) => (
                <button
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
              )) : (
                <div className="p-4 text-center text-sm text-gray-400 italic">
                  {localFilters.country ? "No leagues found for this country." : "Select active matches to see leagues."}
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

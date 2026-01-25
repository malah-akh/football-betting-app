import * as React from "react";
import { X } from "lucide-react";

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
import { cn } from "@/lib/utils";

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
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="text-left">
          <DrawerTitle>Filter Matches</DrawerTitle>
          <DrawerDescription>
            Refine your view by status, league, and more.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
          {/* Status Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "LIVE", "UPCOMING", "FINISHED"] as MatchStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    localFilters.status === status
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground hover:bg-muted border-input"
                  )}
                >
                  {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Content Filters */}
          <section className="space-y-4">
             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Content
            </h3>
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-tip" className="text-base font-medium">Has Tip</Label>
                <Switch
                  id="has-tip"
                  checked={localFilters.hasTip}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, hasTip: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <Label htmlFor="premium-only" className="text-base font-medium">Premium Only</Label>
                    <span className="text-xs text-muted-foreground">Show only high-confidence picks</span>
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
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Country
            </h3>
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex w-max gap-2 p-1">
                {availableCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      localFilters.country === country
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground hover:bg-muted border-input"
                    )}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </section>

          {/* League Section */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              League
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {availableLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() => toggleLeague(league)}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                    localFilters.league === league
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {league}
                  {localFilters.league === league && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleApply} className="w-full" size="lg">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full" size="lg">
            Reset All
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

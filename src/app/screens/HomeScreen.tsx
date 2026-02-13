import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { Header } from "@/app/components/Header";
import { FilterDrawer } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { MatchCard } from "@/app/components/MatchCard";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { BottomNav } from "@/app/components/BottomNav";
import { PremiumModal } from "@/app/components/PremiumModal";
import { useAuth } from "@/app/context/AuthContext";
import { useMatchesByDate } from "@/app/hooks/useMatchesByDate";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useToggleFavorite } from "@/app/hooks/useToggleFavorite";
import { useMatchFilters } from "@/app/hooks/useMatchFilters";
import { Button } from "@/app/components/ui/button";

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: matches = [], isLoading, error } = useMatchesByDate(selectedDate);
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const { filters, setFilters, resetFilters, filteredMatches, availableCountries, availableLeagues } = useMatchFilters(matches);

  const displayedMatches = useMemo(() => {
    return filteredMatches.slice(0, page * 10);
  }, [filteredMatches, page]);

  const handleToggleFavorite = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFav.mutate({ matchId, isFavorite: favoriteIds.has(matchId) });
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setPage(1);
  };

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative">
      {/* Background Wave */}
      <div className="absolute top-0 left-0 w-full h-[350px] -z-10 pointer-events-none">
        <svg
          className="w-full h-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 440 350"
        >
          <path
            d="M0 0H440V311.055C440 311.055 356.5 350 220 350C83.5 350 0 309.032 0 309.032V0Z"
            fill="#DAE1E9"
          />
        </svg>
      </div>

      {/* Header */}
      <Header onFilterClick={() => setIsFilterOpen(true)} />

      {/* Title Section */}
      <div className="px-4 mt-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Matches
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          All your football predictions in one place
        </p>
      </div>

      {/* Tab Bar */}
      <TabBar />

      {/* Date Selector */}
      <DateSelector
        onDateChange={handleDateChange}
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* Matches List */}
      <div className="flex-1 px-4 mt-6 space-y-4 pb-24">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading matches...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error.message}</div>
        ) : filteredMatches.length > 0 ? (
          <>
            {Object.entries(displayedMatches.reduce((acc: Record<string, any[]>, match) => {
              const country = match.country || 'International';
              if (!acc[country]) acc[country] = [];
              acc[country].push(match);
              return acc;
            }, {})).map(([country, countryMatches]) => (
              <div key={country} className="space-y-3">
                <h2 className="text-[#3e4855] text-sm font-bold uppercase tracking-wider pl-1 sticky top-0 bg-[#dae1e9]/95 backdrop-blur-sm z-10 py-2">
                  {country}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {countryMatches.map((match: any) => (
                    <div key={match.id} onClick={() => handleMatchClick(match.id)} className="cursor-pointer">
                      <MatchCard
                        {...match}
                        isFavorite={favoriteIds.has(match.id)}
                        onToggleFavorite={(e) => handleToggleFavorite(match.id, e)}
                        isUserPremium={profile?.is_premium}
                        potentialReturn="€33.75"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredMatches.length > displayedMatches.length && (
              <div className="pt-4 pb-2">
                <Button
                    onClick={() => setPage(p => p + 1)}
                    variant="outline"
                    className="w-full bg-white border-none shadow-sm hover:bg-gray-50 text-[#3e4855]"
                >
                  Load More Matches
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No matches found</div>
        )}

        {/* Premium Locked Card */}
        <PremiumCard />
        <PremiumCard />
        <PremiumCard />

        {/* Unlock Premium Card */}
        <UnlockPremiumCard onViewPlans={() => setIsPremiumModalOpen(true)} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>

      {/* Premium Modal */}
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />

      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentFilters={filters}
        onApply={setFilters}
        onReset={resetFilters}
        availableCountries={availableCountries}
        availableLeagues={availableLeagues}
      />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/app/components/Header";
import { FilterDrawer } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { MatchCard } from "@/app/components/MatchCard";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { BottomNav } from "@/app/components/BottomNav";
import { PickConfirmationModal } from "@/app/components/PickConfirmationModal";
import { useAuth } from "@/app/context/AuthContext";
import { useAllMatches } from "@/app/hooks/useAllMatches";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useToggleFavorite } from "@/app/hooks/useToggleFavorite";
import { useMatchFilters } from "@/app/hooks/useMatchFilters";

export function PicksListScreen() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: matches = [], isLoading } = useAllMatches();
  const { favoriteIds } = useFavorites();
  const toggleFav = useToggleFavorite();
  const { filters, setFilters, resetFilters, filteredMatches, availableCountries, availableLeagues } = useMatchFilters(matches);

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

  const handleConfirmPick = () => {
    console.log(`Pick added for match ${selectedMatch}`);
    setShowModal(false);
    setSelectedMatch(null);
  };

  const handleCloseMod = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative">
      {/* Background Wave */}
      <div className="absolute top-0 left-0 w-full h-[350px] -z-10">
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

      {/* Date Selector and Filter */}
      <DateSelector onFilterClick={() => setIsFilterOpen(true)} />

      {/* Matches List */}
      <div className="flex-1 px-4 mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading matches...</div>
        ) : filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => handleMatchClick(match.id)}
              className="cursor-pointer"
            >
              <MatchCard
                {...match}
                isFavorite={favoriteIds.has(match.id)}
                onToggleFavorite={(e) => handleToggleFavorite(match.id, e)}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No matches found</div>
        )}

        {/* Premium Locked Cards */}
        <PremiumCard />
        <PremiumCard />
        <PremiumCard />
        <PremiumCard />

        {/* Unlock Premium Card */}
        <UnlockPremiumCard />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>

      {/* Pick Confirmation Modal */}
      <PickConfirmationModal
        isOpen={showModal}
        onClose={handleCloseMod}
        onConfirm={handleConfirmPick}
        suggestedAmount="€16.75"
      />

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

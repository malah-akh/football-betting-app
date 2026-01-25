import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { Header } from "@/app/components/Header";
import { FilterDrawer, FilterState } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { BottomNav } from "@/app/components/BottomNav";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { PremiumModal } from "@/app/components/PremiumModal";
import { Circle, MapPin, Clock } from "lucide-react";

export function CombinedListScreen() {
  const navigate = useNavigate();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    country: [],
    league: null,
    hasTip: false,
    premiumOnly: false,
  });

  const combinedMatches = [
    {
      id: 1,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
    },
    {
      id: 2,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
    },
    {
      id: 3,
      league: "Champions League",
      location: "Allianz Arena",
      time: "15:00",
      homeTeam: "FC Bayern Munich",
      awayTeam: "Manchester United",
    },
  ];

  const availableCountries = useMemo(() => {
     return ["Europe"]; // Mock data has no country, so default to Europe
  }, []);

  const availableLeagues = useMemo(() => {
    return Array.from(new Set(combinedMatches.map(m => m.league)))
      .sort()
      .map(name => ({ name, country: "Europe" })); // Mock data
  }, []);

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative pb-24">
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
      <DateSelector onFilterClick={() => setIsFilterOpen(true)} />

      {/* Combined Matches Card */}
      <div className="flex-1 px-4 mt-6 space-y-4 w-full max-w-3xl mx-auto">
        <div
          onClick={() => navigate("/combined-details")}
          className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6 cursor-pointer hover:shadow-[0px_16px_42px_0px_rgba(80,82,113,0.25)] transition-shadow"
        >
          {/* Match Cards */}
          <div className="space-y-6">
            {combinedMatches.map((match, index) => (
              <div key={match.id}>
                {/* League Info */}
                <div className="flex justify-center items-center gap-2 mb-3">
                  <Circle className="size-4 fill-[#dae1e9] stroke-[#dae1e9]" />
                  <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">
                    {match.league}
                  </p>
                </div>

                {/* Match Info */}
                <div className="flex justify-center items-center gap-4 mb-4 text-[#3e4855] text-[11px]">
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    <span className="tracking-[-0.22px]">{match.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span className="tracking-[-0.22px]">{match.time}</span>
                  </div>
                </div>

                {/* Teams */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  {/* Home Team */}
                  <div className="text-center">
                    <div className="size-14 bg-[#dae1e9] rounded-full mx-auto mb-3" />
                    <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px]">
                      {match.homeTeam}
                    </p>
                  </div>

                  {/* VS */}
                  <p className="font-semibold text-[24px] text-[#3e4855] tracking-[-1.68px]">
                    VS
                  </p>

                  {/* Away Team */}
                  <div className="text-center">
                    <div className="size-14 bg-[#dae1e9] rounded-full mx-auto mb-3" />
                    <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px]">
                      {match.awayTeam}
                    </p>
                  </div>
                </div>

                {/* Divider between matches */}
                {index < combinedMatches.length - 1 && (
                  <div className="border-t border-[#dae1e9] mt-6" />
                )}
              </div>
            ))}
          </div>

          {/* Potential Return Button */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-[#a5b1bf] text-white rounded-full px-4 py-2 flex items-center gap-2">
              <span className="text-[12px] font-semibold tracking-[-0.24px]">
                Potential Return
              </span>
              <span className="text-[12px] tracking-[-0.24px]">€33.75</span>
            </div>
          </div>
        </div>

        {/* Premium Cards */}
        <PremiumCard />

        {/* Unlock Premium Card */}
        <UnlockPremiumCard />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
      <FilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        currentFilters={filters}
        onApply={setFilters}
        onReset={() => setFilters({
            status: "ALL",
            country: [],
            league: null,
            hasTip: false,
            premiumOnly: false,
        })}
        // Pass empty arrays or mocks since this screen has static data for now
        availableCountries={availableCountries} 
        availableLeagues={availableLeagues}
      />    </div>
  );
}
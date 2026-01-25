import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/app/components/Header";
import { FilterDrawer, FilterState } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { MatchCard } from "@/app/components/MatchCard";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { BottomNav } from "@/app/components/BottomNav";
import { PickConfirmationModal } from "@/app/components/PickConfirmationModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { formatMatchTime } from "@/app/components/ui/utils";

export function PicksListScreen() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    country: [],
    league: null,
    hasTip: false,
    premiumOnly: false,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const availableCountries = useMemo(() => {
     return Array.from(new Set(matches.map(m => m.country || "International"))).sort();
  }, [matches]);

  const availableLeagues = useMemo(() => {
    const leaguesMap = new Map<string, string>(); // league -> country
    matches.forEach(m => {
        leaguesMap.set(m.league, m.country || "International");
    });
    
    return Array.from(leaguesMap.entries())
      .map(([name, country]) => ({ name, country }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [matches]);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  async function fetchFavorites() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('match_id')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const ids = new Set(data.map(f => f.match_id));
      setFavoriteIds(ids);
    } catch (error: any) {
      if (error.message?.includes("AbortError") || error.details?.includes("AbortError")) return;
      console.error('Error fetching favorites:', error);
    }
  }

  async function toggleFavorite(matchId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteIds.has(matchId);
    const newFavorites = new Set(favoriteIds);
    
    if (isFavorite) {
      newFavorites.delete(matchId);
    } else {
      newFavorites.add(matchId);
    }
    setFavoriteIds(newFavorites);

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('match_id', matchId);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            match_id: matchId
          });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      fetchFavorites();
    }
  }

  async function fetchMatches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          leagues (name, country, logo_url),
          odds (*)
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedMatches = data.map((m: any) => {
          // Robustly handle leagues relation (object or array)
          const leagueData = Array.isArray(m.leagues) ? m.leagues[0] : m.leagues;

          const matchOdds = m.odds && m.odds.length > 0 
            ? {
                home: m.odds[0].home_odd,
                draw: m.odds[0].draw_odd,
                away: m.odds[0].away_odd
              }
            : undefined;

          return {
             id: m.id,
             league: leagueData?.name || 'Unknown League',
             country: leagueData?.country || 'International',
             leagueLogo: leagueData?.logo_url,
             location: m.venue?.city ? `${m.venue.city}, ${m.venue.name || ''}` : (leagueData?.country || 'Unknown Location'),
             time: formatMatchTime(m.start_time),
             homeTeam: m.home_team?.name || 'Home Team',
             homeTeamLogo: m.home_team?.logo,
             awayTeam: m.away_team?.name || 'Away Team',
             awayTeamLogo: m.away_team?.logo,
             odds: matchOdds
          };
        });
        setMatches(mappedMatches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      if (filters.country.length > 0 && !filters.country.includes(match.country)) return false;
      if (filters.league && match.league !== filters.league) return false;
      return true;
    });
  }, [matches, filters]);

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
        {loading ? (
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
                onToggleFavorite={(e) => toggleFavorite(match.id, e)}
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
        onReset={() => setFilters({
            status: "ALL",
            country: [],
            league: null,
            hasTip: false,
            premiumOnly: false,
        })}
        availableCountries={availableCountries} 
        availableLeagues={availableLeagues}
      />
    </div>
  );
}
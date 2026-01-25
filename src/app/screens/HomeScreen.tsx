import { useNavigate } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { Header } from "@/app/components/Header";
import { FilterDrawer, FilterState } from "@/app/components/FilterDrawer";
import { TabBar } from "@/app/components/TabBar";
import { DateSelector } from "@/app/components/DateSelector";
import { MatchCard } from "@/app/components/MatchCard";
import { PremiumCard } from "@/app/components/PremiumCard";
import { UnlockPremiumCard } from "@/app/components/UnlockPremiumCard";
import { BottomNav } from "@/app/components/BottomNav";
import { PremiumModal } from "@/app/components/PremiumModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import { ingestMatches } from "@/lib/backend";
import { formatMatchTime } from "@/app/components/ui/utils";
import { Button } from "@/app/components/ui/button";

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "ALL",
    country: null,
    league: null,
    hasTip: false,
    premiumOnly: false,
  });
  const [matches, setMatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMatches(selectedDate);
    setPage(1);
  }, [selectedDate]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
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
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }

  async function toggleFavorite(matchId: string, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent card click
    if (!user) {
      navigate('/login');
      return;
    }

    const isFavorite = favoriteIds.has(matchId);
    const newFavorites = new Set(favoriteIds);
    
    // Optimistic Update
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
      // Revert on error
      fetchFavorites();
    }
  }

  async function fetchMatches(date: Date) {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const dateStr = date.toISOString().split('T')[0];

      // Helper to build query
      const buildQuery = () => supabase
        .from('matches')
        .select(`
          *,
          leagues (
            name,
            country,
            logo_url
          ),
          odds (*),
          tips!inner (
            selection,
            odds,
            analysis,
            is_premium,
            status
          )
        `)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lte('start_time', `${dateStr}T23:59:59`)
        .order('start_time', { ascending: true });

      let { data, error } = await buildQuery();



      if (error) {
          console.error("Supabase error:", error);
          throw error;
      }

      // If no data, try ingest
      if (!data || data.length === 0) {
        console.log(`No matches found for ${dateStr}, attempting ingest...`);
        try {
          await ingestMatches(dateStr);
          // Retry fetch
          const retry = await buildQuery();
          data = retry.data;
          error = retry.error;
        } catch (ingestError) {
          console.error("Ingest failed, showing empty state", ingestError);
        }
      }
      
      if (data) {
         // Map DB schema to UI schema
        const mappedMatches = data.map((m: any) => {
          // Extract odds
          const matchOdds = m.odds && m.odds.length > 0 
            ? {
                home: m.odds[0].home_win || 0,
                draw: m.odds[0].draw || 0,
                away: m.odds[0].away_win || 0
              }
            : undefined;

          return {
            id: m.id,
            league: m.leagues?.name || 'Unknown League',
            country: m.leagues?.country || 'International',
            leagueLogo: m.leagues?.logo_url,
            location: m.venue?.city ? `${m.venue.city}, ${m.venue.name || ''}` : (m.leagues?.country || 'Unknown Location'),
            time: formatMatchTime(m.start_time),
            status: m.status,
            homeTeam: m.home_team?.name || 'Home Team',
            homeTeamLogo: m.home_team?.logo,
            awayTeam: m.away_team?.name || 'Away Team',
            awayTeamLogo: m.away_team?.logo,
            odds: matchOdds,
            tip: m.tips && m.tips.length > 0 ? m.tips[0] : undefined
          };
        });
        setMatches(mappedMatches);
      }
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      setErrorMsg(error.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Status filter
      if (filters.status !== 'ALL') {
        const s = match.status; 
        const statusMap: Record<string, string[]> = {
          'UPCOMING': ['NS', 'TBD'],
          'LIVE': ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'],
          'FINISHED': ['FT', 'AET', 'PEN']
        };
        const allowed = statusMap[filters.status];
        // If status is not in the allowed list, filter it out.
        // Note: If s is undefined/null, it won't match.
        if (allowed && !allowed.includes(s)) return false;
      }
      
      if (filters.country && match.country !== filters.country) return false;
      if (filters.league && match.league !== filters.league) return false;
      if (filters.hasTip && !match.tip) return false;
      if (filters.premiumOnly) {
         if (!match.tip || !match.tip.is_premium) return false;
      }
      return true;
    });
  }, [matches, filters]);

  const availableCountries = useMemo(() => {
     return Array.from(new Set(matches.map(m => m.country))).sort();
  }, [matches]);

  const availableLeagues = useMemo(() => {
    return Array.from(new Set(
      matches
        .filter(m => !filters.country || m.country === filters.country)
        .map(m => m.league)
    )).sort();
  }, [matches, filters.country]);

  const displayedMatches = useMemo(() => {
    return filteredMatches.slice(0, page * 10);
  }, [filteredMatches, page]);

  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
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
        onDateChange={setSelectedDate} 
        onFilterClick={() => setIsFilterOpen(true)}
      />

      {/* Matches List */}
      <div className="flex-1 px-4 mt-6 space-y-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading matches...</div>
        ) : errorMsg ? (
          <div className="text-center py-8 text-red-500">Error: {errorMsg}</div>
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
                        onToggleFavorite={(e) => toggleFavorite(match.id, e)}
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

        {/* Another Premium Card */}
        <PremiumCard />

        {/* Another Premium Card */}
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
        onReset={() => setFilters({
            status: "ALL",
            country: null,
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
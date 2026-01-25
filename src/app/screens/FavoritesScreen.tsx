import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { MatchCard } from "@/app/components/MatchCard";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { formatMatchTime } from "@/app/components/ui/utils";

export function FavoritesScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          match_id,
          matches (
            *,
            leagues (
              name,
              country,
              logo_url
            ),
            odds (*)
          )
        `)
        .eq('user_id', user!.id);

      if (error) throw error;

      if (data) {
        const mappedMatches = data
          .map((item: any) => item.matches)
          .filter((m: any) => m)
          .map((m: any) => {
             const matchOdds = m.odds && m.odds.length > 0 
            ? {
                home: m.odds[0].home_odd,
                draw: m.odds[0].draw_odd,
                away: m.odds[0].away_odd
              }
            : undefined;

            return {
              id: m.id,
              league: m.leagues?.name || 'Unknown League',
              country: m.leagues?.country || 'International',
              leagueLogo: m.leagues?.logo_url,
              location: m.venue?.city ? `${m.venue.city}, ${m.venue.name || ''}` : (m.leagues?.country || 'Unknown Location'),
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
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(matchId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      setMatches(prev => prev.filter(m => m.id !== matchId));
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user!.id)
        .eq('match_id', matchId);
    } catch (error) {
      console.error("Error removing favorite:", error);
      fetchFavorites();
    }
  }

  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative">
      <Header />

      <div className="px-4 mt-4 mb-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Favorites
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          Your favorite matches and picks
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="flex-1 px-4 mt-6 space-y-4 pb-24">
          {Object.entries(matches.reduce((acc: Record<string, any[]>, match) => {
            const country = match.country || 'International';
            if (!acc[country]) acc[country] = [];
            acc[country].push(match);
            return acc;
          }, {})).map(([country, countryMatches]) => (
            <div key={country} className="space-y-3">
              <h2 className="text-[#3e4855] text-sm font-bold uppercase tracking-wider pl-1 sticky top-0 bg-[#dae1e9]/95 backdrop-blur-sm z-10 py-2">
                {country}
              </h2>
              <div className="space-y-4">
                {countryMatches.map((match: any) => (
                  <div key={match.id} onClick={() => handleMatchClick(match.id)} className="cursor-pointer">
                    <MatchCard 
                      {...match} 
                      isFavorite={true}
                      onToggleFavorite={(e) => removeFavorite(match.id, e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
          <div className="size-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Heart className="size-10 text-[#bcc2c9]" />
          </div>
          <h2 className="font-semibold text-[18px] text-[#3e4855] tracking-[-0.54px] mb-2">
            No Favorites Yet
          </h2>
          <p className="text-[14px] text-[#8b99ac] text-center tracking-[-0.28px] max-w-[280px]">
             Start adding your favorite matches and they will appear here for easy access.
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto">
        <BottomNav />
      </div>
    </div>
  );
}

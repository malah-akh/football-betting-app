import { useNavigate } from "react-router";
import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { MatchCard } from "@/app/components/MatchCard";
import { useFavoriteMatches } from "@/app/hooks/useFavoriteMatches";
import { useToggleFavorite } from "@/app/hooks/useToggleFavorite";
import { Heart } from "lucide-react";

export function FavoritesScreen() {
  const navigate = useNavigate();
  const { data: matches = [], isLoading } = useFavoriteMatches();
  const toggleFav = useToggleFavorite();

  const removeFavorite = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFav.mutate({ matchId, isFavorite: true });
  };

  const handleMatchClick = (matchId: string) => {
    navigate(`/match/${matchId}`);
  };

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col w-full max-w-7xl mx-auto relative">
      <Header />

      <div className="px-4 mt-4 mb-4">
        <h1 className="font-semibold text-[26px] text-[#3e4855] tracking-[-0.78px]">
          Favorites
        </h1>
        <p className="font-medium text-[14px] text-[#3e4855] tracking-[-0.28px] mt-2">
          Your favorite matches and picks
        </p>
      </div>

      {isLoading ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="fixed bottom-0 left-0 right-0 w-full max-w-7xl mx-auto z-50">
        <BottomNav />
      </div>
    </div>
  );
}

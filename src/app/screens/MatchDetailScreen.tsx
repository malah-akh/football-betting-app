import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Header } from "@/app/components/Header";
import { BottomNav } from "@/app/components/BottomNav";
import { AddTipDialog } from "@/app/components/AddTipDialog";
import { EditPickModal } from "@/app/components/EditPickModal";
import { DeletePickModal } from "@/app/components/DeletePickModal";
import { TrendingUp, Circle, Plus, Minus, ChevronLeft, MapPin, Clock, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn, formatMatchTime } from "@/app/components/ui/utils";
import { ProbabilityGraph } from "@/app/components/ProbabilityGraph";

export function MatchDetailScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userPick, setUserPick] = useState<any>(null);

  const [betAmount, setBetAmount] = useState("38.75");
  const [odds, setOdds] = useState("1.50");
  const [selection, setSelection] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchMatch = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("matches")
          .select(`
            *,
            leagues ( name, country, logo_url ),
            odds (*),
            tips (*)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setMatch(data);

        // Sync latest match data on open using external_id if available
        if (data?.external_id) {
           import("@/lib/backend").then(({ ingestMatch }) => ingestMatch(data.external_id));
        }

        if (user) {
          const { data: favData } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("match_id", id)
            .maybeSingle();
          setIsFavorite(!!favData);

          const { data: pickData } = await supabase
             .from("picks")
             .select("*")
             .eq("user_id", user.id)
             .eq("match_id", id)
             .maybeSingle();
          
          if (pickData) {
            setUserPick(pickData);
            setBetAmount(pickData.stake?.toString() || "");
            setOdds(pickData.odds.toString());
            setSelection(pickData.selection);
          }
        }
      } catch (error) {
        console.error("Error fetching match:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMatch();
  }, [id, user]);

  const toggleFavorite = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user || !id) {
       navigate("/login", { state: { from: location } });
       return;
    }
    const newState = !isFavorite;
    setIsFavorite(newState);
    try {
      if (newState) {
        await supabase.from("favorites").insert({ user_id: user.id, match_id: id });
      } else {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("match_id", id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setIsFavorite(!newState);
    }
  };

  const handleSavePick = async () => {
    if (!user) { navigate("/login"); return; }
    if (!id) return;
    if (!selection) return;

    try {
      if (userPick) {
        const { data, error } = await supabase.from('picks').update({
            selection,
            odds: parseFloat(odds),
            stake: parseFloat(betAmount)
        }).eq('id', userPick.id).select().single();
        if (error) throw error;
        setUserPick(data);
        setShowEditModal(false);
      } else {
        const { data, error } = await supabase.from('picks').insert({
            user_id: user.id,
            match_id: id,
            selection: selection,
            odds: parseFloat(odds),
            stake: parseFloat(betAmount),
            status: 'PENDING'
        }).select().single();
        if (error) throw error;
        setUserPick(data);
      }
    } catch (err) {
      console.error("Error saving pick:", err);
    }
  };

  const handleDeletePick = async () => {
    if (!userPick) return;
    try {
        await supabase.from('picks').delete().eq('id', userPick.id);
        setUserPick(null);
        setSelection(null);
        setShowDeleteModal(false);
    } catch (err) {
        console.error("Error deleting pick:", err);
    }
  };

  const incrementAmount = () => setBetAmount((parseFloat(betAmount) + 5).toFixed(2));
  const decrementAmount = () => {
    const val = parseFloat(betAmount);
    if (val > 5) setBetAmount((val - 5).toFixed(2));
  };

  if (loading) return <div className="min-h-screen bg-[#dae1e9] flex items-center justify-center text-[#3e4855]">Loading match details...</div>;
  if (!match) return <div className="min-h-screen bg-[#dae1e9] flex items-center justify-center text-[#3e4855]">Match not found</div>;

  const homeTeamName = match.home_team?.name || "Home Team";
  const homeTeamLogo = match.home_team?.logo || match.home_team?.logo_url;
  const awayTeamName = match.away_team?.name || "Away Team";
  const awayTeamLogo = match.away_team?.logo || match.away_team?.logo_url;
  const leagueName = match.leagues?.name || "Unknown League";
  const leagueLogo = match.leagues?.logo_url;
  const matchTime = formatMatchTime(match.start_time);
  const matchLocation = match.venue?.city ? `${match.venue.city}, ${match.venue.name || ''}` : (match.leagues?.country || "Location");
  
  // Handle odds whether returned as array or single object
  const matchOdds = Array.isArray(match.odds) ? match.odds[0] : match.odds;

  return (
    <div className="bg-[#dae1e9] min-h-screen flex flex-col max-w-[440px] mx-auto relative pb-24">
      <Header />
      
      {/* Back Button & Title */}
       <div className="px-4 mt-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="size-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="size-6 text-[#3e4855]" />
        </button>
        <h1 className="font-semibold text-[20px] text-[#3e4855] tracking-[-0.6px]">
          Match Details
        </h1>
      </div>

      <div className="flex-1 px-4 mt-6 space-y-4">
        
        {/* Main Combined Card */}
        <div className="bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] p-6">
          
          {/* League Info */}
          <div className="relative flex justify-center items-center mb-4">
            <div className="flex items-center gap-2">
              {leagueLogo ? <img src={leagueLogo} alt={leagueName} className="size-4 object-contain" /> : <Circle className="size-4 text-[#dae1e9]" />}
              <p className="font-semibold text-[14px] text-[#3e4855] tracking-[-0.28px]">{leagueName}</p>
            </div>
          </div>

          {/* Location & Time */}
           <div className="flex justify-center items-center gap-4 mb-4 text-[#3e4855] text-[11px]">
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span className="tracking-[-0.22px]">{matchLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span className="tracking-[-0.22px]">{matchTime}</span>
            </div>
          </div>


          {/* Teams Row with Form */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 mb-8">
             {/* Home Team */}
             <div className="flex flex-col items-center">
                <div className="size-[64px] rounded-full bg-[#f0f2f5] flex items-center justify-center mb-3 relative">
                    {homeTeamLogo && <img src={homeTeamLogo} alt={homeTeamName} className="size-[48px] object-contain" />}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-gray-100 p-0.5">
                       {/* Optional icon overlay */}
                    </div>
                </div>
                <p className="font-semibold text-[13px] text-[#3e4855] text-center leading-tight mb-2">{homeTeamName}</p>
                {/* Form Guide */}
                {match.home_form && (
                  <div className="flex gap-1">
                    {match.home_form.split("").slice(0,5).map((r: string, i: number) => {
                        let bgClass = "bg-[#dae1e9] text-[#505d6f]";
                        if (r === 'W') bgClass = "bg-green-100 text-green-700";
                        else if (r === 'L') bgClass = "bg-red-100 text-red-700";
                        else if (r === 'D') bgClass = "bg-gray-200 text-gray-700";
                        
                        return (
                          <div key={i} className={cn("size-4 rounded-[4px] flex items-center justify-center text-[9px] font-bold", bgClass)}>
                            {r}
                          </div>
                        );
                    })}
                  </div>
                )}
             </div>

             {/* VS */}
             <div className="flex pt-6 justify-center">
                <span className="text-[24px] font-bold text-[#3e4855] tracking-tight">VS</span>
             </div>

              {/* Away Team */}
             <div className="flex flex-col items-center">
                <div className="size-[64px] rounded-full bg-[#f0f2f5] flex items-center justify-center mb-3">
                    {awayTeamLogo && <img src={awayTeamLogo} alt={awayTeamName} className="size-[48px] object-contain" />}
                </div>
                <p className="font-semibold text-[13px] text-[#3e4855] text-center leading-tight mb-2">{awayTeamName}</p>
                {/* Form Guide */}
                {match.away_form && (
                  <div className="flex gap-1">
                    {match.away_form.split("").slice(0,5).map((r: string, i: number) => {
                        let bgClass = "bg-[#dae1e9] text-[#505d6f]";
                        if (r === 'W') bgClass = "bg-green-100 text-green-700";
                        else if (r === 'L') bgClass = "bg-red-100 text-red-700";
                        else if (r === 'D') bgClass = "bg-gray-200 text-gray-700";
                        
                        return (
                          <div key={i} className={cn("size-4 rounded-[4px] flex items-center justify-center text-[9px] font-bold", bgClass)}>
                            {r}
                          </div>
                        );
                    })}
                  </div>
                )}
             </div>
          </div>

          {/* Donut Charts / Odds Row */}
          {matchOdds ? (
             <ProbabilityGraph 
               odds={matchOdds}
               selection={selection}
               onSelect={(s, o) => {
                 setSelection(s);
                 if (typeof o === 'number') {
                    setOdds(o.toFixed(2));
                 }
               }}
             />
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">Odds unavailable</div>
          )}

          {/* Analysis */}
          <div className="border-t border-[#dae1e9] pt-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-[#3e4855]" />
              <p className="font-semibold text-[12px] text-[#3e4855] tracking-[-0.12px]">Analysis:</p>
            </div>
            <p className="text-[11px] text-[#8b99ac] leading-relaxed">
              {match.tips?.[0]?.analysis || `${homeTeamName} comes into this match looking strong. With current form suggesting a competitive fixture, the odds favor a ${matchOdds && matchOdds.home_win < matchOdds.away_win ? "home" : "away"} result.`}
            </p>
          </div>

          {/* Match Pick */}
           <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="size-3 fill-[#3e4855] stroke-[#3e4855]" />
              <p className="font-semibold text-[12px] text-[#3e4855]">Match Pick</p>
            </div>
             <div className="flex items-baseline gap-2">
               <span className="text-[13px] text-[#505d6f] font-medium">Back</span>
               <span className="text-[13px] text-[#3e4855] font-bold">{selection === 'HOME_WIN' ? homeTeamName : selection === 'AWAY_WIN' ? awayTeamName : selection === 'DRAW' ? "Draw" : "Select a team"}</span>
               <span className="text-[13px] text-[#3e4855] font-bold">@{odds}</span>
               <span className="text-[13px] text-[#8b99ac] border-l border-[#dae1e9] pl-2 ml-1">1.5% of Bankroll</span>
             </div>
          </div>

          {/* Suggested Amount */}
           <div>
            <div className="flex items-center gap-2 mb-3">
              <Circle className="size-3 fill-[#3e4855] stroke-[#3e4855]" />
              <p className="font-semibold text-[12px] text-[#3e4855]">Suggested Amount</p>
            </div>
             <div className="flex items-center gap-3 mb-4">
               {/* Amount Box */}
               <div className="border border-[#dae1e9] rounded-lg px-3 py-2 flex items-center justify-between w-32">
                  <span className="font-bold text-[#3e4855]">€{betAmount}</span>
                  <div className="flex flex-col -mr-1">
                      <Plus className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" onClick={incrementAmount} />
                      <Minus className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" onClick={decrementAmount} />
                  </div>
               </div>
               
               {/* % Box */}
               <div className="border border-[#dae1e9] rounded-lg px-3 py-2 flex items-center justify-between w-24">
                  <span className="font-bold text-[#3e4855]">1.5%</span>
                  <div className="flex flex-col -mr-1">
                      <Plus className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                      <Minus className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                  </div>
               </div>

                {/* Return */}
                <div className="flex items-center gap-1.5 ml-auto">
                   <div className="size-6 rounded-full bg-[#dae1e9] flex items-center justify-center text-[#505d6f] font-bold text-xs">€</div>
                   <span className="text-[12px] text-[#505d6f] font-medium">Potential return: <span className="text-[#3e4855] font-bold">€{(parseFloat(betAmount) * parseFloat(odds)).toFixed(2)}</span></span>
                </div>
             </div>

             <button 
                onClick={handleSavePick}
                disabled={!selection}
                className={cn(
                  "w-full py-3.5 rounded-lg font-bold text-[14px] text-white transition-all shadow-sm",
                  selection ? "bg-[#3e4855] hover:bg-[#2f3840]" : "bg-slate-300 cursor-not-allowed"
                )}
             >
                {userPick ? "Update Pick" : "Add to My Picks"}
             </button>
           </div>

        </div>

        {/* Admin: Add Tip (from Mission Control) */}
        {(location.state as any)?.fromMissionControl && (
            <div className="flex justify-center mt-4">
                <AddTipDialog 
                    match={match} 
                    existingTip={match.tips?.[0]} 
                    onSave={fetchMatch} 
                />
            </div>
        )}

        {/* Favorite Button (Floating or integrated?) - keeping it clean for now, maybe add to header */}
        <div className="flex justify-center mt-4 mb-2">
            <button onClick={toggleFavorite} className="flex items-center gap-2 text-[#505d6f] font-medium text-sm hover:text-[#3e4855]">
                <Heart className={cn("size-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
        </div>
      </div>
       
      <div className="fixed bottom-0 left-0 right-0 max-w-[440px] mx-auto z-10">
        <BottomNav />
      </div>

      <EditPickModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleSavePick}
      />
      <DeletePickModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePick}
        amount={`€${betAmount}`}
      />
    </div>
  );
}

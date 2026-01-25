import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Header } from "@/app/components/Header";
import { DateSelector } from "@/app/components/DateSelector";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { BottomNav } from "@/app/components/BottomNav";
import { Button } from "@/app/components/ui/button";

const POPULAR_LEAGUES = [
  { name: "Premier League", country: "England" },
  { name: "La Liga", country: "Spain" },
  { name: "Bundesliga", country: "Germany" },
  { name: "Serie A", country: "Italy" },
  { name: "Ligue 1", country: "France" },
  { name: "UEFA Champions League", country: "World" },
  { name: "UEFA Europa League", country: "World" },
  { name: "Eredivisie", country: "Netherlands" },
  { name: "Primeira Liga", country: "Portugal" },
  { name: "Major League Soccer", country: "USA" },
  { name: "Championship", country: "England" },
  { name: "Brasileiro Série A", country: "Brazil" }
];

export function MissionControlScreen() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("all");
  const [matches, setMatches] = useState<any[]>([]);
  const [tips, setTips] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    fetchMatchesAndTips(selectedDate);

    // Realtime Subscription for Live Updates
    const channel = supabase
      .channel("mission-control-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches" },
        (payload: any) => {
             const updatedMatch = payload.new;
             // Optimistic update for Match fields (Status, Score, Time)
             setMatches((current) => 
                 current.map(m => m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m)
             );
        }
      )
      .on(
         "postgres_changes",
         { event: "UPDATE", schema: "public", table: "odds" },
         (payload: any) => {
             setMatches((current) => current.map(m => {
                 if (m.id === payload.new.match_id) {
                     const existingOdds = m.odds || [];
                     const oddIndex = existingOdds.findIndex((o: any) => o.id === payload.new.id);
                     let newOdds;
                     if (oddIndex >= 0) {
                         newOdds = [...existingOdds];
                         newOdds[oddIndex] = payload.new;
                     } else {
                         newOdds = [...existingOdds, payload.new];
                     }
                     return { ...m, odds: newOdds };
                 }
                 return m;
             }));
         }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, selectedLeagueId]);

  async function fetchLeagues() {
    const { data } = await supabase.from("leagues").select("*").eq("is_active", true);
    if (data) {
      const sortedLeagues = data.sort((a: any, b: any) => {
        const indexA = POPULAR_LEAGUES.findIndex(p => p.name === a.name && p.country === a.country);
        const indexB = POPULAR_LEAGUES.findIndex(p => p.name === b.name && p.country === b.country);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB; // Both in popular list, sort by order
        }
        if (indexA !== -1) return -1; // Only A is popular, goes first
        if (indexB !== -1) return 1;  // Only B is popular, goes first

        return a.name.localeCompare(b.name); // Neither popular, sort alphabetically
      });
      setLeagues(sortedLeagues);
    }
  }

  async function fetchMatchesAndTips(date: Date) {
    setLoading(true);
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

    let query = supabase
      .from("matches")
      .select(`
        id,
        home_team,
        away_team,
        start_time,
        status,
        league_id,
        venue,
        referee,
        leagues (
          name,
          logo_url,
          country
        ),
        odds (
          home_win,
          draw,
          away_win
        ),
        tips (*)
      `)
      .gte("start_time", `${dateStr}T00:00:00`)
      .lt("start_time", `${dateStr}T23:59:59`)
      .order("start_time", { ascending: true });

    if (selectedLeagueId !== "all") {
      query = query.eq("league_id", parseInt(selectedLeagueId));
    }

    try {
        const { data: matchesData, error } = await query;
        
        if (error) {
            // Ignore AbortError which happens on rapid navigation/updates
            if (error.message?.includes("AbortError") || (typeof error.details === 'string' && error.details.includes("AbortError"))) {
                return;
            }
            console.error("Error fetching matches", error);
        } else {
            setMatches(matchesData || []);
            
            const tipsMap: Record<string, any> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            matchesData?.forEach((m: any) => {
               if (m.tips) {
                  const tip = Array.isArray(m.tips) ? m.tips[0] : m.tips;
                  if (tip) {
                    tipsMap[m.id] = tip;
                  }
               }
            });
            setTips(tipsMap);
        }
    } catch (err) {
        console.error("Unexpected error in fetchMatchesAndTips", err);
    } finally {
        setLoading(false);
    }
  }

  const handleSyncMatches = async () => {
    setLoading(true);
    try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const { ingestMatches } = await import("@/lib/backend");
        await ingestMatches(dateStr);
        await fetchMatchesAndTips(selectedDate);
    } catch(e) {
        console.error(e);
        alert("Failed to sync matches");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <Header />
      
      <div className="p-4 bg-white border-b sticky top-[60px] z-10">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mission Control</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
        <div className="flex flex-col gap-4">
            <DateSelector onDateChange={setSelectedDate} />
            
            <div className="px-4 flex gap-2 items-end">
                <div className="flex-1 flex flex-col">
                    <label className="text-sm font-medium mb-1 block">Filter by League</label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {selectedLeagueId === "all"
                            ? "All Leagues"
                            : leagues.find((l) => String(l.external_id) === selectedLeagueId)?.name || "Select League..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search league..." />
                          <CommandList>
                            <CommandEmpty>No league found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="All Leagues"
                                onSelect={() => {
                                  setSelectedLeagueId("all");
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLeagueId === "all" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                All Leagues
                              </CommandItem>
                              {leagues.map((l) => (
                                <CommandItem
                                  key={l.id}
                                  value={`${l.name} ${l.country}`}
                                  onSelect={() => {
                                    setSelectedLeagueId(String(l.external_id));
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      String(l.external_id) === selectedLeagueId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {l.name}
                                  <span className="ml-2 text-xs text-muted-foreground">({l.country})</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                </div>
                <Button variant="outline" onClick={handleSyncMatches} disabled={loading}>
                    Sync
                </Button>
            </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-2"></div>
              <p className="text-muted-foreground">Fetching Mission Data...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
              No matches found for this date.
              <br/>
              <Button variant="link" onClick={handleSyncMatches}>Sync Matches</Button>
          </div>
        ) : (
          matches.map((match) => {
            const hasTip = !!tips[match.id];
            const tip = tips[match.id];
            const homeName = match.home_team?.name || 'Unknown Home';
            const homeLogo = match.home_team?.logo || '';
            const awayName = match.away_team?.name || 'Unknown Away';
            const awayLogo = match.away_team?.logo || '';
            const leagueName = match.leagues?.name || 'Unknown League';
            const leagueLogo = match.leagues?.logo_url || '';
            const venueName = typeof match.venue === "object" && match.venue !== null
              ? match.venue.name ? `${match.venue.name}${match.venue.city ? `, ${match.venue.city}` : ""}` : ""
              : typeof match.venue === "string" ? match.venue
              : "";
            const referee = match.referee;
            // Handle odds whether returned as array or single object
            const oddsVal = Array.isArray(match.odds) ? match.odds[0] : match.odds;
            const odds = oddsVal || {};
            
            return (
              <Card 
                key={match.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/match/${match.id}`, { state: { fromMissionControl: true } })}
              >
                <CardHeader className="bg-slate-50 p-3 border-b">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            {leagueLogo ? (
                                <img src={leagueLogo} className="w-5 h-5 object-contain" alt={leagueName} />
                            ) : (
                                <div className="w-5 h-5 bg-slate-200 rounded-full" />
                            )}
                            <span className="text-xs font-semibold text-slate-700">{leagueName}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border">
                            {match.start_time ? new Date(match.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                        </span>
                    </div>
                    {/* Venue & Referee Row */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        {venueName && (
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span className="truncate max-w-[150px]">{venueName}</span>
                            </div>
                        )}
                        {referee && (
                            <div className="flex items-center gap-1">
                               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                               <span className="truncate max-w-[100px]">{referee}</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col items-center gap-2 w-1/3">
                      <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-full shadow-sm p-2">
                        {homeLogo ? <img src={homeLogo} className="w-full h-full object-contain" alt={homeName} /> : <div className="w-full h-full bg-slate-100 rounded-full" />}
                      </div>
                      <span className="font-semibold text-xs text-center leading-tight">{homeName}</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 w-1/3">
                        <span className="text-xs text-muted-foreground font-medium">VS</span>
                        {/* Probability Bar */}
                        {(odds.home_win || odds.draw || odds.away_win) && (
                            <div className="w-full h-1.5 flex rounded-full overflow-hidden mt-1 opacity-80" title="Win Probability">
                                <div className="bg-blue-500" style={{ width: `${(odds.home_win / (odds.home_win + odds.draw + odds.away_win)) * 100}%` }} />
                                <div className="bg-slate-300" style={{ width: `${(odds.draw / (odds.home_win + odds.draw + odds.away_win)) * 100}%` }} />
                                <div className="bg-red-500" style={{ width: `${(odds.away_win / (odds.home_win + odds.draw + odds.away_win)) * 100}%` }} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2 w-1/3">
                       <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-full shadow-sm p-2">
                        {awayLogo ? <img src={awayLogo} className="w-full h-full object-contain" alt={awayName} /> : <div className="w-full h-full bg-slate-100 rounded-full" />}
                       </div>
                       <span className="font-semibold text-xs text-center leading-tight">{awayName}</span>
                    </div>
                  </div>
                  
                  {hasTip && (
                    <div 
                      className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm border border-yellow-100 flex flex-col gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-600/80 mb-1 block">
                                  {tip.market || 'Match Winner'}
                                </span>
                                <div className="font-bold text-yellow-900 text-base">{tip.selection}</div>
                            </div>
                            <div className="text-right">
                                <span className="font-mono font-bold text-yellow-800 text-lg block">@{tip.odds.toFixed(2)}</span>
                                {tip.bookmaker && <span className="text-[10px] text-yellow-600 block truncate max-w-[80px]">{tip.bookmaker}</span>}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-yellow-700 bg-yellow-100/50 p-2 rounded">
                             <div className="flex items-center gap-2">
                                <span className="font-medium">Confidence</span>
                                <div className="w-16 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-600 transition-all" style={{ width: `${tip.confidence || 50}%` }}></div>
                                </div>
                             </div>
                             <div className="flex items-center gap-1" title={`Stake ${tip.stake || 1}/10`}>
                                <span className="font-medium">Stake</span>
                                <span className="tracking-tighter">{'⭐'.repeat(Math.min(tip.stake || 1, 5))}</span>
                             </div>
                        </div>
                        
                        {(tip.content?.summary || tip.analysis) && (
                            <div className="text-xs text-yellow-800/90 mt-1 italic border-t border-yellow-200 pt-2 line-clamp-2">
                                "{tip.content?.summary || tip.analysis}"
                            </div>
                        )}
                        
                        {tip.content?.keyFactors && Array.isArray(tip.content.keyFactors) && tip.content.keyFactors.length > 0 && (
                           <div className="mt-1 flex flex-wrap gap-1">
                             {tip.content.keyFactors.slice(0, 2).map((f: string, i: number) => (
                               <span key={i} className="text-[10px] bg-white border border-yellow-100 px-1.5 py-0.5 rounded text-yellow-700 truncate max-w-full">
                                 • {f}
                               </span>
                             ))}
                             {tip.content.keyFactors.length > 2 && <span className="text-[10px] text-yellow-600 pt-0.5">+{tip.content.keyFactors.length - 2} more</span>}
                           </div>
                        )}
                    </div>
                  )}

                  {/* <div className="flex justify-end">
                    <AddTipDialog 
                        match={match} 
                        existingTip={tip} 
                        onSave={handleTipSaved} 
                    />
                  </div> */}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}

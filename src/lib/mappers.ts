import { formatMatchTime } from "@/app/components/ui/utils";
import type { MappedMatch, MappedOdds, MappedTip } from "@/types/matches";

/**
 * Maps a raw Supabase match row (with joined leagues, odds, tips) to the UI model.
 * Handles the array-vs-object inconsistency in Supabase relations.
 */
export function mapMatchToUI(m: any): MappedMatch {
  const leagueData = Array.isArray(m.leagues) ? m.leagues[0] : m.leagues;

  const rawOdds = Array.isArray(m.odds) ? m.odds[0] : m.odds;
  let matchOdds: MappedOdds | undefined;
  if (rawOdds) {
    matchOdds = {
      home: rawOdds.home_win ?? rawOdds.home_odd ?? 0,
      draw: rawOdds.draw ?? rawOdds.draw_odd ?? 0,
      away: rawOdds.away_win ?? rawOdds.away_odd ?? 0,
    };
  }

  let tip: MappedTip | undefined;
  if (m.tips) {
    const rawTip = Array.isArray(m.tips) ? m.tips[0] : m.tips;
    if (rawTip) {
      tip = {
        selection: rawTip.selection,
        odds: rawTip.odds,
        analysis: rawTip.analysis,
        is_premium: rawTip.is_premium ?? false,
        market: rawTip.market,
        stake: rawTip.stake,
        confidence: rawTip.confidence,
        bookmaker: rawTip.bookmaker,
        value_edge: rawTip.value_edge,
        status: rawTip.status,
      };
    }
  }

  return {
    id: m.id,
    league: leagueData?.name || 'Unknown League',
    country: leagueData?.country || 'International',
    leagueLogo: leagueData?.logo_url,
    location: m.venue?.city
      ? `${m.venue.city}, ${m.venue.name || ''}`
      : (leagueData?.country || 'Unknown Location'),
    time: formatMatchTime(m.start_time),
    status: m.status,
    homeTeam: m.home_team?.name || 'Home Team',
    homeTeamLogo: m.home_team?.logo,
    awayTeam: m.away_team?.name || 'Away Team',
    awayTeamLogo: m.away_team?.logo,
    odds: matchOdds,
    tip,
  };
}

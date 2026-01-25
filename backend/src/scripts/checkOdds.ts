import { ApiFootballProvider } from "../providers/implementations/ApiFootballProvider.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    console.log("Starting API Check...");
    if (!process.env.SPORTS_API_KEY) {
        throw new Error("SPORTS_API_KEY missing in env");
    }
    const provider = new ApiFootballProvider(process.env.SPORTS_API_KEY);
    
    // Check Quota status before running heavy operations
    try {
        const quota = await provider.checkQuota();
        if (quota) {
            console.log(`[Status] API Quota: ${quota.current}/${quota.limit} used. (${quota.remaining} remaining)`);
            if (quota.remaining <= 0) {
                console.error("⛔️ QUOTA EXCEEDED (Daily Limit). Aborting script to prevent errors.");
                process.exit(1);
            }
        }
    } catch (e) {
        console.warn("Could not check quota status, proceeding anyway...");
    }
    
    // Default to today if no date provided
    const today = new Date().toISOString().split('T')[0];
    const dates = process.argv[2] ? [process.argv[2]] : [today];
    
    // Allow optional league filter from args
    const leagueFilter = process.argv[3] ? parseInt(process.argv[3]) : undefined;

    console.log(`[Script] Target Date: ${dates[0]}`);
    if (leagueFilter) console.log(`[Script] Target League: ${leagueFilter}`);

    for (const date of dates) {
        console.log(`\n\n=== Checking Date: ${date} ===`);
        
        // 1. Fetch Fixtures
        console.log(`[1] Fetching Fixtures for ${date} ${leagueFilter ? `(League ${leagueFilter})` : '(Global)'}...`);
        try {
             const matches = await provider.getFixtures(date, leagueFilter); 
             console.log(`    ✅ Matches Found: ${matches.length}`);
             if (matches.length > 0) {
                 const sample = matches[0];
                 console.log(`    🔎 Sample: [${sample.league.name}] ${sample.teams.home.name} vs ${sample.teams.away.name} (Status: ${sample.status.short})`);
                 
                 // League Analysis
                 const leagues = new Map();
                 matches.forEach(m => leagues.set(m.league.name, (leagues.get(m.league.name) || 0) + 1));
                 console.log(`    📊 Top Leagues by Match Count:`);
                 Array.from(leagues.entries())
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .forEach(([name, count]) => console.log(`       - ${name}: ${count} matches`));
                      
                 // Try to find a match from a popular league to test odds
                 const popularLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Primeira Liga", "UEFA Champions League"];
                 const robustMatch = matches.find(m => popularLeagues.includes(m.league.name)) || matches[0];
                 
                 console.log(`    🔬 Testing Single Match Odds for: [${robustMatch.league.name}] ${robustMatch.teams.home.name} vs ${robustMatch.teams.away.name} (ID: ${robustMatch.id})`);
                 try {
                     const singleOdds = await provider.getOdds(robustMatch.id);
                     if (singleOdds) {
                         console.log(`       ✅ Odds Found (Bookmaker 6 or fallback)! Values: ${JSON.stringify(singleOdds.values)}`);
                     } else {
                         console.warn(`       ⚠️ No odds found for this specific match (ID: ${robustMatch.id}).`);
                         // If possible, we should log why (e.g. no bookmakers) - we'd need to modify provider to debug logging
                     }
                 } catch (err) {
                     console.error(`       ❌ Single odds check failed`, err);
                 }
             }
        } catch (e) {
             console.error(`    ❌ Error fetching fixtures`, e);
        }

        // 2. Fetch Odds using the new Pagination Logic
        console.log(`[2] Fetching Odds for ${date} (Paginated)...`);
        try {
            // Note: We use the provider logic which now handles pagination
            const odds = await provider.getOddsByDate(date, leagueFilter);
            console.log(`    ✅ Total Odds Records Found: ${odds.length}`);
            
            if (odds.length > 0) {
                const sampleOdd = odds[0];
                console.log(`    🔎 Sample Odd: MatchID ${sampleOdd.matchId} | Home: ${sampleOdd.values.home} | Draw: ${sampleOdd.values.draw} | Away: ${sampleOdd.values.away}`);
            } else {
                console.warn(`    ⚠️ No odds found. If matches exist, the API might be restricted or matches have no odds yet.`);
            }
        } catch (error) {
            console.error(`    ❌ Error fetching odds:`, error);
        }
    }
}

run().catch(console.error);


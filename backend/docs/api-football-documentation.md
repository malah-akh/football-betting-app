# API-FOOTBALL Documentation (v3)

This document contains a summary of the API-FOOTBALL documentation (v3) as of 2026-01-25.

## Base URL
`https://v3.football.api-sports.io`

## Authentication
- **Header:** `x-apisports-key`
- **Value:** Your API Key

## Rate Limiting
Headers included in response:
- `x-ratelimit-requests-limit`: Daily request limit.
- `x-ratelimit-requests-remaining`: Remaining daily requests.
- `X-RateLimit-Limit`: Requests per minute limit.
- `X-RateLimit-Remaining`: Remaining requests per minute.

## Endpoints

### Status
`GET /status`
- Check subscription status and request usage.
- Does not count against daily quota.

### Timezone
`GET /timezone`
- List of available timezones.

### Countries
`GET /countries`
- Query Params: `name`, `code`, `search`
- Get list of available countries.

### Leagues
`GET /leagues`
- Query Params: `id`, `name`, `country`, `code`, `season`, `team`, `type`, `current`, `search`, `last`
- Get list of available leagues and cups.
- Returns `coverage` info (fixtures, standings, players, odds, etc.).

`GET /leagues/seasons`
- List available seasons.

### Teams
`GET /teams`
- Query Params: `id`, `name`, `league`, `season`, `country`, `code`, `venue`, `search`
- Get team information.

`GET /teams/statistics`
- Query Params: `league` (req), `season` (req), `team` (req), `date`
- Get team stats (form, goals, clean sheets, etc.).

`GET /teams/seasons`
- Query Params: `team` (req)
- Get seasons available for a team.

### Venues
`GET /venues`
- Query Params: `id`, `name`, `city`, `country`, `search`

### Standings
`GET /standings`
- Query Params: `league`, `season` (req), `team`
- Get league tables/standings.

### Fixtures
`GET /fixtures`
- Query Params: `id`, `ids`, `live`, `date`, `league`, `season`, `team`, `last`, `next`, `from`, `to`, `round`, `status`, `venue`, `timezone`
- **Status Codes:**
    - `NS`: Not Started
    - `1H`, `HT`, `2H`, `ET`, `P`, `BT`: In Play
    - `FT`, `AET`, `PEN`: Finished
    - `PST`, `CANC`, `ABD`: Postponed/Cancelled/Abandoned
    - `TBD`: Time To Be Defined

`GET /fixtures/rounds`
- Query Params: `league` (req), `season` (req), `current`, `dates`

`GET /fixtures/headtohead`
- Query Params: `h2h` (req, "ID-ID"), `date`, `league`, `season`, `last`, `next`, `from`, `to`

`GET /fixtures/statistics`
- Query Params: `fixture` (req), `team`, `type`, `half`
- Stats: Shots, Fouls, Corners, Possession, etc.

`GET /fixtures/events`
- Query Params: `fixture` (req), `team`, `player`, `type`
- Events: Goals, Cards, Substitutions, VAR.

`GET /fixtures/lineups`
- Query Params: `fixture` (req), `team`, `player`, `type`
- Starting XI, Substitutes, Formation, Coach.

`GET /fixtures/players`
- Query Params: `fixture` (req), `team`
- Player stats for a specific match.

### Injuries
`GET /injuries`
- Query Params: `league`, `season`, `fixture`, `team`, `player`, `date`, `ids`

### Predictions
`GET /predictions`
- Query Params: `fixture` (req)
- Predictions based on algorithms (not bookmaker odds).

### Players
`GET /players`
- Query Params: `id`, `team`, `league`, `season`, `search`, `page`
- Player statistics and ratings.

`GET /players/profiles`
- Query Params: `player`, `search`

`GET /players/squads`
- Query Params: `team` or `player`
- Current squad of a team.

`GET /players/topscorers`, `/players/topassists`, `/players/topyellowcards`, `/players/topredcards`
- Query Params: `league` (req), `season` (req)

### Transfers
`GET /transfers`
- Query Params: `player`, `team`

### Trophies
`GET /trophies`
- Query Params: `player`, `coach`

### Odds (Pre-Match)
`GET /odds`
- Query Params: `fixture`, `league`, `season`, `date`, `bookmaker`, `bet`, `page`
- Updated every 3 hours. 1-14 days before fixture.

`GET /odds/mapping`
- List of available fixtures for odds.

`GET /odds/bookmakers`
- List available bookmakers.

`GET /odds/bets`
- List available bet types.

### Odds (In-Play/Live)
`GET /odds/live`
- Query Params: `fixture`, `league`, `bet`
- Updated every 5 seconds.

`GET /odds/live/bets`
- List bets for in-play odds.

---
*Generated from https://www.api-football.com/documentation-v3 on 2026-01-25*

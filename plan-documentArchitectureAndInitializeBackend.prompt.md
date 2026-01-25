## Detailed Plan: Scalable Backend with Supabase & "Repair-on-Read"

We will implement a robust backend architecture using Supabase as the persistence layer and a Node.js/TypeScript service layer handling external data ingestion via the Factory Pattern.

### Phase 1: Architecture & Design
1.  **Create [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)**
    *   **Core Strategy**: "Repair-on-Read". Accessing data triggers a freshness check. If data is stale, the backend fetches from the external provider, updates the DB, and returns fresh data.
    *   **Design Pattern**: **Factory Pattern** for the `SportsProvider`. This allows plugging in different API providers (mock, API-Football, SportMonks) without changing business logic.
    *   **Data Integrity**: **Zod** schemas will validate all data entering the system from external APIs.
    *   **Scalability**: Stateless "Function-like" architecture for the ingestion logic.

### Phase 2: Project Structure & Initialization
1.  **Initialize `backend/`**
    *   Run `npm init -y` in `backend/`.
    *   Install Dependencies:
        *   `runtime`: `zod`, `axios`, `dotenv`, `@supabase/supabase-js`.
        *   `dev`: `typescript`, `ts-node`, `@types/node`.
    *   Create `backend/tsconfig.json` (Configured for ESNext modules).
2.  **Environment Configuration**
    *   Create `backend/.env.template`:
        *   `SUPABASE_URL`
        *   `SUPABASE_SERVICE_ROLE_KEY` (Required for backend writing)
        *   `SPORTS_API_KEY` (Generic key for the active provider)
        *   `ACTIVE_PROVIDER` (e.g., "MOCK", "API_FOOTBALL")

### Phase 3: Database Schema (Supabase)
1.  **Create [backend/schema.sql](backend/schema.sql)**
    *   **`profiles`**: Extends `auth.users` via PostgreSQL Triggers.
    *   **`leagues`**: Stores league metadata (e.g., Premier League, La Liga).
    *   **`matches`**:
        *   `id` (UUID), `external_id` (Provider ID), `home_team`, `away_team`, `start_time` (ISO), `status` (live/finished/scheduled).
        *   `last_updated_at`: Vital for Repair-on-Read logic.
        *   `raw_data`: JSONB column to store the full provider response for debugging.
    *   **`odds`**: Linked to `matches`.
    *   **`picks`**: Linked to `profiles` and `matches`. Stores user bets.
    *   **RLS Policies**:
        *   `matches`/`leagues`: Public Read, Service-Role Write.
        *   `picks`: User Read/Write (Own rows only).

### Phase 4: The Provider Layer (Factory Pattern)
1.  **Define Interfaces [backend/src/providers/types.ts](backend/src/providers/types.ts)**
    *   `ISportsProvider`: `getFixtures(date)`, `getOdds(matchId)`.
2.  **Implement Mock Provider [backend/src/providers/implementations/MockProvider.ts](backend/src/providers/implementations/MockProvider.ts)**
    *   Returns static, predictable data to simulate API responses for testing.
3.  **Implement Real Provider [backend/src/providers/implementations/ApiFootballProvider.ts](backend/src/providers/implementations/ApiFootballProvider.ts)**
    *   Connects to an external service (e.g., API-Football) using `axios`.
4.  **Create Factory [backend/src/providers/ProviderFactory.ts](backend/src/providers/ProviderFactory.ts)**
    *   Reads `process.env.ACTIVE_PROVIDER` to instantiate and return the correct `ISportsProvider`.

### Phase 5: Domain Models & Validation
1.  **Create [backend/src/domain/schemas.ts](backend/src/domain/schemas.ts)**
    *   Define **Zod** schemas for:
        *   `ExternalMatchSchema` (Validates API response).
        *   `InternalMatchSchema` (Validates our DB structure).
    *   Ensure strict typing prevents bad data from polluting the database.

### Phase 6: Service Layer (Repair-on-Read Logic)
1.  **Create [backend/src/services/MatchService.ts](backend/src/services/MatchService.ts)**
    *   **`getMatchesForDate(date: string)`**:
        1.  **Query**: Check Supabase for matches on this date.
        2.  **Assess**: Are there matches? Is `last_updated_at` older than X minutes?
        3.  **Repair (if needed)**:
            *   Call `ProviderFactory.getProvider().getFixtures(date)`.
            *   Validate data with `ExternalMatchSchema`.
            *   Upsert into Supabase `matches`.
        4.  **Return**: Return the fresh data to the caller.

### Phase 7: Frontend Integration
1.  **Setup Client [src/lib/supabase.ts](src/lib/supabase.ts)**
    *   Export initialized `supabase` client.
2.  **Type Definitions [src/types/database.ts](src/types/database.ts)**
    *   TypeScript interfaces mirroring the SQL schema.

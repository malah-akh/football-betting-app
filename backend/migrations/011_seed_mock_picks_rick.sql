DO $$
DECLARE
    v_user_id uuid;
    v_match_id uuid;
BEGIN
    -- Get user ID for email
    SELECT id INTO v_user_id FROM public.profiles WHERE email = 'rickgboris34@gmail.com';

    -- Only proceed if user exists
    IF v_user_id IS NOT NULL THEN
        
        -- 1. Win: Stake 50, Odds 2.0 -> +50 Profit. Date: 10 days ago
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'HOME_WIN', 2.00, 50, 'WON', now() - interval '10 days');

        -- 2. Loss: Stake 50, Odds 1.8 -> -50 Profit. Date: 9 days ago
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'AWAY_WIN', 1.80, 50, 'LOST', now() - interval '9 days');

        -- 3. Win: Stake 100, Odds 1.5 -> +50 Profit. Date: 8 days ago
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'HOME_WIN', 1.50, 100, 'WON', now() - interval '8 days');

        -- 4. Win: Stake 100, Odds 2.5 -> +150 Profit. Date: 7 days ago
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'DRAW', 2.50, 100, 'WON', now() - interval '7 days');

        -- 5. Loss: Stake 200, Odds 2.0 -> -200 Profit. Date: 6 days ago
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'HOME_WIN', 2.00, 200, 'LOST', now() - interval '6 days');

        -- 6. Win: Stake 500, Odds 1.2 -> +100 Profit. Date: 5 days ago (Rebuilding)
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'HOME_WIN', 1.20, 500, 'WON', now() - interval '5 days');

        -- 7. Win: Stake 100, Odds 3.0 -> +200 Profit. Date: 2 days ago (Big win)
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'AWAY_WIN', 3.00, 100, 'WON', now() - interval '2 days');
        
        -- 8. Pending: Stake 50, Odds 2.0
        SELECT id INTO v_match_id FROM public.matches ORDER BY random() LIMIT 1;
        INSERT INTO public.picks (user_id, match_id, selection, odds, stake, status, created_at)
        VALUES (v_user_id, v_match_id, 'DRAW', 2.00, 50, 'PENDING', now());

    END IF;
END $$;

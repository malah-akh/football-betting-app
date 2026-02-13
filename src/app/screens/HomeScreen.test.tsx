import { waitFor } from '@testing-library/react';
import { HomeScreen } from './HomeScreen';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { supabase } from '@/lib/supabase';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Mock backend ingest
vi.mock('@/lib/backend', () => ({
  ingestMatches: vi.fn()
}));

// Mock AuthContext
vi.mock('@/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    profile: { is_premium: false },
    loading: false
  })
}));

// Mock components to avoid deep rendering and issues with missing contexts/props
vi.mock('@/app/components/Header', () => ({ Header: () => <div>Header</div> }));
vi.mock('@/app/components/TabBar', () => ({ TabBar: () => <div>TabBar</div> }));
vi.mock('@/app/components/MatchCard', () => ({ MatchCard: () => <div>MatchCard</div> }));
vi.mock('@/app/components/BottomNav', () => ({ BottomNav: () => <div>BottomNav</div> }));
vi.mock('@/app/components/PremiumCard', () => ({ PremiumCard: () => <div>PremiumCard</div> }));
vi.mock('@/app/components/UnlockPremiumCard', () => ({ UnlockPremiumCard: () => <div>UnlockPremiumCard</div> }));
vi.mock('@/app/components/PremiumModal', () => ({ PremiumModal: () => <div>PremiumModal</div> }));
vi.mock('@/app/components/FilterDrawer', () => ({ FilterDrawer: () => <div>FilterDrawer</div> }));

describe('HomeScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('queries matches with tips!inner to filter matches without tips', async () => {
        const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
        const lteMock = vi.fn(() => ({ order: orderMock }));
        const gteMock = vi.fn(() => ({ lte: lteMock }));
        const eqMock = vi.fn(() => ({ data: [] })); // For favorites query
        const selectMock = vi.fn(() => ({
            gte: gteMock,
            eq: eqMock
        }));
        const fromMock = vi.fn(() => ({ select: selectMock }));

        (supabase.from as any).mockImplementation(fromMock);

        renderWithProviders(<HomeScreen />);

        await waitFor(() => {
            expect(fromMock).toHaveBeenCalledWith('matches');
        });

        // Verify select was called with the correct string
        const selectQuery = (selectMock.mock.calls[0] as unknown as any[])[0];
        expect(selectQuery).toContain('tips!inner');
    });
});

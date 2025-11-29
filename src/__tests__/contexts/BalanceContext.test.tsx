import { renderHook, act, waitFor } from '@testing-library/react';
import { BalanceProvider, useBalance } from '../../app/contexts/BalanceContext';
import * as profileApi from '../../api/profile';

jest.mock('../../api/profile');

describe('BalanceContext - Token Management (FR-005 to FR-010)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('FR-005: Should assign initial tokens (1000) on load', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.loading).toBe(false);
        });

        expect(result.current.balance).toBe(1000);
    });

    test('FR-006: Should display current token balance', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 500, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(500);
        });
    });

    test('FR-007: Should deduct bet amount from balance', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(1000);
        });

        act(() => {
        result.current.setBalance(prev => (prev || 0) - 50);
        });

        expect(result.current.balance).toBe(950);
    });

    test('FR-008: Should add winnings to balance', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(1000);
        });

        act(() => {
        result.current.setBalance(prev => (prev || 0) + 100);
        });

        expect(result.current.balance).toBe(1100);
    });

    test('FR-009: Should prevent betting with insufficient tokens', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 5, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(5);
        });

        // Simular que un juego intenta hacer una apuesta de 10
        const canBet = (result.current.balance || 0) >= 10;
        expect(canBet).toBe(false);
    });

    test('FR-010: Should maintain token balance during session', async () => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
        history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(1000);
        });

        // Simular múltiples operaciones
        act(() => {
        result.current.setBalance(950); // apuesta
        });
        expect(result.current.balance).toBe(950);

        act(() => {
        result.current.setBalance(1050); // ganancia
        });
        expect(result.current.balance).toBe(1050);
    });

    test('Should refresh balance from API', async () => {
        (profileApi.getMyProfile as jest.Mock)
        .mockResolvedValueOnce({
            user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
            history: [],
        })
        .mockResolvedValueOnce({
            user: { id: 1, email: 'test@test.com', coins: 1200, createdAt: '2025-01-01' },
            history: [],
        });

        const { result } = renderHook(() => useBalance(), {
        wrapper: BalanceProvider,
        });

        await waitFor(() => {
        expect(result.current.balance).toBe(1000);
        });

        await act(async () => {
        await result.current.refreshBalance();
        });

        expect(result.current.balance).toBe(1200);
    });
});
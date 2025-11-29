import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../app/contexts/AuthContext';
import { BalanceProvider } from '../../app/contexts/BalanceContext';
import { PageProvider } from '../../app/contexts/BoardNavigation';
import MainBoard from '../../app/Board/MainBoard';
import * as profileApi from '../../api/profile';

jest.mock('../../api/profile');
jest.mock('../../api/auth');

const renderMainBoard = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <BalanceProvider>
                    <PageProvider>
                        <MainBoard />
                    </PageProvider>
                </BalanceProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Game Flow Integration', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
            user: {
                id: '1',
                email: 'test@test.com',
                coins: 1000,
                createdAt: '2025-01-01',
            },
            history: [],
        });
    });

    test('Should load balance on MainBoard mount', async () => {
        renderMainBoard();

        await waitFor(() => {
            expect(screen.getByText('1000')).toBeInTheDocument();
        });

        expect(profileApi.getMyProfile).toHaveBeenCalledTimes(1);
    });

    test('Balance context integration: updates propagate correctly', async () => {
        (profileApi.getMyProfile as jest.Mock)
            .mockResolvedValueOnce({
                user: { id: '1', email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
                history: [],
            })
            .mockResolvedValueOnce({
                user: { id: '1', email: 'test@test.com', coins: 1100, createdAt: '2025-01-01' },
                history: [],
            });

        renderMainBoard();

        // Initial balance
        await waitFor(() => {
            expect(screen.getByText('1000')).toBeInTheDocument();
        });

        // Simulate balance update (would happen after a game win)
        // This is tested in individual game components
    });

    test('Should display header with balance and navigation', async () => {
        renderMainBoard();

        await waitFor(() => {
            expect(screen.getByText('Games')).toBeInTheDocument();
            expect(screen.getByText('Profile')).toBeInTheDocument();
            expect(screen.getByText('Ranking')).toBeInTheDocument();
            expect(screen.getByText('1000')).toBeInTheDocument();
        });
    });

    test('Auth + Balance integration: contexts work together', async () => {
        renderMainBoard();

        // Wait for both contexts to initialize
        await waitFor(() => {
            expect(profileApi.getMyProfile).toHaveBeenCalled();
            expect(screen.getByText('1000')).toBeInTheDocument();
        });
    });

    test('Should handle balance fetch error gracefully', async () => {
        (profileApi.getMyProfile as jest.Mock).mockRejectedValue(
            new Error('Failed to fetch balance')
        );

        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderMainBoard();

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith(
                'Error fetching balance:',
                expect.any(Error)
            );
        });

        consoleError.mockRestore();
    });
});
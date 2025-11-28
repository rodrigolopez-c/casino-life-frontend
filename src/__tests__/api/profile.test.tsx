import { getMyProfile } from '../../api/profile';
import { apiRequest } from '../../api/api';

jest.mock('../../../api/api');

describe('Profile API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should fetch user profile with history', async () => {
        const mockProfile = {
            user: {
                id: '1',
                email: 'test@test.com',
                coins: 1000,
                createdAt: '2025-01-01',
            },
            history: [
                {
                    id: '1',
                    game: 'blackjack',
                    result: 'win' as const,
                    amount: 100,
                    createdAt: '2025-01-15',
                },
                {
                    id: '2',
                    game: 'roulette',
                    result: 'lose' as const,
                    amount: 50,
                    createdAt: '2025-01-14',
                },
            ],
        };

        (apiRequest as jest.Mock).mockResolvedValue(mockProfile);

        const result = await getMyProfile();

        expect(apiRequest).toHaveBeenCalledWith('/api/profile/me');
        expect(result).toEqual(mockProfile);
        expect(result.user.coins).toBe(1000);
        expect(result.history).toHaveLength(2);
    });

    test('Should fetch profile with empty history', async () => {
        const mockProfile = {
            user: {
                id: '1',
                email: 'new@test.com',
                coins: 1000,
                createdAt: '2025-01-15',
            },
            history: [],
        };

        (apiRequest as jest.Mock).mockResolvedValue(mockProfile);

        const result = await getMyProfile();

        expect(result.history).toHaveLength(0);
    });

    test('Should handle unauthorized profile access', async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

        await expect(getMyProfile()).rejects.toThrow('Unauthorized');
    });

    test('Should handle server errors', async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error('Server error'));

        await expect(getMyProfile()).rejects.toThrow('Server error');
    });
});
import { login, register, getProfile } from '../../api/auth';
import { apiRequest } from '../../api/api';

jest.mock('../../api/api');

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('Should call apiRequest with correct parameters', async () => {
            const mockResponse = {
                token: 'fake-token',
                user: { id: 1, email: 'test@test.com', coins: 1000 }
            };

            (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

            const result = await login('test@test.com', 'password123');

            expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
            });

            expect(result).toEqual(mockResponse);
        });

        test('Should handle login errors', async () => {
            (apiRequest as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

            await expect(login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        test('Should call apiRequest with correct parameters', async () => {
            const mockResponse = { message: 'User created successfully' };

            (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

            const result = await register('new@test.com', 'password123');

            expect(apiRequest).toHaveBeenCalledWith('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@test.com', password: 'password123' }),
            });

            expect(result).toEqual(mockResponse);
        });

        test('Should handle registration errors', async () => {
            (apiRequest as jest.Mock).mockRejectedValue(new Error('Email already exists'));

            await expect(register('existing@test.com', 'password123')).rejects.toThrow('Email already exists');
        });
    });

    describe('getProfile', () => {
        test('Should fetch user profile', async () => {
            const mockProfile = {
                user: { id: 1, email: 'test@test.com', coins: 1000 }
            };

            (apiRequest as jest.Mock).mockResolvedValue(mockProfile);

            const result = await getProfile();

            expect(apiRequest).toHaveBeenCalledWith('/api/profile/me');
            expect(result).toEqual(mockProfile);
        });

        test('Should handle unauthorized access', async () => {
            (apiRequest as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

            await expect(getProfile()).rejects.toThrow('Unauthorized');
        });
    });
});
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../app/contexts/AuthContext';
import * as authApi from '../../api/auth';

jest.mock('../../api/auth');

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('FR-AUTH-001: Should start with null user and loading true', () => {
        const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBe(null);
    });

    test('FR-AUTH-002: Should login user successfully', async () => {
        const mockUser = { id: 1, email: 'test@test.com', coins: 1000 };
        const mockToken = 'fake-jwt-token';

        (authApi.login as jest.Mock).mockResolvedValue({
        token: mockToken,
        user: mockUser,
        });

        const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
        });

        await act(async () => {
        await result.current.loginUser('test@test.com', 'password123');
        });

        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(result.current.user).toEqual(mockUser);
    });

    test('FR-AUTH-003: Should register and auto-login user', async () => {
        const mockUser = { id: 1, email: 'new@test.com', coins: 1000 };
        const mockToken = 'new-jwt-token';

        (authApi.register as jest.Mock).mockResolvedValue({ message: 'success' });
        (authApi.login as jest.Mock).mockResolvedValue({
        token: mockToken,
        user: mockUser,
        });

        const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
        });

        await act(async () => {
        await result.current.registerUser('new@test.com', 'password123');
        });

        expect(result.current.user).toEqual(mockUser);
    });

    test('FR-AUTH-004: Should logout user and clear token', async () => {
        localStorage.setItem('token', 'some-token');

        const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
        });

        act(() => {
        result.current.logout();
        });

        expect(localStorage.getItem('token')).toBe(null);
        expect(result.current.user).toBe(null);
    });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../app/App';
import * as authApi from '../../api/auth';
import * as profileApi from '../../api/profile';

jest.mock('../../api/auth');
jest.mock('../../api/profile');

describe('Login Flow Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('Complete login flow: enter email → password → access board', async () => {
        const mockUser = { id: 1, email: 'test@test.com', coins: 1000 };
        const mockToken = 'fake-jwt-token';

        (authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
            user: mockUser,
        });

        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
            user: { id: '1', email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
            history: [],
        });

        render(<App />);

        // Wait for login page to load
        await waitFor(() => {
            expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
        });

        // Click sign in
        const signInButton = screen.getByText('Sign in with Email');
        fireEvent.click(signInButton);

        // Enter email
        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByText('Continue with email'));

        // Enter password
        await waitFor(() => {
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
        });

        const loginButton = screen.getByText('Log in');
        fireEvent.click(loginButton);

        // Verify login was called
        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
            expect(localStorage.getItem('token')).toBe(mockToken);
        });
    });

    test('Registration flow: create account → auto-login → access board', async () => {
        const mockUser = { id: 1, email: 'new@test.com', coins: 1000 };
        const mockToken = 'new-jwt-token';

        (authApi.register as jest.Mock).mockResolvedValue({ message: 'success' });
        (authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
            user: mockUser,
        });

        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
            user: { id: '1', email: 'new@test.com', coins: 1000, createdAt: '2025-01-15' },
            history: [],
        });

        render(<App />);

        // Wait for login page
        await waitFor(() => {
            expect(screen.getByText('Create a Player Account')).toBeInTheDocument();
        });

        // Click create account
        const registerButton = screen.getByText('Create a Player Account');
        fireEvent.click(registerButton);

        // Enter email
        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
        fireEvent.click(screen.getByText('Continue with email'));

        // Enter password
        await waitFor(() => {
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
        });

        const loginButton = screen.getByText('Log in');
        fireEvent.click(loginButton);

        // Verify registration and login were called
        await waitFor(() => {
            expect(authApi.register).toHaveBeenCalledWith('new@test.com', 'password123');
            expect(authApi.login).toHaveBeenCalledWith('new@test.com', 'password123');
        });
    });

    test('Failed login: should show error and stay on login page', async () => {
        (authApi.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

        // Mock window.alert
        const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
        });

        // Attempt login
        fireEvent.click(screen.getByText('Sign in with Email'));

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByText('Continue with email'));

        await waitFor(() => {
            const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
            fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        });

        fireEvent.click(screen.getByText('Log in'));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith('Invalid credentials');
            expect(localStorage.getItem('token')).toBeNull();
        });

        alertMock.mockRestore();
    });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../app/login/login';
import { AuthProvider } from '../../../app/contexts/AuthContext';
import { BalanceProvider } from '../../../app/contexts/BalanceContext';
import * as authApi from '../../../api/auth';

jest.mock('../../../api/auth');
jest.mock('../../../api/profile');

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <BalanceProvider>
                    <Login />
                </BalanceProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('Should render login buttons initially', () => {
        renderLogin();

        expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
        expect(screen.getByText('Create a Player Account')).toBeInTheDocument();
    });

    test('Should show email input when clicking Sign in', () => {
        renderLogin();

        const signInButton = screen.getByText('Sign in with Email');
        fireEvent.click(signInButton);

        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    });

    test('Should show password input after entering valid email', async () => {
        renderLogin();

        const signInButton = screen.getByText('Sign in with Email');
        fireEvent.click(signInButton);

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

        const continueButton = screen.getByText('Continue with email');
        fireEvent.click(continueButton);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
        });
    });

    test('Should handle login submission successfully', async () => {
        const mockUser = { id: 1, email: 'test@test.com', coins: 1000 };
        const mockToken = 'fake-jwt-token';

        (authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
            user: mockUser,
        });

        renderLogin();

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

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
        });
    });

    test('Should handle registration flow', async () => {
        const mockUser = { id: 1, email: 'new@test.com', coins: 1000 };
        const mockToken = 'new-jwt-token';

        (authApi.register as jest.Mock).mockResolvedValue({ message: 'success' });
        (authApi.login as jest.Mock).mockResolvedValue({
            token: mockToken,
            user: mockUser,
        });

        renderLogin();

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

        await waitFor(() => {
            expect(authApi.register).toHaveBeenCalledWith('new@test.com', 'password123');
        });
    });
});
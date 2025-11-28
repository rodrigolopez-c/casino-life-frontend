import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginTextInput from '../../../app/components/login/LoginTextInput/LoginTextInput';

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginTextInput Component', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should render email input initially', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
        expect(screen.getByText('Continue with email')).toBeInTheDocument();
    });

    test('Should not allow submit with invalid email', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const submitButton = screen.getByText('Continue with email');
        expect(submitButton).toBeDisabled();
    });

    test('Should allow submit with valid email', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

        const submitButton = screen.getByText('Continue with email');
        expect(submitButton).not.toBeDisabled();
    });

    test('Should progress to password step after email', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

        const continueButton = screen.getByText('Continue with email');
        fireEvent.click(continueButton);

        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
        expect(screen.getByText('Log in')).toBeInTheDocument();
    });

    test('Should call onSubmit when password is entered', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        // Step 1: Email
        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByText('Continue with email'));

        // Step 2: Password
        const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        const loginButton = screen.getByText('Log in');
        fireEvent.click(loginButton);

        expect(mockOnSubmit).toHaveBeenCalledWith('test@test.com', 'password123');
    });

    test('Should go back to email step when clicking back', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} />);

        // Progress to password step
        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByText('Continue with email'));

        // Click back
        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/Enter your password/i)).not.toBeInTheDocument();
    });

    test('Should disable submit while loading', () => {
        renderWithRouter(<LoginTextInput onSubmit={mockOnSubmit} loading={true} />);

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

        const submitButton = screen.getByText('Please wait...');
        expect(submitButton).toBeDisabled();
    });
});
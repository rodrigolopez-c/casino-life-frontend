import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../../app/contexts/ProtectedRoute';
import { AuthProvider } from '../../app/contexts/AuthContext';
import * as authApi from '../../api/auth';

jest.mock('../../api/auth');

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('Should show loading while checking auth', () => {
        (authApi.getProfile as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
        );

        localStorage.setItem('token', 'valid-token');

        render(
        <MemoryRouter>
            <AuthProvider>
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
            </AuthProvider>
        </MemoryRouter>
        );

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    test('Should redirect to login if not authenticated', async () => {
        render(
        <MemoryRouter initialEntries={['/board']}>
            <AuthProvider>
            <ProtectedRoute>
                <TestComponent />
            </ProtectedRoute>
            </AuthProvider>
        </MemoryRouter>
        );

        // No debería mostrar contenido protegido
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../../app/components/MainBoard/Header/Header';
import { BalanceProvider } from '../../../app/contexts/BalanceContext';
import { PageProvider } from '../../../app/contexts/BoardNavigation';
import * as profileApi from '../../../api/profile';

jest.mock('../../../api/profile');

const renderHeader = () => {
    return render(
        <BrowserRouter>
        <BalanceProvider>
            <PageProvider>
            <Header />
            </PageProvider>
        </BalanceProvider>
        </BrowserRouter>
    );
};

describe('Header Component - FR-006: Display token balance', () => {
    beforeEach(() => {
        (profileApi.getMyProfile as jest.Mock).mockResolvedValue({
        user: { id: 1, email: 'test@test.com', coins: 1000, createdAt: '2025-01-01' },
        history: [],
        });
    });

    test('Should display balance prominently', async () => {
        renderHeader();

        const balanceElement = await screen.findByText('1000');
        expect(balanceElement).toBeInTheDocument();
    });

    test('Should display add coins button', () => {
        renderHeader();

        const addButton = screen.getByText('+');
        expect(addButton).toBeInTheDocument();
    });

    test('Should open modal when clicking add coins button', () => {
        renderHeader();

        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        expect(screen.getByText(/Gana coins/i)).toBeInTheDocument();
    });
});
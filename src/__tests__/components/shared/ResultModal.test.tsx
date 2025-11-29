import { render, screen, fireEvent } from '@testing-library/react';
import ResultModal from '../../../app/components/shared/ResultModal';

describe('ResultModal Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should render win modal correctly', () => {
        render(
            <ResultModal
                won={true}
                amount={100}
                result="6 + 5 = 11"
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('¡Ganaste!')).toBeInTheDocument();
        expect(screen.getByText('+$100')).toBeInTheDocument();
        expect(screen.getByText('6 + 5 = 11')).toBeInTheDocument();
        expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    test('Should render lose modal correctly', () => {
        render(
            <ResultModal
                won={false}
                amount={50}
                result="Perdiste"
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Mejor suerte la próxima')).toBeInTheDocument();
        expect(screen.getByText('-$50')).toBeInTheDocument();
        expect(screen.getByText('😔')).toBeInTheDocument();
    });

    test('Should call onClose when clicking continue button', () => {
        render(
            <ResultModal
                won={true}
                amount={100}
                result="Win"
                onClose={mockOnClose}
            />
        );

        const continueButton = screen.getByText('Continuar');
        fireEvent.click(continueButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('Should call onClose when clicking overlay', () => {
        render(
            <ResultModal
                won={true}
                amount={100}
                result="Win"
                onClose={mockOnClose}
            />
        );

        const overlay = document.querySelector('.result-modal-overlay');
        fireEvent.click(overlay!);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('Should not close when clicking modal content', () => {
        render(
            <ResultModal
                won={true}
                amount={100}
                result="Win"
                onClose={mockOnClose}
            />
        );

        const modal = document.querySelector('.result-modal');
        fireEvent.click(modal!);

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('Should apply correct CSS classes for win state', () => {
        const { container } = render(
            <ResultModal
                won={true}
                amount={100}
                result="Win"
                onClose={mockOnClose}
            />
        );

        expect(container.querySelector('.result-content.win')).toBeInTheDocument();
        expect(container.querySelector('.win-amount')).toBeInTheDocument();
    });

    test('Should apply correct CSS classes for lose state', () => {
        const { container } = render(
            <ResultModal
                won={false}
                amount={50}
                result="Lose"
                onClose={mockOnClose}
            />
        );

        expect(container.querySelector('.result-content.lose')).toBeInTheDocument();
        expect(container.querySelector('.lose-amount')).toBeInTheDocument();
    });
});
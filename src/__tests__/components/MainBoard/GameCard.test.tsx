import { render, screen, fireEvent } from '@testing-library/react';
import GameCard from '../../../app/components/MainBoard/GameCard/GameCard';

describe('GameCard Component', () => {
    const mockProps = {
        imageUrl: '/test-image.png',
        title: 'Test Game',
        description: 'This is a test game description',
        onClick: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should render game card with correct data', () => {
        render(<GameCard {...mockProps} />);

        expect(screen.getByText('Test Game')).toBeInTheDocument();
        expect(screen.getByText('This is a test game description')).toBeInTheDocument();
    });

    test('Should display image with correct URL', () => {
        const { container } = render(<GameCard {...mockProps} />);

        const imageDiv = container.querySelector('.GameCardImage');
        expect(imageDiv).toHaveStyle({ backgroundImage: 'url(/test-image.png)' });
    });

    test('Should call onClick when card is clicked', () => {
        render(<GameCard {...mockProps} />);

        const card = screen.getByText('Test Game').closest('.GameCard');
        fireEvent.click(card!);

        expect(mockProps.onClick).toHaveBeenCalledTimes(1);
    });

    test('Should render without onClick handler', () => {
        const propsWithoutClick = { ...mockProps, onClick: undefined };
        
        render(<GameCard {...propsWithoutClick} />);

        expect(screen.getByText('Test Game')).toBeInTheDocument();
    });

    test('Should have proper CSS classes', () => {
        const { container } = render(<GameCard {...mockProps} />);

        expect(container.querySelector('.GameCard')).toBeInTheDocument();
        expect(container.querySelector('.GameCardImage')).toBeInTheDocument();
        expect(container.querySelector('.GameCardDescription')).toBeInTheDocument();
    });
});
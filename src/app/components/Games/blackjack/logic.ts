// 2. logic.ts
import { type CardData, type Suit } from './types';

export const createDeck = (): CardData[] => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: CardData[] = [];

    for (const suit of suits) {
        for (const value of values) {
            let numericValue = parseInt(value);
            if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
            if (value === 'A') numericValue = 11;
            deck.push({ suit, value, numericValue });
        }
    }
    return deck;
};

export const shuffleDeck = (deck: CardData[]): CardData[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

export const calculateScore = (hand: CardData[]): number => {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
        score += card.numericValue;
        if (card.value === 'A') aces += 1;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
};
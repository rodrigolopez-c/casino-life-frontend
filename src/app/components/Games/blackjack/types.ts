// 1. types.ts
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface CardData {
    suit: Suit;
    value: string;
    numericValue: number;
}

export type GameStatus = 'betting' | 'playing' | 'resolving' | 'gameover';
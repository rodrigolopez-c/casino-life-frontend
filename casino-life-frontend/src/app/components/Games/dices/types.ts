export type BetType = 'even' | 'odd' | 'specific-sum' | 'specific-die' | 'range';

export interface Bet {
    type: BetType;
    amount: number;
    value?: number; // Para número específico
    target?: 'die1' | 'die2' | 'sum'; // Para specific-die o specific-sum
}

export interface DiceResult {
    die1: number;
    die2: number;
    sum: number;
}

export interface GameState {
    balance: number;
    currentBet: Bet | null;
    isRolling: boolean;
    lastResult: DiceResult | null;
    showResult: boolean;
    won: boolean;
}
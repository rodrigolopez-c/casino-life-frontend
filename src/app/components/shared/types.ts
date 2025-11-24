// Tipos de apuestas disponibles en los juegos
export type BetType = 
  | 'even' | 'odd' | 'specific-sum' | 'specific-die' | 'range' 
  | 'heads' | 'tails'
  | 'red' | 'black' | 'green' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'specific';

// Estructura de una apuesta
export interface Bet {
    type: BetType;
    amount: number;
    value?: number; // Para número específico
    target?: 'die1' | 'die2' | 'sum' | 'coin'; // Para indicar el objetivo de la apuesta
}

// Resultado de dados
export interface DiceResult {
    die1: number;
    die2: number;
    sum: number;
}

// Resultado de moneda
export interface CoinResult {
    side: 'heads' | 'tails';
}

// Resultado de ruleta
export interface RouletteResult {
    number: number;
    color: 'red' | 'black' | 'green';
}

// Estado general del juego
export interface GameState {
    balance: number;
    currentBet: Bet | null;
    isRolling: boolean;
    lastResult: DiceResult | CoinResult | RouletteResult | null;
    showResult: boolean;
    won: boolean;
}
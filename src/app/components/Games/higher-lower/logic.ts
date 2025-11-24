import { type CardData, type Suit } from '../blackjack/types'; // Reusamos tipos

// Valores numéricos para comparar (A = 14, K = 13, etc.)
export const getCardValue = (value: string): number => {
    if (value === 'A') return 14;
    if (value === 'K') return 13;
    if (value === 'Q') return 12;
    if (value === 'J') return 11;
    return parseInt(value);
};

export const getRandomCard = (): CardData => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];

    return { suit: randomSuit, value: randomValue, numericValue: getCardValue(randomValue) };
};

// CALCULADORA DE PROBABILIDADES
// House Edge (Ventaja de la casa) del 4% (0.96 RTP)
const HOUSE_EDGE = 0.96;

export const calculateMultipliers = (currentCardValue: string) => {
    const val = getCardValue(currentCardValue);
    
    // Total de rangos posibles (2 al 14) = 13 cartas
    const totalRanks = 13;

    // Cartas que son menores (ej: si tengo 5, menores son 2,3,4 -> 3 cartas)
    // Como el 2 es el valor más bajo, la cantidad de menores es (val - 2)
    const lowerCount = val - 2;
    
    // Cartas que son mayores (ej: si tengo 10, mayores son J,Q,K,A -> 4 cartas)
    // (14 es el as)
    const higherCount = 14 - val;

    // Probabilidad (agregamos 1 al divisor para diluir el empate en la banca)
    // Si sale la misma carta, se pierde.
    const probLower = lowerCount / totalRanks;
    const probHigher = higherCount / totalRanks;

    // Multiplicador = (1 / Probabilidad) * HouseEdge
    // Si la probabilidad es 0 (ej: bajar de un 2), devolvemos 0
    let multLower = probLower > 0 ? (1 / probLower) * HOUSE_EDGE : 0;
    let multHigher = probHigher > 0 ? (1 / probHigher) * HOUSE_EDGE : 0;

    return {
        higher: Number(multHigher.toFixed(2)),
        lower: Number(multLower.toFixed(2)),
        probHigher: Math.round(probHigher * 100),
        probLower: Math.round(probLower * 100)
    };
};
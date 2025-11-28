import React, { useState, useRef } from 'react';
import RouletteCanvas from './RouletteCanvas';
import BettingPanel from './BettingPanel';
import ResultModal from '../../shared/ResultModal';
import type { Bet, RouletteResult } from '../../shared/types';
import { useBalance } from '../../../contexts/BalanceContext';
import { updateCoins } from '@/api/coins';

export default function RouletteGame() {
    const { balance, setBalance } = useBalance();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentBet, setCurrentBet] = useState<Bet | null>(null);
    const currentBetRef = useRef<Bet | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [lastWin, setLastWin] = useState(false);
    const [lastResult, setLastResult] = useState<RouletteResult | null>(null);
    const [winAmount, setWinAmount] = useState(0);
    const spinTriggerRef = useRef<((resultNumber: number) => void) | null>(null);

    const handlePlaceBet = (betType: string, amount: number, value?: number) => {
        if (amount > balance || isSpinning) return;

        const bet: Bet = {
        type: betType as any,
        amount,
        value,
        };

        setCurrentBet(bet);
        currentBetRef.current = bet;
        setIsSpinning(true);

        const resultNumber = generateResultForBet(betType, value);

        setTimeout(() => {
        if (spinTriggerRef.current) {
            spinTriggerRef.current(resultNumber);
        }
        }, 50);
    };

    const generateResultForBet = (betType: string, value?: number): number => {
        const validNumbers = Array.from({ length: 37 }, (_, i) => i);
        
        switch (betType) {
        case 'red': {
            const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
            return redNumbers[Math.floor(Math.random() * redNumbers.length)];
        }
        case 'black': {
            const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
            return blackNumbers[Math.floor(Math.random() * blackNumbers.length)];
        }
        case 'green':
            return 0;
        case 'even': {
            const evenNumbers = validNumbers.filter(n => n !== 0 && n % 2 === 0);
            return evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
        }
        case 'odd': {
            const oddNumbers = validNumbers.filter(n => n !== 0 && n % 2 !== 0);
            return oddNumbers[Math.floor(Math.random() * oddNumbers.length)];
        }
        case 'low':
            return Math.floor(Math.random() * 18) + 1;
        case 'high':
            return Math.floor(Math.random() * 18) + 19;
        case 'dozen1':
            return Math.floor(Math.random() * 12) + 1;
        case 'dozen2':
            return Math.floor(Math.random() * 12) + 13;
        case 'dozen3':
            return Math.floor(Math.random() * 12) + 25;
        case 'specific':
            return value ?? 1;
        default:
            return Math.floor(Math.random() * 37);
        }
    };

    const handleSpinEnd = async (number: number, color: 'red' | 'black' | 'green') => {
        const bet = currentBetRef.current;
        if (!bet) {
        setIsSpinning(false);
        return;
        }

        const result: RouletteResult = { number, color };
        setLastResult(result);

        const won = evaluateBet(bet, result);
        const multiplier = getBetMultiplier(bet.type);

        const totalWinnings = won ? bet.amount * (multiplier - 1) : 0;
        setWinAmount(won ? bet.amount * multiplier : bet.amount);

        const netAmount = won ? totalWinnings : -bet.amount;

        try {
        const response = await updateCoins('roulette', won ? 'win' : 'lost', Math.abs(netAmount));
        setBalance(response.newBalance);
        } catch (err) {
        console.error('Error updating balance:', err);
        }

        setLastWin(won);
        setShowResultModal(true);
        setIsSpinning(false);
    };

    const evaluateBet = (bet: Bet, result: RouletteResult): boolean => {
        const colorMap: Record<number, 'red' | 'black' | 'green'> = {
        0: 'green',
        1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red',
        10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
        19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red',
        28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red',
        };

        switch (bet.type) {
        case 'red':
            return colorMap[result.number] === 'red';
        case 'black':
            return colorMap[result.number] === 'black';
        case 'green':
            return result.number === 0;
        case 'even':
            return result.number !== 0 && result.number % 2 === 0;
        case 'odd':
            return result.number !== 0 && result.number % 2 !== 0;
        case 'low':
            return result.number >= 1 && result.number <= 18;
        case 'high':
            return result.number >= 19 && result.number <= 36;
        case 'dozen1':
            return result.number >= 1 && result.number <= 12;
        case 'dozen2':
            return result.number >= 13 && result.number <= 24;
        case 'dozen3':
            return result.number >= 25 && result.number <= 36;
        case 'specific':
            return result.number === bet.value;
        default:
            return false;
        }
    };

    const getBetMultiplier = (betType: string): number => {
        switch (betType) {
        case 'red':
        case 'black':
        case 'even':
        case 'odd':
        case 'low':
        case 'high':
            return 2;
        case 'dozen1':
        case 'dozen2':
        case 'dozen3':
            return 3;
        case 'green':
        case 'specific':
            return 36;
        default:
            return 1;
        }
    };

    const getBetMessage = (): string => {
        if (!currentBet) return 'Seleccione una apuesta';
        let betName = '';
        switch (currentBet.type) {
        case 'red':
            betName = '🔴 Rojo';
            break;
        case 'black':
            betName = '⚫ Negro';
            break;
        case 'green':
            betName = '🟢 Verde (0 o 00)';
            break;
        case 'even':
            betName = 'Par';
            break;
        case 'odd':
            betName = 'Impar';
            break;
        case 'low':
            betName = '1-18 (Bajo)';
            break;
        case 'high':
            betName = '19-36 (Alto)';
            break;
        case 'dozen1':
            betName = '1era Docena (1-12)';
            break;
        case 'dozen2':
            betName = '2da Docena (13-24)';
            break;
        case 'dozen3':
            betName = '3era Docena (25-36)';
            break;
        case 'specific':
            betName = `Número Específico (${currentBet.value})`;
            break;
        default:
            betName = 'Desconocida';
        }
        return `${betName} - $${currentBet.amount}`;
    };

    const handleCloseModal = () => {
        setShowResultModal(false);
        setCurrentBet(null);
        currentBetRef.current = null;
        setIsSpinning(false);
    };

    return (
        <div
        style={{
            display: 'flex',
            gap: '20px',
            height: 'calc(100vh - 40px)',
            width: '100%',
            background: '#0b0f1a',
            padding: '20px',
            overflow: 'hidden',
        }}
        >
        <div style={{ flexShrink: 0 }}>
            <BettingPanel
            balance={balance}
            onPlaceBet={handlePlaceBet}
            disabled={isSpinning || !gameStarted}
            isSpinning={isSpinning}
            />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
            <RouletteCanvas
            spinTriggerRef={spinTriggerRef}
            onSpinStart={() => {}}
            onSpinEnd={handleSpinEnd}
            canBet={gameStarted}
            onGameStart={() => setGameStarted(true)}
            currentBetMessage={getBetMessage()}
            />
        </div>

        {showResultModal && lastResult && (
            <ResultModal
            won={lastWin}
            amount={winAmount}
            result={`Número ${lastResult.number} - ${lastResult.color.charAt(0).toUpperCase() + lastResult.color.slice(1)}`}
            onClose={handleCloseModal}
            />
        )}
        </div>
    );
}
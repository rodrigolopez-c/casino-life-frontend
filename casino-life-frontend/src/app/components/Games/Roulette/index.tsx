import React, { useState, useRef } from 'react';
import RouletteCanvas from './RouletteCanvas';
import BettingPanel from './BettingPanel';
import ResultModal from '../../shared/ResultModal';
import { useBalance } from '../../../contexts/BalanceContext';
import './styles.scss';

interface RouletteBet {
    type: string;
    amount: number;
    value?: number;
}

const ROULETTE_COLORS: { [key: number]: string } = {
    0: 'green',
    1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
    7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
    13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
    19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
    25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

export default function RouletteGame() {
    const { balance, setBalance } = useBalance();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentBet, setCurrentBet] = useState<RouletteBet | null>(null);
    const currentBetRef = useRef<RouletteBet | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [lastWin, setLastWin] = useState(false);
    const [winAmount, setWinAmount] = useState(0);
    const [lastResult, setLastResult] = useState<number | null>(null);
    const spinTriggerRef = useRef<(() => void) | null>(null);
    const resultRef = useRef<number | null>(null);

    const handlePlaceBet = (betType: string, amount: number, value?: number) => {
        if (amount > balance || isSpinning) return;
        
        const bet: RouletteBet = {
            type: betType,
            amount,
            value,
        };

        setCurrentBet(bet);
        currentBetRef.current = bet;
        setIsSpinning(true);
        
        setTimeout(() => {
            if (spinTriggerRef.current) {
                spinTriggerRef.current();
            }
        }, 50);
    };

    const handleSpinComplete = (number: number) => {
        const bet = currentBetRef.current;
        
        if (!bet) {
            setIsSpinning(false);
            return;
        }

        setLastResult(number);
        const won = evaluateBet(bet, number);
        const multiplier = getBetMultiplier(bet.type);
        
        if (won) {
            const totalWinnings = bet.amount * multiplier;
            setWinAmount(totalWinnings);
            setBalance(prev => prev - bet.amount + totalWinnings);
        } else {
            setWinAmount(bet.amount);
            setBalance(prev => prev - bet.amount);
        }

        setLastWin(won);
        setTimeout(() => {
            setShowResultModal(true);
            setIsSpinning(false);
        }, 800);
    };

    const evaluateBet = (bet: RouletteBet, number: number): boolean => {
        // 00 se representa como -1
        if (number === -1) number = 0;

        switch (bet.type) {
            case 'red':
                return ROULETTE_COLORS[number] === 'red';
            case 'black':
                return ROULETTE_COLORS[number] === 'black';
            case 'green':
                return number === 0; // Verde gana con 0 o 00 (ambos representados como 0)
            case 'even':
                return number !== 0 && number % 2 === 0;
            case 'odd':
                return number !== 0 && number % 2 !== 0;
            case 'low':
                return number >= 1 && number <= 18;
            case 'high':
                return number >= 19 && number <= 36;
            case 'dozen1':
                return number >= 1 && number <= 12;
            case 'dozen2':
                return number >= 13 && number <= 24;
            case 'dozen3':
                return number >= 25 && number <= 36;
            case 'specific':
                return number === bet.value;
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
            case 'specific':
            case 'green':
                return 36;
            default:
                return 1;
        }
    };

    const getBetMessage = (): string => {
        if (!currentBet) return "Seleccione una apuesta";
        
        let betName = "";
        switch (currentBet.type) {
            case 'red':
                betName = "🔴 Rojo";
                break;
            case 'green':
                betName = "🟢 Verde";
                break;
            case 'black':
                betName = "⚫ Negro";
                break;
            case 'even':
                betName = "Par";
                break;
            case 'odd':
                betName = "Impar";
                break;
            case 'low':
                betName = "1-18 (Bajo)";
                break;
            case 'high':
                betName = "19-36 (Alto)";
                break;
            case 'dozen1':
                betName = "1era Docena (1-12)";
                break;
            case 'dozen2':
                betName = "2da Docena (13-24)";
                break;
            case 'dozen3':
                betName = "3era Docena (25-36)";
                break;
            case 'specific':
                betName = `Número ${currentBet.value}`;
                break;
            default:
                betName = "Desconocida";
        }
        
        return `${betName} - $${currentBet.amount}`;
    };

    const getResultText = (): string => {
        if (lastResult === null) return "";
        const color = ROULETTE_COLORS[lastResult] || 'verde';
        const colorEmoji = color === 'red' ? '🔴' : color === 'black' ? '⚫' : '🟢';
        return `${colorEmoji} ${lastResult}`;
    };

    const handleCloseModal = () => {
        setShowResultModal(false);
        setCurrentBet(null);
        currentBetRef.current = null;
        setIsSpinning(false);
    };

    return (
        <div className="roulette-container">
            <div className="roulette-sidebar">
                <BettingPanel 
                    balance={balance} 
                    onPlaceBet={handlePlaceBet}
                    disabled={isSpinning || !gameStarted}
                    isSpinning={isSpinning}
                />
            </div>

            <div className="roulette-canvas-area">
                <RouletteCanvas 
                    spinTriggerRef={spinTriggerRef}
                    resultRef={resultRef}
                    onSpinComplete={handleSpinComplete}
                    onGameStart={() => setGameStarted(true)}
                    currentBetMessage={getBetMessage()}
                />
            </div>

            {showResultModal && (
                <ResultModal
                    won={lastWin}
                    amount={winAmount}
                    result={getResultText()}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
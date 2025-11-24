import React, { useState, useRef } from 'react';
import CoinCanvas from './CoinCanvas';
import CoinBettingPanel from './CoinBettingPanel';
import ResultModal from '../../shared/ResultModal';
import type { Bet, CoinResult } from '../../shared/types';
import { useBalance } from '../../../contexts/BalanceContext';
import { updateCoins } from '@/api/coins';

export default function CoinFlipGame() {
    const { balance, setBalance } = useBalance();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentBet, setCurrentBet] = useState<Bet | null>(null);
    const currentBetRef = useRef<Bet | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [lastWin, setLastWin] = useState(false);
    const [lastResult, setLastResult] = useState<CoinResult | null>(null);
    const [winAmount, setWinAmount] = useState(0);

    const flipTriggerRef = useRef<(() => void) | null>(null);
    const resultRef = useRef<'heads' | 'tails' | null>(null);

    // 🟡 Restar apuesta cuando el usuario apuesta
    const handlePlaceBet = (betType: 'heads' | 'tails', amount: number) => {
        if (amount > balance || isFlipping) return;

        const bet: Bet = { type: betType, amount, target: 'coin' };

        setCurrentBet(bet);
        currentBetRef.current = bet;
        setIsFlipping(true);

        // Restamos la apuesta inmediatamente
        setBalance(prev => prev - amount);

        setTimeout(() => {
            if (flipTriggerRef.current) flipTriggerRef.current();
        }, 50);
    };

    // 🎰 Resultado final del flip
    const handleCoinSettled = async (side: 'heads' | 'tails') => {
        const bet = currentBetRef.current;
        if (!bet) {
            setIsFlipping(false);
            return;
        }

        const result: CoinResult = { side };
        setLastResult(result);

        const won = bet.type === side;
        const multiplier = 2;

        // 🧮 Premio total
        const totalWinnings = won ? bet.amount * multiplier : 0;

        // Mostramos en el modal:
        setWinAmount(won ? totalWinnings : bet.amount);

        // 🟣 Ganancia neta para el backend
        const netAmount = won ? bet.amount : bet.amount; // backend recibe solo "amount"

        try {
            const response = await updateCoins(
                "coinflip",
                won ? "win" : "lost",
                bet.amount
            );

            // Balance real del backend
            setBalance(response.newBalance);

        } catch (err) {
            console.error("Error updating coins:", err);
        }

        setLastWin(won);
        setShowResultModal(true);
        setIsFlipping(false);
    };

    const getBetMessage = () =>
        currentBet ? `${currentBet.type === 'heads' ? "Cara" : "Cruz"} - $${currentBet.amount}` : 
        "Seleccione Cara o Cruz";

    const handleCloseModal = () => {
        setShowResultModal(false);
        setCurrentBet(null);
        currentBetRef.current = null;
        setIsFlipping(false);
    };

    return (
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)', width: '100%', background: '#0b0f1a', padding: '20px', overflow: 'hidden'}}>

            <div style={{ flexShrink: 0 }}>
                <CoinBettingPanel 
                    balance={balance} 
                    onPlaceBet={handlePlaceBet}
                    disabled={isFlipping || !gameStarted}
                    isFlipping={isFlipping}
                />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <CoinCanvas 
                    flipTriggerRef={flipTriggerRef}
                    resultRef={resultRef}
                    onCoinSettled={handleCoinSettled}
                    canBet={gameStarted}
                    onGameStart={() => setGameStarted(true)}
                    currentBetMessage={getBetMessage()}
                />
            </div>

            {showResultModal && lastResult && (
                <ResultModal
                    won={lastWin}
                    amount={winAmount}
                    result={lastResult.side === 'heads' ? 'Cara' : 'Cruz'}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
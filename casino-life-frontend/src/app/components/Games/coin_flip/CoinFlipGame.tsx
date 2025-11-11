import React, { useState, useRef } from 'react';
import CoinCanvas from './CoinCanvas';
import CoinBettingPanel from './CoinBettingPanel';
import ResultModal from '../shared/ResultModal';
import type { Bet, CoinResult } from '../shared/types';
import { useBalance } from '../../../contexts/BalanceContext';

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

    const handlePlaceBet = (betType: 'heads' | 'tails', amount: number) => {
        // Verifica balance y que no haya un flip en curso
        if (amount > balance || isFlipping) return;
        
        // Crea el objeto de apuesta
        const bet: Bet = {
        type: betType,
        amount,
        target: 'coin',
        };

        // Guarda la apuesta
        setCurrentBet(bet);
        currentBetRef.current = bet;
        
        // Marca que la moneda está girando
        setIsFlipping(true);
        
        // Pausa breve antes de iniciar el flip
        setTimeout(() => {
        if (flipTriggerRef.current) {
            flipTriggerRef.current();
        }
        }, 50);
    };

    // Se ejecuta cuando la moneda termina de girar
    const handleCoinSettled = (side: 'heads' | 'tails') => {
        // Obtiene la apuesta desde la referencia
        const bet = currentBetRef.current;
        
        // Si no hay apuesta, libera el estado y sale
        if (!bet) {
        setIsFlipping(false);
        return;
        }

        // Crea el objeto de resultado
        const result: CoinResult = { side };
        setLastResult(result);

        // Verifica si ganó (la apuesta coincide con el resultado)
        const won = bet.type === side;
        
        // La moneda siempre paga x2
        const multiplier = 2;
        
        // Calcula ganancias o pérdidas
        if (won) {
        const totalWinnings = bet.amount * multiplier;
        setWinAmount(totalWinnings);
        setBalance(prev => prev - bet.amount + totalWinnings);
        } else {
        setWinAmount(bet.amount);
        setBalance(prev => prev - bet.amount);
        }

        // Muestra el modal con el resultado
        setLastWin(won);
        setShowResultModal(true);
        setIsFlipping(false);
    };

    // Genera el mensaje de apuesta actual
    const getBetMessage = (): string => {
        if (!currentBet) return "Seleccione Cara o Cruz";
        
        const sideName = currentBet.type === 'heads' ? 'Cara' : 'Cruz';
        return `${sideName} - $${currentBet.amount}`;
    };

    // Cierra el modal de resultados
    const handleCloseModal = () => {
        setShowResultModal(false);
        setCurrentBet(null);
        currentBetRef.current = null;
        setIsFlipping(false);
    };

    return (
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)', width: '100%', background: '#0b0f1a', padding: '20px', overflow: 'hidden'}}>
        {/* Panel izquierdo: opciones de apuestas */}
        <div style={{ flexShrink: 0 }}>
            <CoinBettingPanel 
            balance={balance} 
            onPlaceBet={handlePlaceBet}
            disabled={isFlipping || !gameStarted}
            isFlipping={isFlipping}
            />
        </div>

        {/* Centro: canvas 3D con la moneda */}
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

        {/* Modal de resultados */}
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
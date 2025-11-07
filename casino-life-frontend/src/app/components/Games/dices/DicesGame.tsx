import React, { useState, useRef } from 'react';
import DiceCanvas from './DicesCanvas';
import BettingPanel from './BettingPanel';
import ResultModal from './ResultModal';
import type { Bet, DiceResult } from './types';
import { useBalance } from '../../../contexts/BalanceContext';

export default function DicesGame() {
  const { balance, setBalance } = useBalance();
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWin, setLastWin] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const rollTriggerRef = useRef<(() => void) | null>(null);
  const resultsRef = useRef<{ die1: number | null; die2: number | null }>({ die1: null, die2: null });

  const handlePlaceBet = (betType: string, amount: number, value?: number, target?: string) => {
  if (amount > balance) return;

  const bet: Bet = {
    type: betType as any,
    amount,
    value,
    target: target as any,
  };

  setCurrentBet(bet);
  setIsRolling(true);
  
  if (rollTriggerRef.current) {
    rollTriggerRef.current();
  }
};

  const handleDiceSettled = (die1: number, die2: number) => {
    if (!currentBet) return;

    const result: DiceResult = { die1, die2, sum: die1 + die2 };
    setLastResult(result);

    const won = evaluateBet(currentBet, result);
    const multiplier = getBetMultiplier(currentBet.type);
    
    if (won) {

      const totalWinnings = currentBet.amount * multiplier;
      setWinAmount(totalWinnings);

      setBalance(prev => prev - currentBet.amount + totalWinnings);
    } else {
      setWinAmount(currentBet.amount);
      setBalance(prev => prev - currentBet.amount);
    }

    setLastWin(won);
    setShowResultModal(true);
    setIsRolling(false);
  };

  const evaluateBet = (bet: Bet, result: DiceResult): boolean => {
    switch (bet.type) {
      case 'even':
        return result.sum % 2 === 0;
      case 'odd':
        return result.sum % 2 !== 0;
      case 'specific-sum':
        return result.sum === bet.value;
      case 'specific-die':
        if (bet.target === 'die1') return result.die1 === bet.value;
        if (bet.target === 'die2') return result.die2 === bet.value;
        return false;
      case 'range':
        return result.sum >= 7 && result.sum <= 9;
      default:
        return false;
    }
  };

  const getBetMultiplier = (betType: string): number => {
    switch (betType) {
      case 'even':
      case 'odd':
        return 2;
      case 'range':
        return 3;
      case 'specific-die':
        return 6;
      case 'specific-sum':
        return 10;
      default:
        return 1;
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setCurrentBet(null);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)', width: '100%', background: '#0b0f1a', padding: '20px', overflow: 'hidden'}}>
      {/* Panel de apuestas a la izquierda */}
      <div style={{ flexShrink: 0 }}>
        <BettingPanel 
          balance={balance} 
          onPlaceBet={handlePlaceBet} 
          disabled={isRolling}
        />
      </div>

      {/* Canvas en el centro */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <DiceCanvas 
          rollTriggerRef={rollTriggerRef}
          resultsRef={resultsRef}
          onDiceSettled={handleDiceSettled}
          hasBet={!!currentBet}
        />
      </div>

      {/* Modal de resultados */}
      {showResultModal && lastResult && (
        <ResultModal
          won={lastWin}
          amount={winAmount}
          die1={lastResult.die1}
          die2={lastResult.die2}
          sum={lastResult.sum}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
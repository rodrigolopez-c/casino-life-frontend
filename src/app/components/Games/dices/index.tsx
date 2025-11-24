import React, { useState, useRef } from 'react';
import DiceCanvas from './DicesCanvas';
import BettingPanel from './BettingPanel';
import ResultModal from '../../shared/ResultModal';
import type { Bet, DiceResult } from '../../shared/types';
import { useBalance } from '../../../contexts/BalanceContext';
import { updateCoins } from '@/api/coins';

export default function DicesGame() {
  const { balance, setBalance } = useBalance();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const currentBetRef = useRef<Bet | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWin, setLastWin] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const rollTriggerRef = useRef<(() => void) | null>(null);
  const resultsRef = useRef<{ die1: number | null; die2: number | null }>({ die1: null, die2: null });

  // 🟡 Restar apuesta cuando el usuario apuesta
  const handlePlaceBet = (betType: string, amount: number, value?: number, target?: string) => {
    if (amount > balance || isRolling) return;

    const bet: Bet = {
      type: betType as any,
      amount,
      value,
      target: target as any,
    };

    setCurrentBet(bet);
    currentBetRef.current = bet;
    setIsRolling(true);

    // 🔥 Restar apuesta en el front inmediatamente
    setBalance(prev => prev - amount);

    setTimeout(() => {
      if (rollTriggerRef.current) {
        rollTriggerRef.current();
      }
    }, 50);
  };

  // 🎲 Los dados terminan de rodar
  const handleDiceSettled = async (die1: number, die2: number) => {
    const bet = currentBetRef.current;
    if (!bet) {
      setIsRolling(false);
      return;
    }

    const result: DiceResult = { die1, die2, sum: die1 + die2 };
    setLastResult(result);

    const won = evaluateBet(bet, result);
    const multiplier = getBetMultiplier(bet.type);

    // 💰 Ganancia total mostrada
    const totalWinnings = won ? bet.amount * (multiplier - 1) : 0;
    setWinAmount(won ? bet.amount * multiplier : bet.amount);

    // 🧮 Ganancia neta para enviar al backend
    const netAmount = won ? totalWinnings : -bet.amount;

    try {
      const response = await updateCoins("dices", won ? "win" : "lost", Math.abs(netAmount));
      setBalance(response.newBalance);
    } catch (err) {
      console.error("Error updating balance:", err);
    }

    setLastWin(won);
    setShowResultModal(true);
    setIsRolling(false);
  };

  const evaluateBet = (bet: Bet, result: DiceResult): boolean => {
    switch (bet.type) {
      case 'even': return result.sum % 2 === 0;
      case 'odd': return result.sum % 2 !== 0;
      case 'specific-sum': return result.sum === bet.value;
      case 'specific-die':
        if (bet.target === 'die1') return result.die1 === bet.value;
        if (bet.target === 'die2') return result.die2 === bet.value;
        return false;
      case 'range': return result.sum >= 7 && result.sum <= 9;
      default: return false;
    }
  };

  const getBetMultiplier = (betType: string): number => {
    switch (betType) {
      case 'even':
      case 'odd': return 2;
      case 'range': return 3;
      case 'specific-die': return 6;
      case 'specific-sum': return 10;
      default: return 1;
    }
  };

  const getBetMessage = (): string => {
    if (!currentBet) return "Seleccione una apuesta";
    let betName = "";
    switch (currentBet.type) {
      case 'even': betName = "Par (suma)"; break;
      case 'odd': betName = "Impar (suma)"; break;
      case 'specific-sum': betName = `Número específico (suma ${currentBet.value})`; break;
      case 'specific-die':
        betName = `Dado ${currentBet.target === 'die1' ? '1' : '2'} específico (${currentBet.value})`;
        break;
      case 'range': betName = "Suma 7-9"; break;
      default: betName = "Desconocida";
    }
    return `${betName} - $${currentBet.amount}`;
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setCurrentBet(null);
    currentBetRef.current = null;
    setIsRolling(false);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)', width: '100%', background: '#0b0f1a', padding: '20px', overflow: 'hidden'}}>
      <div style={{ flexShrink: 0 }}>
        <BettingPanel 
          balance={balance} 
          onPlaceBet={handlePlaceBet}
          disabled={isRolling || !gameStarted}
          isRolling={isRolling}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <DiceCanvas 
          rollTriggerRef={rollTriggerRef}
          resultsRef={resultsRef}
          onDiceSettled={handleDiceSettled}
          canBet={gameStarted}
          onGameStart={() => setGameStarted(true)}
          currentBetMessage={getBetMessage()}
        />
      </div>

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
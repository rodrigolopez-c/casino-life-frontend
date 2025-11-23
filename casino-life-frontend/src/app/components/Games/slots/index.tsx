import React, { useRef, useState } from 'react';
import SlotsCanvas from './SlotsCanvas';
import SlotsBettingPanel from './SlotsBettingPanel';
import ResultModal from '../../shared/ResultModal';
import { useBalance } from '../../../contexts/BalanceContext';
import { updateCoins } from '@/api/coins';
import type { SlotsResult } from './SlotsCanvas';
import './Slots.scss';

export default function SlotsGame() {
  const { balance, setBalance } = useBalance();
  const safeBalance = balance ?? 0;

  const [gameStarted, setGameStarted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const [currentBetAmount, setCurrentBetAmount] = useState<number>(10);
  const [lastBet, setLastBet] = useState<number>(10);

  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWin, setLastWin] = useState(false);
  const [lastPayout, setLastPayout] = useState(0);
  const [lastSymbols, setLastSymbols] = useState<string[] | null>(null);

  const spinTriggerRef = useRef<(() => void) | null>(null);

  const handlePlaceBet = (amount: number) => {
    if (amount > safeBalance) return;
    setCurrentBetAmount(amount);
  };

  const handleSpinEnd = async (result: SlotsResult) => {
    const bet = lastBet;
    const won = result.multiplier > 0;

    const grossWin = won ? bet * result.multiplier : 0;

    // actualizar balance real del jugador
    if (won) {
      setBalance(prev => (prev ?? 0) + grossWin);
    }

    setLastSymbols(result.symbols);
    setLastWin(won);
    setLastPayout(grossWin);
    setShowResultModal(true);
    setIsSpinning(false);

    try {
      await updateCoins(
        "slots",
        won ? "win" : "lost",
        won ? grossWin : -bet   // <— REGISTRO COHERENTE
      );
    } catch (err) {
      console.error("Error updating coins:", err);
    }
  };


  const handleCloseModal = () => {
    setShowResultModal(false);
    setLastSymbols(null);
  };

  const handleLeverPull = () => {
    const bet = currentBetAmount;

    if (safeBalance < bet) return;
    if (!spinTriggerRef.current) return;

    setLastBet(bet);

    // --- DESCONTAR SOLO UNA VEZ ---
    setBalance(prev => (prev ?? 0) - bet);

    setIsSpinning(true);
    spinTriggerRef.current();
  };

  return (
    <div className="slots-root">
      
      <div className="slots-left">
        <SlotsBettingPanel
          balance={safeBalance}
          onPlaceBet={handlePlaceBet}
          disabled={isSpinning || !gameStarted}
        />
      </div>

      <div className="slots-canvas-wrap">
        <SlotsCanvas
          spinTriggerRef={spinTriggerRef}
          onSpinEnd={handleSpinEnd}
          canPlay={gameStarted && safeBalance >= currentBetAmount}
          onGameStart={() => setGameStarted(true)}
          currentBetMessage={`Apuesta $${currentBetAmount}`}
          onLeverPull={handleLeverPull}
        />
      </div>

      {showResultModal && (
        <ResultModal
          won={lastWin}
          amount={lastWin ? lastPayout : lastBet}
          result={lastSymbols?.join(' — ') ?? ''}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

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

  // Cambiar apuesta
  const handlePlaceBet = (amount: number) => {
    if (amount > safeBalance) return;
    setCurrentBetAmount(amount);
  };

  // Fin del spin
  const handleSpinEnd = async (result: SlotsResult) => {
    const bet = lastBet;
    const won = result.multiplier > 0;
    const gross = won ? bet * result.multiplier : 0;

    setLastSymbols(result.symbols);
    setLastWin(won);
    setLastPayout(gross);
    setShowResultModal(true);
    setIsSpinning(false);

    try {
      const response = await updateCoins(
        "slots",
        won ? "win" : "lost",
        won ? gross : 0
      );
      setBalance(response.newBalance);
    } catch (err) {
      console.error("Error updating coins:", err);
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setLastSymbols(null);
  };

  // Cuando jala la palanca
  const handleLeverPull = () => {
    const bet = currentBetAmount;

    if (safeBalance < bet) {
      console.warn("No hay suficiente balance");
      return;
    }
    if (!spinTriggerRef.current) return;

    setLastBet(bet);

    // Descontar dinero
    setBalance(prev => (prev ?? 0) - bet);

    setIsSpinning(true);

    // Activar giro real
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

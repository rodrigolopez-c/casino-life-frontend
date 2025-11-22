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
  const [gameStarted, setGameStarted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentBetAmount, setCurrentBetAmount] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWin, setLastWin] = useState(false);
  const [lastPayout, setLastPayout] = useState(0);
  const [lastSymbols, setLastSymbols] = useState<string[] | null>(null);

  const spinTriggerRef = useRef<(() => void) | null>(null);

  const handlePlaceBet = (amount: number) => {
    // Solo actualiza la apuesta seleccionada
    if (amount > balance) return;
    setCurrentBetAmount(amount);
  };


  const handleSpinEnd = async (result: SlotsResult) => {
    const bet = currentBetAmount ?? 0;
    const won = result.multiplier > 0;
    const gross = won ? bet * result.multiplier : 0;

    // ✔ RESULTADO FINAL AQUÍ
    setLastSymbols(result.symbols);  

    setLastWin(won);
    setLastPayout(gross);
    setShowResultModal(true);
    setIsSpinning(false);

    try {
      const response = await updateCoins(
        "slots",
        won ? "win" : "lost",
        Math.abs(won ? gross - bet : -bet)
      );
      setBalance(response.newBalance);
    } catch (err) {
      console.error("Error updating coins:", err);
    }
  };

  const getBetMessage = () => `Apuesta $${currentBetAmount}`;

  const handleCloseModal = () => {
    setShowResultModal(false);
    setCurrentBetAmount(0);
    setLastSymbols(null);
  };

  const handleLeverPull = () => {
  const bet = currentBetAmount ?? 10; // default

  if (bet > balance) {
    console.warn("No hay suficiente balance");
    return;
  }

  if (!spinTriggerRef.current) return;

  // descontar apuesta
  setBalance(prev => prev - bet);

  // iniciar animación
  setIsSpinning(true);
  spinTriggerRef.current();
};

  return (
    <div className="slots-root">
      <div className="slots-left">
        <SlotsBettingPanel
        balance={balance}
        onPlaceBet={handlePlaceBet}
        disabled={isSpinning || !gameStarted}
        />
      </div>

      <div className="slots-canvas-wrap">
        <SlotsCanvas
          spinTriggerRef={spinTriggerRef}
          onSpinEnd={handleSpinEnd}
          canPlay={gameStarted}
          onGameStart={() => setGameStarted(true)}
          currentBetMessage={getBetMessage()}
          onLeverPull={handleLeverPull}
        />

      </div>

      {showResultModal && (
          <ResultModal
              won={lastWin}
              amount={lastPayout}
              result={lastSymbols?.join(' — ') ?? ''}
              onClose={handleCloseModal}
          />
      )}


    </div>
  );
}

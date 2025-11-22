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

  // Balance seguro siempre en número
  const safeBalance = balance ?? 0;

  const [gameStarted, setGameStarted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Apuesta actual
  const [currentBetAmount, setCurrentBetAmount] = useState<number>(10);

  // Última apuesta para mostrar en el modal
  const [lastBet, setLastBet] = useState<number>(10);

  // Resultados de la tirada
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

  // Cuando termina el spin
  const handleSpinEnd = async (result: SlotsResult) => {
  const bet = currentBetAmount;     // usar apuesta ACTUAL correcta
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
      won ? gross : -bet     // payout correcto
    );
    setBalance(response.newBalance);
  } catch (err) {
    console.error("Error updating coins:", err);
  }
};


  // Mensaje debajo de la máquina
  const getBetMessage = () => `Apuesta $${currentBetAmount}`;

  // Cerrar modal
  const handleCloseModal = () => {
    setShowResultModal(false);
    setLastSymbols(null);
  };

  // Cuando el usuario jala la palanca
  const handleLeverPull = () => {
    const bet = currentBetAmount;

    if (safeBalance <= 0 || bet > safeBalance) {
      console.warn("No hay suficiente balance");
      return;
    }

    if (!spinTriggerRef.current) return;

    // Guardamos la apuesta para mostrarla en el modal
    setLastBet(bet);

    // Descontamos la apuesta
    setBalance(prev => (prev ?? 0) - bet);

    // Inicia animación
    setIsSpinning(true);
    spinTriggerRef.current();
  };

  return (
    <div className="slots-root">
      
      <div className="slots-left">
        <SlotsBettingPanel
          balance={safeBalance}
          onPlaceBet={handlePlaceBet}
          disabled={isSpinning || !gameStarted || safeBalance < 10}
        />
      </div>

      <div className="slots-canvas-wrap">
        <SlotsCanvas
          spinTriggerRef={spinTriggerRef}
          onSpinEnd={handleSpinEnd}
          canPlay={gameStarted && safeBalance >= 10}
          onGameStart={() => setGameStarted(true)}
          currentBetMessage={getBetMessage()}
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

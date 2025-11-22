import React, { useState, useEffect } from 'react';
import './SlotsBettingPanel.scss';

interface SlotsBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number) => void;
  disabled: boolean; // se bloquea si está girando o si el juego no ha iniciado
}

const SlotsBettingPanel: React.FC<SlotsBettingPanelProps> = ({
  balance,
  onPlaceBet,
  disabled
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);

  const quicks = [10, 25, 50, 100];

  // Si el balance cambia y es menor a la apuesta actual, ajustamos automáticamente
  useEffect(() => {
    if (balance <= 0) {
      setBetAmount(0);
      onPlaceBet(0);
      return;
    }

    if (betAmount > balance) {
      const newBet = Math.min(10, balance);
      setBetAmount(newBet);
      onPlaceBet(newBet);
    }
  }, [balance]);

  const updateBet = (value: number) => {
    if (value > balance) return;

    setBetAmount(value);
    onPlaceBet(value);
  };

  const fullyDisabled = disabled || balance <= 0;

  return (
    <div className="slots-betting-panel">
      <div className="balance">
        <span className="label">Balance</span>
        <span className="amount">${balance}</span>
      </div>

      <div className="bet-amount">
        <div className="bet-display">${betAmount}</div>

        <div className="quick-amounts">
          {quicks.map(q => (
            <button
              key={q}
              className="quick-amount"
              onClick={() => updateBet(q)}
              disabled={q > balance || fullyDisabled}
            >
              ${q}
            </button>
          ))}
        </div>

        {balance <= 0 && (
          <div className="helper error">
            No tienes suficiente balance para apostar.
          </div>
        )}

        {balance > 0 && (
          <div className="helper">
            Selecciona cuánto quieres apostar y usa la palanca para girar
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotsBettingPanel;

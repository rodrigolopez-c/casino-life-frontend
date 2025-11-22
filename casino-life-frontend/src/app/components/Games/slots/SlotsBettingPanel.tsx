import React, { useState } from 'react';
import './SlotsBettingPanel.scss';

interface SlotsBettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number) => void;
  disabled: boolean;
}

const SlotsBettingPanel: React.FC<SlotsBettingPanelProps> = ({
  balance,
  onPlaceBet,
  disabled
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);

  const quicks = [10, 25, 50, 100];

  // Cuando cambia el monto, avisamos al padre inmediatamente
  const updateBet = (value: number) => {
    setBetAmount(value);
    onPlaceBet(value);
  };

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
              disabled={q > balance || disabled}
            >
              ${q}
            </button>
          ))}
        </div>

        <div className="helper">Selecciona cuánto quieres apostar y usa la palanca para girar</div>
      </div>
    </div>
  );
};

export default SlotsBettingPanel;

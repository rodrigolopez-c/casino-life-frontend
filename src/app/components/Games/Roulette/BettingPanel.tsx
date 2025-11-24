import React, { useState } from 'react';
import './BettingPanel.scss';

export interface RouletteBetOption {
    type: string;
    label: string;
    multiplier: number;
    requiresValue?: boolean;
    color?: 'red' | 'black' | 'green';
}

interface BettingPanelProps {
    balance: number;
    onPlaceBet: (betType: string, amount: number, value?: number) => void;
    disabled: boolean;
    isSpinning: boolean;
}

const BettingPanel: React.FC<BettingPanelProps> = ({ balance, onPlaceBet, disabled, isSpinning }) => {
    const [selectedBet, setSelectedBet] = useState<RouletteBetOption | null>(null);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [specificValue, setSpecificValue] = useState<number>(0);

    const betOptions: RouletteBetOption[] = [
        { type: 'red', label: '🔴 Rojo', multiplier: 2, color: 'red' },
        { type: 'black', label: '⚫ Negro', multiplier: 2, color: 'black' },
        { type: 'green', label: '🟢 Verde (0 o 00)', multiplier: 36, color: 'green' },
        { type: 'even', label: 'Par', multiplier: 2 },
        { type: 'odd', label: 'Impar', multiplier: 2 },
        { type: 'low', label: '1-18 (Bajo)', multiplier: 2 },
        { type: 'high', label: '19-36 (Alto)', multiplier: 2 },
        { type: 'dozen1', label: '1era Docena (1-12)', multiplier: 3 },
        { type: 'dozen2', label: '2da Docena (13-24)', multiplier: 3 },
        { type: 'dozen3', label: '3era Docena (25-36)', multiplier: 3 },
        { type: 'specific', label: 'Número Específico', multiplier: 36, requiresValue: true },
    ];

    const handlePlaceBet = () => {
        if (!selectedBet || betAmount <= 0 || betAmount > balance) return;
        
        let value = specificValue;
        if (selectedBet.requiresValue && specificValue === 0) {
            value = 1;
            setSpecificValue(value);
        }
        
        onPlaceBet(selectedBet.type, betAmount, selectedBet.requiresValue ? value : undefined);
    };

    return (
        <div className="betting-panel roulette-panel">
            <div className="balance">
                <span className="label">Balance:</span>
                <span className="amount">${balance}</span>
            </div>

            <div className="bet-options">
                <h3>Opciones de Apuesta</h3>
                {betOptions.map((option, idx) => (
                    <button
                        key={idx}
                        className={`bet-option ${selectedBet === option ? 'selected' : ''} ${option.color || ''}`}
                        onClick={() => setSelectedBet(option)}
                        disabled={disabled}
                    >
                        <span className="label">{option.label}</span>
                        <span className="multiplier">x{option.multiplier}</span>
                    </button>
                ))}
            </div>

            {selectedBet?.requiresValue && (
                <div className="specific-value">
                    <label>Número (0-36):</label>
                    <input
                        type="text"
                        value={specificValue === 0 ? '' : specificValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            
                            if (value === '') {
                                setSpecificValue(0);
                                return;
                            }
                            
                            if (/^\d+$/.test(value)) {
                                const num = Number(value);
                                if (num >= 0 && num <= 36) {
                                    setSpecificValue(num);
                                }
                            }
                        }}
                        onBlur={(e) => {
                            if (e.target.value === '' || Number(e.target.value) === 0) {
                                setSpecificValue(1);
                            }
                        }}
                        placeholder="0-36"
                        disabled={disabled}
                        style={{ textAlign: 'center' }}
                    />
                </div>
            )}

            <div className="bet-amount">
                <label>Monto de apuesta:</label>
                <input
                    type="text"
                    value={betAmount === 0 ? '' : betAmount}
                    onChange={(e) => {
                        const value = e.target.value;
                        
                        if (value === '') {
                            setBetAmount(0);
                            return;
                        }
                        
                        if (/^\d+$/.test(value)) {
                            const num = Number(value);
                            if (num <= balance) {
                                setBetAmount(num);
                            }
                        }
                    }}
                    onBlur={(e) => {
                        if (e.target.value === '' || Number(e.target.value) === 0) {
                            setBetAmount(10);
                        }
                    }}
                    placeholder="Monto"
                    disabled={disabled}
                    style={{ textAlign: 'center' }}
                />
                <div className="quick-amounts">
                    {[10, 25, 50, 100].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setBetAmount(amount)}
                            disabled={disabled || amount > balance}
                            className="quick-amount"
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="place-bet-btn"
                onClick={handlePlaceBet}
                disabled={
                    disabled || 
                    !selectedBet || 
                    betAmount === 0 || 
                    betAmount > balance ||
                    (selectedBet?.requiresValue && specificValue === 0)
                }
            >
                {isSpinning ? 'Girando...' : 'Girar Ruleta'}
            </button>
        </div>
    );
};

export default BettingPanel;
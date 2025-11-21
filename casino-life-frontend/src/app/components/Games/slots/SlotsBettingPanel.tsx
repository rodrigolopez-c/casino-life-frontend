import React, { useState } from 'react';
import './BettingPanel.scss';

export interface BetOption {
    type: string;
    label: string;
    multiplier: number;
    requiresValue?: boolean;
    target?: 'die1' | 'die2' | 'sum';
}

interface BettingPanelProps {
    balance: number;
    onPlaceBet: (betType: string, amount: number, value?: number, target?: string) => void;
    disabled: boolean;
    isRolling: boolean;
}

const BettingPanel: React.FC<BettingPanelProps> = ({ balance, onPlaceBet, disabled, isRolling }) => {
    const [selectedBet, setSelectedBet] = useState<BetOption | null>(null);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [specificValue, setSpecificValue] = useState<number>(0);

    const betOptions: BetOption[] = [
        { type: 'even', label: 'Par (suma)', multiplier: 2 },
        { type: 'odd', label: 'Impar (suma)', multiplier: 2 },
        { type: 'specific-sum', label: 'Número específico (suma)', multiplier: 10, requiresValue: true },
        { type: 'specific-die', label: 'Dado 1 específico', multiplier: 6, requiresValue: true, target: 'die1' },
        { type: 'specific-die', label: 'Dado 2 específico', multiplier: 6, requiresValue: true, target: 'die2' },
        { type: 'range', label: 'Suma 7-9', multiplier: 3 },
    ];

    const handlePlaceBet = () => {
        if (!selectedBet || betAmount <= 0 || betAmount > balance) return;
        
        let value = specificValue;
        if (selectedBet.requiresValue && specificValue === 0) {
            value = selectedBet.target ? 1 : 7;
            setSpecificValue(value);
        }
        
        onPlaceBet(selectedBet.type, betAmount, selectedBet.requiresValue ? value : undefined, selectedBet.target);
    };

    return (
        <div className="betting-panel">
        <div className="balance">
            <span className="label">Balance:</span>
            <span className="amount">${balance}</span>
        </div>

        <div className="bet-options">
            <h3>Opciones de Apuesta</h3>
            {betOptions.map((option, idx) => (
            <button
                key={idx}
                className={`bet-option ${selectedBet === option ? 'selected' : ''}`}
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
            <label>Número:</label>
            <input
            type="text"
            value={specificValue === 0 ? '' : specificValue}
            onChange={(e) => {
                const value = e.target.value;
                const min = selectedBet.target ? 1 : 2;
                const max = selectedBet.target ? 6 : 12;
                
                if (value === '') {
                setSpecificValue(0);
                return;
                }
                
                if (/^\d+$/.test(value)) {
                const num = Number(value);
                if (num >= min && num <= max) {
                    setSpecificValue(num);
                }
                }
            }}
            onBlur={(e) => {
                if (e.target.value === '' || Number(e.target.value) === 0) {
                setSpecificValue(selectedBet.target ? 1 : 7);
                }
            }}
            placeholder={`${selectedBet.target ? '1-6' : '2-12'}`}
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
            {isRolling ? 'Tirando...' : 'Realizar Apuesta'}
        </button>
        </div>
    );
};

export default BettingPanel;
import React, { useState } from 'react';
import './CoinBettingPanel.scss';

interface CoinBettingPanelProps {
    balance: number;
    onPlaceBet: (betType: 'heads' | 'tails', amount: number) => void;
    disabled: boolean;
    isFlipping: boolean;
}

const CoinBettingPanel: React.FC<CoinBettingPanelProps> = ({ balance, onPlaceBet, disabled, isFlipping }) => {
    // Lado seleccionado: 'heads' (cara) o 'tails' (cruz)
    const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
    
    // Monto a apostar
    const [betAmount, setBetAmount] = useState<number>(10);

    // Ejecuta la apuesta cuando se hace clic en "Realizar Apuesta"
    const handlePlaceBet = () => {
        if (!selectedSide || betAmount <= 0 || betAmount > balance) return;
        onPlaceBet(selectedSide, betAmount);
    };

    return (
        <div className="betting-panel coin-betting">
            <div className="balance">
                <span className="label">Balance:</span>
                <span className="amount">${balance}</span>
            </div>

            <div className="bet-options">
                <h3>Selecciona un lado</h3>
                
                {/* Botón Cara */}
                <button
                    className={`bet-option side-option ${selectedSide === 'heads' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('heads')}
                    disabled={disabled}
                >
                    <span className="side-icon">👑</span>
                    <span className="label">Cara</span>
                    <span className="multiplier">x2</span>
                </button>

                {/* Botón Cruz */}
                <button
                    className={`bet-option side-option ${selectedSide === 'tails' ? 'selected' : ''}`}
                    onClick={() => setSelectedSide('tails')}
                    disabled={disabled}
                >
                    <span className="side-icon">⚔️</span>
                    <span className="label">Cruz</span>
                    <span className="multiplier">x2</span>
                </button>
            </div>

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
                disabled={disabled || !selectedSide || betAmount === 0 || betAmount > balance}
            >
                {isFlipping ? 'Lanzando...' : 'Realizar Apuesta'}
            </button>
        </div>
    );
};

export default CoinBettingPanel;
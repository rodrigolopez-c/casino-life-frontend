import React from 'react';
import './ResultModal.scss';

interface ResultModalProps {
    won: boolean;
    amount: number;
    die1: number;
    die2: number;
    sum: number;
    onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ won, amount, die1, die2, sum, onClose }) => {
    return (
        <div className="result-modal-overlay" onClick={onClose}>
        <div className="result-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`result-content ${won ? 'win' : 'lose'}`}>
            <div className="result-icon">
                {won ? '🎉' : '😔'}
            </div>
            <h2>{won ? '¡Ganaste!' : 'Mejor suerte la próxima'}</h2>
            <div className="dice-results">
                <div className="die-result">
                <span className="die-label">Dado 1</span>
                <span className="die-value">{die1}</span>
                </div>
                <div className="die-result">
                <span className="die-label">Dado 2</span>
                <span className="die-value">{die2}</span>
                </div>
                <div className="die-result sum">
                <span className="die-label">Suma</span>
                <span className="die-value">{sum}</span>
                </div>
            </div>
            <div className={`amount ${won ? 'win-amount' : 'lose-amount'}`}>
                {won ? `+$${amount}` : `-$${amount}`}
            </div>
            <button className="close-btn" onClick={onClose}>
                Continuar
            </button>
            </div>
        </div>
        </div>
    );
};

export default ResultModal;
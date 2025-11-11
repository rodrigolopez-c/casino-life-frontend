import React from 'react';
import './ResultModal.scss';

interface ResultModalProps {
    won: boolean;
    amount: number;
    result: string; // "6 + 5 = 11" o "Cruz" o "Cara"
    onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ won, amount, result, onClose }) => {
    return (
        <div className="result-modal-overlay" onClick={onClose}>
            <div className="result-modal" onClick={(e) => e.stopPropagation()}>
                <div className={`result-content ${won ? 'win' : 'lose'}`}>
                    <div className="result-icon">
                        {won ? '🎉' : '😔'}
                    </div>
                    <h2>{won ? '¡Ganaste!' : 'Mejor suerte la próxima'}</h2>
                    <div className="game-result">
                        <span className="result-text">{result}</span>
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
import React from 'react';
import './ResultModal.scss';

interface ResultModalProps {
    won: boolean;
    amount: number;
    /**
     * Texto de resultado genérico (ej. "6 + 5 = 11").
     * Si no se proporciona pero se pasan die1/die2/sum, se construirá automáticamente.
     */
    result?: string;
    // Props opcionales para juegos de dados
    die1?: number;
    die2?: number;
    sum?: number;
    onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ won, amount, result, die1, die2, sum, onClose }) => {
    const computedResult =
        result ??
        (die1 != null && die2 != null && sum != null
            ? `${die1} + ${die2} = ${sum}`
            : "");

    return (
        <div className="result-modal-overlay" onClick={onClose}>
            <div className="result-modal" onClick={(e) => e.stopPropagation()}>
                <div className={`result-content ${won ? 'win' : 'lose'}`}>
                    <div className="result-icon">
                        {won ? '🎉' : '😔'}
                    </div>
                    <h2>{won ? '¡Ganaste!' : 'Mejor suerte la próxima'}</h2>
                    <div className="game-result">
                        <span className="result-text">{computedResult}</span>
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
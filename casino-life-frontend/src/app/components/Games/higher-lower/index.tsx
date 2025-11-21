import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Html, Loader } from '@react-three/drei';
import './styles.scss'; // Usaremos los mismos estilos base

import { useBalance } from '../../../contexts/BalanceContext';
import { type CardData } from '../blackjack/types';
import { getRandomCard, calculateMultipliers, getCardValue } from './logic';
import { Scene } from './scene';

const HigherLowerGame: React.FC = () => {
    const { balance, setBalance } = useBalance();

    const [bet, setBet] = useState(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentCard, setCurrentCard] = useState<CardData | null>(null);
    const [history, setHistory] = useState<CardData[]>([]);
    const [animKey, setAnimKey] = useState(0);
    
    // Estado de la racha
    const [winnings, setWinnings] = useState(0);
    const [msg, setMsg] = useState('¡Haz tu apuesta!');

    // Multiplicadores actuales
    const odds = currentCard ? calculateMultipliers(currentCard.value) : { higher: 0, lower: 0, probHigher:0, probLower:0 };

    const startGame = () => {
        if (bet > balance || bet <= 0) return;
        setBalance(b => b - bet);
        
        const firstCard = getRandomCard();
        setCurrentCard(firstCard);
        setHistory([]);
        setIsPlaying(true);
        setWinnings(bet); // Empezamos con nuestra apuesta viva
        setMsg('¿Mayor o Menor?');
        setAnimKey(k => k + 1);
    };

    const handleGuess = (guess: 'higher' | 'lower') => {
        if (!currentCard) return;

        const nextCard = getRandomCard();
        const currentVal = getCardValue(currentCard.value);
        const nextVal = getCardValue(nextCard.value);

        // Lógica de Ganar/Perder
        let won = false;
        if (guess === 'higher' && nextVal > currentVal) won = true;
        else if (guess === 'lower' && nextVal < currentVal) won = true;
        
        // Empate (Misma carta) = Pierdes en este modo simple
        // (Podrías agregar regla de "Push" si quieres)

        // Actualizar Historial
        setHistory(prev => [...prev, currentCard]);
        setCurrentCard(nextCard); // La nueva carta reemplaza a la anterior
        setAnimKey(k => k + 1);   // Dispara animación

        if (won) {
            const multiplier = guess === 'higher' ? odds.higher : odds.lower;
            const newWinnings = winnings * multiplier;
            setWinnings(newWinnings);
            setMsg(`¡Bien! ${nextVal === currentVal ? 'Empate (Salvado)' : 'Acertaste'}`);
        } else {
            gameOver(false);
        }
    };

    const cashOut = () => {
        setBalance(b => b + winnings);
        setMsg(`¡Retiraste $${winnings.toFixed(2)}!`);
        setIsPlaying(false);
        setCurrentCard(null);
    };

    const gameOver = (win: boolean) => {
        if (!win) setMsg('Fallaste. La casa gana.');
        setIsPlaying(false);
        setWinnings(0);
        // No borramos currentCard inmediatamente para que el usuario vea qué salió
    };

    return (
        <div className="blackjack-container"> {/* Reusamos contenedor */}
            <div className="sidebar">
                <h2 style={{color: '#fcd34d'}}>▲ HIGHER LOWER ▼</h2>
                <div className="balance-display">
                    <span className="label">Balance</span>
                    <span className="amount">${balance.toFixed(2)}</span>
                </div>

                {!isPlaying ? (
                    /* --- CONTROLES DE APUESTA INICIAL --- */
                    <div className="bet-controls">
                        <label>Apuesta Inicial:</label>
                        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} />
                        <div className="chips">
                            {[10, 25, 50, 100].map(val => <button key={val} onClick={() => setBet(val)}>${val}</button>)}
                        </div>
                        <button className="action-btn primary" onClick={startGame} disabled={balance < bet || bet <= 0}>
                            COMENZAR JUEGO
                        </button>
                    </div>
                ) : (
                    /* --- CONTROLES DE JUEGO (MAYOR / MENOR) --- */
                    <div className="bet-controls">
                        <div className="balance-display" style={{flexDirection:'column', gap:'5px', background:'#1f2937'}}>
                            <span style={{fontSize:'0.8rem', color:'#9ca3af'}}>ACUMULADO</span>
                            <span style={{fontSize:'1.5rem', color:'#34d399'}}>${winnings.toFixed(2)}</span>
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                            <button 
                                className="action-btn" 
                                style={{background: '#ef4444', flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}
                                onClick={() => handleGuess('lower')}
                                disabled={odds.lower <= 0}
                            >
                                <span>BAJAR ▼</span>
                                <span style={{fontSize:'0.8rem', opacity:0.8}}>x{odds.lower}</span>
                            </button>

                            <button 
                                className="action-btn" 
                                style={{background: '#3b82f6', flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}
                                onClick={() => handleGuess('higher')}
                                disabled={odds.higher <= 0}
                            >
                                <span>SUBIR ▲</span>
                                <span style={{fontSize:'0.8rem', opacity:0.8}}>x{odds.higher}</span>
                            </button>
                        </div>

                        <button className="action-btn" style={{background: '#10b981', marginTop:'15px'}} onClick={cashOut}>
                            RETIRARSE (Cobrar)
                        </button>
                    </div>
                )}
                <div className="info-footer"><p>El As vale 14. Empate pierde.</p></div>
            </div>

            <div className="game-area" style={{background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)'}}> 
                {/* Fondo Azul Oscuro/Morado para diferenciar del Blackjack */}
                
                <div className="overlay-msg" style={{top:'15%'}}>{msg}</div>

                <Canvas shadows camera={{ position: [0, 3, 6], fov: 45 }}>
                    <color attach="background" args={['#020617']} />
                    <Scene currentCard={currentCard} history={history} animKey={animKey} />
                </Canvas>
                <Loader />
            </div>
        </div>
    );
};

export default HigherLowerGame;
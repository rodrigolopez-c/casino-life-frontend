import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei'; 
import './styles.scss';

import { useBalance } from '../../../contexts/BalanceContext';
import { type CardData, type GameStatus } from './types';
import { createDeck, shuffleDeck, calculateScore } from './logic';
import { Card3D } from './Card3D';
import { TableDecor } from './TableDecor'; 
import { ChipsDecor } from './ChipsDecor';

const BlackjackGame: React.FC = () => {
    const { balance, setBalance } = useBalance();

    const [bet, setBet] = useState(10);
    const [deck, setDeck] = useState<CardData[]>([]);
    const [playerHand, setPlayerHand] = useState<CardData[]>([]);
    const [dealerHand, setDealerHand] = useState<CardData[]>([]);
    const [status, setStatus] = useState<GameStatus>('betting');
    const [msg, setMsg] = useState('');

    const startGame = () => {
        if (bet > balance || bet <= 0) return;
        setBalance(b => b - bet);
        setMsg('');
        const newDeck = shuffleDeck(createDeck());
        const pHand = [newDeck.pop()!, newDeck.pop()!];
        const dHand = [newDeck.pop()!, newDeck.pop()!];
        setPlayerHand(pHand);
        setDealerHand(dHand);
        setDeck(newDeck);
        if (calculateScore(pHand) === 21) endGame(pHand, dHand, true);
        else setStatus('playing');
    };

    const hit = async () => {
        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        setDeck(newDeck);
        if (calculateScore(newHand) > 21) {
            setMsg('¡Te pasaste!');
            setStatus('gameover');
        }
    };

    const stand = async () => {
        setStatus('resolving');
        let dHand = [...dealerHand];
        let dDeck = [...deck];
        await new Promise(r => setTimeout(r, 500));
        while (calculateScore(dHand) < 17) {
            dHand.push(dDeck.pop()!);
            setDealerHand([...dHand]); 
            await new Promise(r => setTimeout(r, 1000));
        }
        setDealerHand(dHand);
        setDeck(dDeck);
        endGame(playerHand, dHand, false);
    };

    const endGame = (pHand: CardData[], dHand: CardData[], natural: boolean) => {
        const pScore = calculateScore(pHand);
        const dScore = calculateScore(dHand);
        let win = 0;
        if (pScore > 21) { }
        else if (dScore > 21) { setMsg('Dealer se pasó. ¡Ganas!'); win = bet * 2; }
        else if (pScore > dScore) { setMsg('¡Ganaste!'); win = natural ? bet * 2.5 : bet * 2; }
        else if (pScore === dScore) { setMsg('Empate'); win = bet; }
        else { setMsg('La casa gana'); }
        if (win > 0) setBalance(b => b + win);
        setStatus('gameover');
    };

    // Loader nulo para evitar parpadeos
    const Loader = () => null;

    return (
        <div className="blackjack-container">
            <div className="sidebar">
                <h2>♠ Blackjack</h2>
                <div className="balance-display"><span className="label">Balance</span><span className="amount">${balance}</span></div>
                {(status === 'betting' || status === 'gameover') ? (
                    <div className="bet-controls">
                        <label>Apuesta:</label>
                        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} />
                        <div className="chips">{[10, 25, 50, 100].map(val => (<button key={val} onClick={() => setBet(val)}>${val}</button>))}</div>
                        <button className="action-btn primary" onClick={startGame} disabled={balance < bet || bet <= 0}>{status === 'gameover' ? 'Nueva Partida' : 'Repartir'}</button>
                    </div>
                ) : (
                    <div className="bet-controls">
                        <div className="balance-display" style={{justifyContent: 'center', background:'#374151', border:'none'}}><span style={{color:'white'}}>JUGANDO...</span></div>
                        <button className="action-btn hit" onClick={hit}>PEDIR CARTA</button>
                        <button className="action-btn stand" onClick={stand}>PLANTARSE</button>
                    </div>
                )}
                <div className="info-footer"><p>Blackjack paga 3 a 2</p></div>
            </div>

            <div className="game-area">
                {msg && <div className="overlay-msg">{msg}</div>}
                
                {/* CÁMARA: Usamos tu configuración */}
                <Canvas shadows camera={{ position: [0, 15, 1], rotation: [-1.45, 0, 0], fov: 40 }}>
                    
                    {/* 1. ELEMENTOS ESTÁTICOS (Fuera del Suspense) */}
                    <color attach="background" args={['#111827']} />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
                    <pointLight position={[-5, 10, -5]} intensity={0.5} />

                    {/* Mesa Verde */}
                    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <planeGeometry args={[50, 50]} />
                        <meshStandardMaterial color="#064e3b" roughness={0.6} />
                    </mesh>

                    {/* 2. ELEMENTOS QUE CARGAN (Dentro del Suspense) */}
                    <Suspense fallback={<Loader />}>
                        
                        <TableDecor />
                        <ChipsDecor />

                        {/* GRUPO DEALER (Posición -3 según tu código) */}
                        <group position={[0, 0, -3]}>
                            {dealerHand.length > 0 && (
                                <Text 
                                    position={[0, 0.1, -1.5]} 
                                    rotation={[-Math.PI/2, 0, 0]} 
                                    fontSize={0.6} 
                                    color="#e5e7eb"
                                    anchorX="center" 
                                    anchorY="middle"
                                >
                                    Dealer ({status === 'playing' ? '?' : calculateScore(dealerHand)})
                                </Text>
                            )}
                            {dealerHand.map((c, i) => (
                                <Card3D 
                                    key={`d-${i}`} suit={c.suit} value={c.value} 
                                    position={[i * 1.1 - ((dealerHand.length * 1.1) / 2) + 0.55, 0, 0]} 
                                    isHidden={i === 1 && status === 'playing'}
                                />
                            ))}
                        </group>

                        {/* GRUPO JUGADOR (Posición 1 según tu código) */}
                        <group position={[0, 0, 1]}>
                            {playerHand.length > 0 && (
                                <Text 
                                    position={[0, 0.1, 1.5]} 
                                    rotation={[-Math.PI/2, 0, 0]} 
                                    fontSize={0.6} 
                                    color="#4ade80"
                                    anchorX="center" 
                                    anchorY="middle"
                                >
                                    Tú ({calculateScore(playerHand)})
                                </Text>
                            )}
                            {playerHand.map((c, i) => (
                                <Card3D 
                                    key={`p-${i}`} suit={c.suit} value={c.value} 
                                    position={[i * 1.1 - ((playerHand.length * 1.1) / 2) + 0.55, 0, 0]} 
                                />
                            ))}
                        </group>
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
};

export default BlackjackGame;
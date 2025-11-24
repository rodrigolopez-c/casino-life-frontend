import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import "./styles.scss";

import { useBalance } from "../../../contexts/BalanceContext";
import { type CardData, type GameStatus } from "./types";
import { createDeck, shuffleDeck, calculateScore } from "./logic";
import { Card3D } from "./Card3D";
import { TableDecor } from "./TableDecor";
import { ChipsDecor } from "./ChipsDecor";

import ResultModal from "../../shared/ResultModal";
import type { DiceResult } from "../../shared/types";
import { updateCoins } from "@/api/coins";

const BlackjackGame: React.FC = () => {
  const { balance, setBalance } = useBalance();
  const [showIntro, setShowIntro] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [dealerHand, setDealerHand] = useState<CardData[]>([]);
  const [status, setStatus] = useState<GameStatus>("betting");
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalWon, setModalWon] = useState(false);
  const [modalAmount, setModalAmount] = useState(0);
  const [modalResultText, setModalResultText] = useState("");
  const [msg, setMsg] = useState("");

  const startGame = async () => {
    if (bet > balance || bet <= 0) return;
    await updateCoins("blackjack", "lost", bet); // se registra la apuesta (resta)
    setBalance((b) => b - bet);
    setMsg("");
    const newDeck = shuffleDeck(createDeck());
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(newDeck);
    if (calculateScore(pHand) === 21) endGame(pHand, dHand, true);
    else setStatus("playing");
  };

  const hit = async () => {
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (calculateScore(newHand) > 21) {
      setMsg("¡Te pasaste!");
      setStatus("gameover");

      setModalWon(false);
      setModalAmount(bet);
      setModalResultText("¡Te pasaste!");

      setTimeout(() => {
        setShowResultModal(true);
      }, 500);
    }
  };

  const stand = async () => {
    setStatus("resolving");
    const dHand = [...dealerHand];
    const dDeck = [...deck];
    await new Promise((r) => setTimeout(r, 500));
    while (calculateScore(dHand) < 17) {
      dHand.push(dDeck.pop()!);
      setDealerHand([...dHand]);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setDealerHand(dHand);
    setDeck(dDeck);
    endGame(playerHand, dHand, false);
  };

  const endGame = async (
    pHand: CardData[],
    dHand: CardData[],
    natural: boolean
  ) => {
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);

    let payout = 0; // lo que el jugador recibe
    let won = false;
    let resultText = "";

    if (pScore > 21) {
      resultText = "¡Te pasaste!";
      payout = 0; // no ganas nada
      won = false;
    } else if (dScore > 21) {
      resultText = "Dealer se pasó. ¡Ganas!";
      payout = bet * 2; // recuperas apuesta + ganas
      won = true;
    } else if (pScore > dScore) {
      resultText = "¡Ganaste!";
      payout = natural ? bet * 2.5 : bet * 2;
      won = true;
    } else if (pScore === dScore) {
      resultText = "Empate";
      payout = bet; // recuperas tu apuesta
      won = true;
    } else {
      resultText = "La casa gana";
      payout = 0;
      won = false;
    }

    // 🔥 Aquí se registra SOLO lo que recibe al final.
    // - Si perdió, amount = 0
    // - Si ganó, amount = payout
    // - Si empató → amount = bet (recupera)
    try {
      await updateCoins("blackjack", won ? "win" : "lost", payout);
    } catch (err) {
      console.error("Error actualizando balance:", err);
    }

    // 🔥 Y aquí actualizamos el front
    if (payout > 0) setBalance((b) => b + payout);

    setModalWon(won);
    setModalAmount(won ? payout : bet);
    setModalResultText(resultText);

    setStatus("gameover");
    setMsg(resultText);

    setTimeout(() => setShowResultModal(true), 500);
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  // Loader nulo para evitar parpadeos
  const Loader = () => null;

  return (
    <div className="blackjack-container">
      <div className="sidebar">
        <h2>♠ Blackjack</h2>
        <div className="balance-display">
          <span className="label">Balance</span>
          <span className="amount">${balance}</span>
        </div>
        {status === "betting" || status === "gameover" ? (
          <div className="bet-controls">
            <label>Apuesta:</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              disabled={!gameStarted}
            />
            <div className="chips">
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setBet(val)}
                  disabled={!gameStarted}
                >
                  ${val}
                </button>
              ))}
            </div>
            <button
              className="action-btn primary"
              onClick={startGame}
              disabled={balance < bet || bet <= 0 || !gameStarted}
            >
              {status === "gameover" ? "Nueva Partida" : "Repartir"}
            </button>
          </div>
        ) : (
          <div className="bet-controls">
            <div
              className="balance-display"
              style={{
                justifyContent: "center",
                background: "#374151",
                border: "none",
              }}
            >
              <span style={{ color: "white" }}>JUGANDO...</span>
            </div>
            <button
              className="action-btn hit"
              onClick={hit}
              disabled={!gameStarted}
            >
              PEDIR CARTA
            </button>
            <button
              className="action-btn stand"
              onClick={stand}
              disabled={!gameStarted}
            >
              PLANTARSE
            </button>
          </div>
        )}
        <div className="info-footer">
          <p>Blackjack paga 3 a 2</p>
        </div>
      </div>

      <div className="game-area">
        {/* Pantalla de introducción */}
        {!gameStarted && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111827",
              color: "#e9edf6",
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
              zIndex: 10,
            }}
          >
            <div
              style={{ textAlign: "center", maxWidth: 520, padding: "24px" }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>♠️ ♥️ ♦️ ♣️</div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                Blackjack
              </div>
              <div
                style={{
                  fontSize: 18,
                  opacity: 0.85,
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Acércate a 21 sin pasarte. ¡Blackjack paga 3 a 2!
              </div>
              <button
                onClick={() => setGameStarted(true)}
                style={{
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  backdropFilter: "blur(6px)",
                  fontSize: 16,
                }}
              >
                Comenzar
              </button>
              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
                Consejo: El dealer se planta en 17. ¡Buena suerte!
              </div>
            </div>
          </div>
        )}

        {msg && <div className="overlay-msg">{msg}</div>}

        {/* CÁMARA: Usamos tu configuración */}
        <Canvas
          shadows
          camera={{ position: [0, 15, 1], rotation: [-1.45, 0, 0], fov: 40 }}
        >
          {/* 1. ELEMENTOS ESTÁTICOS (Fuera del Suspense) */}
          <color attach="background" args={["#111827"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-5, 10, -5]} intensity={0.5} />

          {/* Mesa Verde */}
          <mesh
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.1, 0]}
          >
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
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={0.6}
                  color="#e5e7eb"
                  anchorX="center"
                  anchorY="middle"
                >
                  Dealer (
                  {status === "playing" ? "?" : calculateScore(dealerHand)})
                </Text>
              )}
              {dealerHand.map((c, i) => (
                <Card3D
                  key={`d-${i}`}
                  suit={c.suit}
                  value={c.value}
                  position={[
                    i * 1.1 - (dealerHand.length * 1.1) / 2 + 0.55,
                    0,
                    0,
                  ]}
                  isHidden={i === 1 && status === "playing"}
                />
              ))}
            </group>

            {/* GRUPO JUGADOR (Posición 1 según tu código) */}
            <group position={[0, 0, 1]}>
              {playerHand.length > 0 && (
                <Text
                  position={[0, 0.1, 1.5]}
                  rotation={[-Math.PI / 2, 0, 0]}
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
                  key={`p-${i}`}
                  suit={c.suit}
                  value={c.value}
                  position={[
                    i * 1.1 - (playerHand.length * 1.1) / 2 + 0.55,
                    0,
                    0,
                  ]}
                />
              ))}
            </group>
          </Suspense>
        </Canvas>

        {/* Modal de resultado */}
        {showResultModal && (
          <ResultModal
            won={modalWon}
            amount={modalAmount}
            result={modalResultText}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};
export default BlackjackGame;

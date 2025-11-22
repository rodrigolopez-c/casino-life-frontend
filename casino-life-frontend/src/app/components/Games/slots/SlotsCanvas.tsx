// SlotsCanvas.tsx
import React, { useEffect, useRef, useState } from 'react';
import './Slots.scss';

export interface SlotsResult {
  symbols: string[];
  multiplier: number;
}

interface SlotsCanvasProps {
  spinTriggerRef: React.MutableRefObject<(() => void) | null>;
  onSpinEnd: (result: SlotsResult) => void;
  canPlay: boolean;
  onGameStart: () => void;
  currentBetMessage: string;
  onLeverPull: () => void; // <-- agregado: la palanca llamará al padre
}

const SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '7️⃣', '🍊'];

const Reel: React.FC<{ value: string; highlight: boolean }> = ({ value, highlight }) => {
  return (
    <div className={`reel ${highlight ? 'reel-highlight' : ''}`}>
      <div className="slot-cell">{value}</div>
    </div>
  );
};

const SlotsCanvas: React.FC<SlotsCanvasProps> = ({
  spinTriggerRef,
  onSpinEnd,
  canPlay,
  onGameStart,
  currentBetMessage,
  onLeverPull
}) => {
  const [phase, setPhase] = useState<'intro' | 'machine'>('intro');

  const [reelValues, setReelValues] = useState<string[]>([
    SYMBOLS[0],
    SYMBOLS[1],
    SYMBOLS[2],
  ]);

  const [highlight, setHighlight] = useState([false, false, false]);

  const spinningRef = useRef(false);
  const reelsInterval = useRef<Array<number | null>>([null, null, null]);

  // Exponer spin() al padre a través del ref
  useEffect(() => {
    spinTriggerRef.current = () => {
      if (spinningRef.current) return;
      spin();
    };
    return () => {
      spinTriggerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      reelsInterval.current.forEach(id => id && window.clearInterval(id));
    };
  }, []);

  const spin = () => {
    if (!canPlay) return;

    spinningRef.current = true;
    setHighlight([false, false, false]);

    const localValues = [...reelValues];

    // Girar 3 reels
    for (let i = 0; i < 3; i++) {
      reelsInterval.current[i] = window.setInterval(() => {
        localValues[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        setReelValues([...localValues]);
      }, 65);
    }

    const stopDelays = [1200, 1700, 2200];
    const finalResult: string[] = [];

    stopDelays.forEach((delay, idx) => {
      setTimeout(() => {
        const id = reelsInterval.current[idx];
        if (id) {
          window.clearInterval(id);
          reelsInterval.current[idx] = null;
        }

        // símbolo final mostrado (último que quedó en la animación)
        const finalSym = localValues[idx];
        finalResult[idx] = finalSym;

        setReelValues(prev => {
          const copy = [...prev];
          copy[idx] = finalSym;
          return copy;
        });

        // destacar reel detenido
        setHighlight(prev => {
          const copy = [...prev];
          copy[idx] = true;
          return copy;
        });

        // último reel → terminar
        if (idx === 2) {
          spinningRef.current = false;
          const multiplier = evaluatePayout(finalResult);
          setTimeout(() => {
            onSpinEnd({ symbols: finalResult, multiplier });
          }, 300);
        }
      }, delay);
    });
  };

  const evaluatePayout = (symbols: string[]): number => {
    const [a, b, c] = symbols;

    if (a === b && b === c) {
      return a === '7️⃣' ? 50 : 10;
    }

    if (a === b || b === c || a === c) return 2;

    return 0;
  };

  return (
    <div className="slots-container">
      {phase === 'intro' && (
        <div className="slots-intro">
          <div className="intro-icon">🎰</div>
          <div className="intro-title">Slots Machine</div>
          <div className="intro-subtitle">Tres rodillos — efectos brillantes — buena suerte 🍀</div>

          <button
            className="intro-btn"
            onClick={() => {
              setPhase('machine');
              onGameStart();
            }}
          >
            Comenzar
          </button>
        </div>
      )}

      {phase === 'machine' && (
        <div className="slot-machine">
          {/* Marco */}
          <div className="machine-frame">
            <div className="reels">
              <Reel value={reelValues[0]} highlight={highlight[0]} />
              <Reel value={reelValues[1]} highlight={highlight[1]} />
              <Reel value={reelValues[2]} highlight={highlight[2]} />
            </div>
            <div className="payline" />
          </div>

          {/* Palanca — ahora llama al padre para gestionar la apuesta y el spin */}
          <div
            className={`lever ${spinningRef.current ? 'lever-pulled' : ''}`}
            onClick={() => {
              // sólo delegamos la acción al padre (maneja descuento y luego dispara el ref)
              if (!spinningRef.current) onLeverPull();
            }}
          >
            <div className="lever-top"></div>
            <div className="lever-stick"></div>
          </div>

          {/* Bet message */}
          <div className="bet-info">{currentBetMessage}</div>
        </div>
      )}
    </div>
  );
};

export default SlotsCanvas;

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
  onLeverPull: () => void;
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

  // ref que siempre apunta a la última implementación de `spin`
  const spinRef = useRef<() => void>(() => {});

  // función actual de spin (se redefine cada render)
  const spin = () => {
    if (!canPlay || spinningRef.current) return;

    spinningRef.current = true;
    setHighlight([false, false, false]);

    const local = [...reelValues];

    for (let i = 0; i < 3; i++) {
      reelsInterval.current[i] = window.setInterval(() => {
        local[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        setReelValues([...local]);
      }, 65);
    }

    const delays = [1200, 1700, 2200];
    const final: string[] = [];

    delays.forEach((delay, idx) => {
      setTimeout(() => {
        const id = reelsInterval.current[idx];
        if (id) {
          clearInterval(id);
          reelsInterval.current[idx] = null;
        }

        const last = local[idx];
        final[idx] = last;

        setReelValues(prev => {
          const copy = [...prev];
          copy[idx] = last;
          return copy;
        });

        setHighlight(h => {
          const c = [...h];
          c[idx] = true;
          return c;
        });

        if (idx === 2) {
          // terminado
          spinningRef.current = false;
          const multiplier = evaluatePayout(final);

          // pequeña espera para UX
          setTimeout(() => {
            onSpinEnd({ symbols: final, multiplier });
          }, 300);
        }
      }, delay);
    });
  };

  // siempre mantener spinRef actualizado a la última función spin
  useEffect(() => {
    spinRef.current = spin;
  }, [spin, canPlay, reelValues]);

  // Exponer una función estable en spinTriggerRef que llame a la versión actualada
  useEffect(() => {
    spinTriggerRef.current = () => {
      // invoca la implementación de spin más reciente
      if (spinRef.current) spinRef.current();
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

  const evaluatePayout = (symbols: string[]): number => {
    const [a, b, c] = symbols;
    if (a === b && b === c) return a === '7️⃣' ? 50 : 10;
    if (a === b || b === c || a === c) return 2;
    return 0;
  };

  return (
    <div className="slots-container">
      {phase === 'intro' && (
        <div className="slots-intro">
          <div className="intro-icon">🎰</div>
          <div className="intro-title">Slots Machine</div>

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
          <div className="machine-frame">
            <div className="reels">
              <Reel value={reelValues[0]} highlight={highlight[0]} />
              <Reel value={reelValues[1]} highlight={highlight[1]} />
              <Reel value={reelValues[2]} highlight={highlight[2]} />
            </div>
            <div className="payline" />
          </div>

          {/* Palanca */}
          <div
            className={`lever ${spinningRef.current ? 'lever-pulled' : ''}`}
            onClick={() => {
              if (!spinningRef.current) onLeverPull();
            }}
          >
            <div className="lever-top"></div>
            <div className="lever-stick"></div>
          </div>

          <div className="bet-info">{currentBetMessage}</div>
        </div>
      )}
    </div>
  );
};

export default SlotsCanvas;

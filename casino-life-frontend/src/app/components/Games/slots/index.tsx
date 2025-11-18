import React, { useEffect, useRef, useState } from 'react';
import './SlotsGame.scss';
import { useBalance } from '../../../contexts/BalanceContext';

type SymbolKey = 'cherry' | 'lemon' | 'seven' | 'bar' | 'diamond' | 'bell';

const SYMBOLS: { key: SymbolKey; label: string; payoutWeight: number }[] = [
  { key: 'cherry', label: '🍒', payoutWeight: 25 },
  { key: 'lemon', label: '🍋', payoutWeight: 20 },
  { key: 'seven', label: '7️⃣', payoutWeight: 6 },
  { key: 'bar', label: '🔲', payoutWeight: 12 },
  { key: 'diamond', label: '💎', payoutWeight: 4 },
  { key: 'bell', label: '🔔', payoutWeight: 8 },
];

function weightedRandomSymbol(): SymbolKey {
  const total = SYMBOLS.reduce((s, x) => s + x.payoutWeight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const s of SYMBOLS) {
    acc += s.payoutWeight;
    if (r <= acc) return s.key;
  }
  return SYMBOLS[0].key;
}

// multipliers (example, tweak to taste)
const PAYTABLE: Record<string, number> = {
  // three of a kind
  'three_cherry': 15,
  'three_lemon': 10,
  'three_seven': 100,
  'three_bar': 25,
  'three_diamond': 200,
  'three_bell': 30,
  // two of a kind (any)
  'two_any': 2,
  // single seven (small bonus)
  'one_seven': 1.2,
};

export default function SlotsGame() {
  const { balance, setBalance } = useBalance();

  const [bet, setBet] = useState<number>(10);
  const [reels, setReels] = useState<SymbolKey[]>(['cherry', 'cherry', 'cherry']);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Buena suerte!');
  const [lastWin, setLastWin] = useState<number | null>(null);

  // internal refs to manage intervals
  const intervalsRef = useRef<Array<number | null>>([null, null, null]);

  useEffect(() => {
    return () => {
      // cleanup
      intervalsRef.current.forEach((id) => { if (id) window.clearInterval(id as number); });
    };
  }, []);

  const canSpin = () => !spinning && bet > 0 && bet <= balance;

  const startSpin = () => {
    if (!canSpin()) return;

    setLastWin(null);
    setSpinning(true);
    setMessage('Girando...');

    // take the bet immediately
    setBalance((b) => b - bet);

    // for each reel create a fast interval that changes symbols visually
    for (let r = 0; r < 3; r++) {
      const id = window.setInterval(() => {
        setReels((old) => {
          const copy = [...old];
          copy[r] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].key;
          return copy;
        });
      }, 60 + r * 15);
      intervalsRef.current[r] = id;
    }

    // stop reels sequentially with increasing delay
    const stops = [800, 1250, 1650];
    stops.forEach((stopMs, idx) => {
      setTimeout(() => {
        // pick a weighted random final symbol
        const finalSymbol = weightedRandomSymbol();
        // clear interval and set final value
        const id = intervalsRef.current[idx];
        if (id) {
          window.clearInterval(id as number);
          intervalsRef.current[idx] = null;
        }
        setReels((old) => {
          const copy = [...old];
          copy[idx] = finalSymbol;
          return copy;
        });

        // if last reel, evaluate outcome
        if (idx === 2) {
          setTimeout(() => finishSpin(), 220);
        }
      }, stopMs + Math.random() * 120);
    });
  };

  const finishSpin = () => {
    setSpinning(false);
    const [a, b, c] = reels;

    // calculate payout
    let won = false;
    let multiplier = 0;

    if (a === b && b === c) {
      // three of a kind
      multiplier = PAYTABLE[`three_${a}`] ?? 5;
      won = true;
    } else if (a === b || b === c || a === c) {
      multiplier = PAYTABLE['two_any'];
      won = true;
    } else if (a === 'seven' || b === 'seven' || c === 'seven') {
      multiplier = PAYTABLE['one_seven'];
      // treat as small win (returns fraction of bet)
      won = true;
    }

    if (won && multiplier > 0) {
      // round payout
      const payout = Math.floor(bet * multiplier);
      setBalance((b) => b + payout);
      setLastWin(payout);
      setMessage(`Ganaste $${payout} (x${multiplier})`);
    } else {
      setLastWin(0);
      setMessage('Perdiste, intentá de nuevo');
    }
  };

  const quickBets = [5, 10, 25, 50, 100];

  return (
    <div className="slots-game">
      <div className="left-panel">
        <div className="title">Slots — Casino Life</div>

        <div className="balance">Balance: <strong>${balance}</strong></div>

        <div className="bet-controls">
          <label>Monto de apuesta</label>
          <div className="bet-input">
            <input
              type="number"
              min={1}
              value={bet}
              onChange={(e) => setBet(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              disabled={spinning}
            />
            <div className="quick">
              {quickBets.map((q) => (
                <button key={q} onClick={() => setBet(q)} disabled={spinning || q > balance}>${q}</button>
              ))}
            </div>
          </div>

          <div className="controls-row">
            <button className="spin-btn" onClick={startSpin} disabled={!canSpin()}>
              {spinning ? 'Girando...' : 'Girar'}
            </button>
            <button className="max-btn" onClick={() => setBet(Math.min(balance, 100))} disabled={spinning}>Max</button>
          </div>

          <div className="paytable">
            <div className="pt-title">Tabla de pagos</div>
            <ul>
              <li>3x 💎 (diamante) — x{PAYTABLE['three_diamond']}</li>
              <li>3x 7️⃣ (siete) — x{PAYTABLE['three_seven']}</li>
              <li>3x 🔲 (bar) — x{PAYTABLE['three_bar']}</li>
              <li>3 iguales — según símbolo</li>
              <li>2 iguales — x{PAYTABLE['two_any']}</li>
            </ul>
          </div>

          <div className="message">{message}</div>
          {lastWin !== null && (
            <div className={`last-win ${lastWin > 0 ? 'win' : 'lose'}`}>
              {lastWin > 0 ? `Ganaste $${lastWin}` : `Perdiste $${bet}`}
            </div>
          )}
        </div>
      </div>

      <div className="reels-panel">
        <div className={`reels ${spinning ? 'spinning' : ''}`}>
          {reels.map((s, i) => (
            <div key={i} className={`reel reel-${i}`} aria-hidden>
              <div className="symbol">{SYMBOLS.find(x => x.key === s)?.label}</div>
            </div>
          ))}
        </div>

        <div className="payline" />
      </div>
    </div>
  );
}
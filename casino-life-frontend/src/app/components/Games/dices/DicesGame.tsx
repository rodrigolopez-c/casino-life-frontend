import React, { useState, useRef } from 'react';
import DiceCanvas from './DicesCanvas';
import BettingPanel from './BettingPanel';
import ResultModal from './ResultModal';
import type { Bet, DiceResult } from './types';
import { useBalance } from '../../../contexts/BalanceContext';

export default function DicesGame() {
  const { balance, setBalance } = useBalance();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const currentBetRef = useRef<Bet | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastWin, setLastWin] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const rollTriggerRef = useRef<(() => void) | null>(null);
  const resultsRef = useRef<{ die1: number | null; die2: number | null }>({ die1: null, die2: null });

  // Cuando el usuario hace clic en "Realizar Apuesta"
  const handlePlaceBet = (betType: string, amount: number, value?: number, target?: string) => {
    // Verifica que tenga suficiente balance y que no haya un tiro en curso
    if (amount > balance || isRolling) return;
    
    // Crea el objeto de apuesta con todos los datos
    const bet: Bet = {
      type: betType as any,
      amount,
      value,
      target: target as any,
    };

    // Guarda la apuesta en el estado y en la referencia
    setCurrentBet(bet);
    currentBetRef.current = bet;
    setIsRolling(true);
    
    setTimeout(() => {
      if (rollTriggerRef.current) {
        rollTriggerRef.current();
      }
    }, 50);
  };

  // Los dados terminan de rodar y se obtienen los resultados
  const handleDiceSettled = (die1: number, die2: number) => {
    // Obtiene la apuesta desde la referencia
    const bet = currentBetRef.current;
    
    // Si no hay apuesta, libera el estado de "rodando" y sale
    if (!bet) {
      setIsRolling(false);
      return;
    }

    // Crea el objeto de resultado con los valores de ambos dados y su suma
    const result: DiceResult = { die1, die2, sum: die1 + die2 };
    setLastResult(result);

    // Verifica si la apuesta fue ganadora
    const won = evaluateBet(bet, result);
    
    // Obtiene el multiplicador según el tipo de apuesta
    const multiplier = getBetMultiplier(bet.type);
    
    // Calcula las ganancias o pérdidas
    if (won) {
      // Si gana: calcula el premio total (apuesta × multiplicador)
      const totalWinnings = bet.amount * multiplier;
      setWinAmount(totalWinnings);
      // Resta la apuesta original y suma el premio
      setBalance(prev => prev - bet.amount + totalWinnings);
    } else {
      // Si pierde: solo muestra la cantidad perdida
      setWinAmount(bet.amount);
      // Resta la apuesta del balance
      setBalance(prev => prev - bet.amount);
    }

    // Guarda si ganó o perdió y muestra el modal
    setLastWin(won);
    setShowResultModal(true);
    setIsRolling(false);
  };

  // Verifica si una apuesta es ganadora según el resultado de los dados
  const evaluateBet = (bet: Bet, result: DiceResult): boolean => {
    switch (bet.type) {
      case 'even':// Gana si la suma es par
        return result.sum % 2 === 0;
      case 'odd':// Gana si la suma es impar
        return result.sum % 2 !== 0;
      case 'specific-sum':// Gana si la suma coincide con el número apostado
        return result.sum === bet.value;
      case 'specific-die':// Gana si el dado específico muestra el número apostado
        if (bet.target === 'die1') return result.die1 === bet.value;
        if (bet.target === 'die2') return result.die2 === bet.value;
        return false;
      case 'range':// Gana si la suma está entre 7 y 9
        return result.sum >= 7 && result.sum <= 9;
      default:
        return false;
    }
  };

  // Devuelve el multiplicador de ganancias según el tipo de apuesta
  const getBetMultiplier = (betType: string): number => {
    switch (betType) {
      case 'even':
      case 'odd':
        return 2; // Par o Impar paga x2
      case 'range':
        return 3; // Suma 7-9 paga x3
      case 'specific-die':
        return 6; // Dado específico paga x6
      case 'specific-sum':
        return 10; // Suma específica paga x10
      default:
        return 1;
    }
  };

  // Genera el mensaje que se muestra en pantalla con la apuesta actual
  const getBetMessage = (): string => {
    if (!currentBet) return "Seleccione una apuesta";
    
    let betName = "";
    switch (currentBet.type) {
      case 'even':
        betName = "Par (suma)";
        break;
      case 'odd':
        betName = "Impar (suma)";
        break;
      case 'specific-sum':
        betName = `Número específico (suma ${currentBet.value})`;
        break;
      case 'specific-die':
        betName = `Dado ${currentBet.target === 'die1' ? '1' : '2'} específico (${currentBet.value})`;
        break;
      case 'range':
        betName = "Suma 7-9";
        break;
      default:
        betName = "Desconocida";
    }
    
    return `${betName} - $${currentBet.amount}`;
  };

  // Se ejecuta cuando se cierra el modal de resultados
  const handleCloseModal = () => {
    setShowResultModal(false);
    setCurrentBet(null);
    currentBetRef.current = null;
    setIsRolling(false);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 40px)', width: '100%', background: '#0b0f1a', padding: '20px', overflow: 'hidden'}}>
      {/* Panel izquierdo: opciones de apuestas */}
      <div style={{ flexShrink: 0 }}>
        <BettingPanel 
          balance={balance} 
          onPlaceBet={handlePlaceBet}
          disabled={isRolling || !gameStarted}
          isRolling={isRolling}
        />
      </div>

      {/* Centro: canvas 3D con los dados */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <DiceCanvas 
          rollTriggerRef={rollTriggerRef}
          resultsRef={resultsRef}
          onDiceSettled={handleDiceSettled}
          canBet={gameStarted}
          onGameStart={() => setGameStarted(true)}
          currentBetMessage={getBetMessage()}
        />
      </div>

      {/* Modal que muestra el resultado (ganaste/perdiste) */}
      {showResultModal && lastResult && (
        <ResultModal
          won={lastWin}
          amount={winAmount}
          die1={lastResult.die1}
          die2={lastResult.die2}
          sum={lastResult.sum}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
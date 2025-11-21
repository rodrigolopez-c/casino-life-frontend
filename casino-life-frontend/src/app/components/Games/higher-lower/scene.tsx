import React from 'react';
import { Environment, Float, Text } from '@react-three/drei';
import { Card3D } from '../blackjack/Card3D';
import { type CardData } from '../blackjack/types';

// --- DEFINICIÓN LOCAL DE FICHAS (Para control total) ---
const Chip: React.FC<{ position: [number, number, number], color: string }> = ({ position, color }) => (
    <mesh position={position} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.052, 32]} />
            <meshStandardMaterial color="white" opacity={0.2} transparent />
        </mesh>
    </mesh>
);

const ChipStack: React.FC<{ position: [number, number, number], color: string, count: number }> = ({ position, color, count }) => (
    <group position={position}>
        {Array.from({ length: count }).map((_, i) => (
            <Chip key={i} position={[0, i * 0.055, 0]} color={color} />
        ))}
    </group>
);

interface SceneProps {
    currentCard: CardData | null;
    history: CardData[];
    animKey: number;
}

export const Scene: React.FC<SceneProps> = ({ currentCard, history, animKey }) => {
    return (
        <>
            {/* ILUMINACIÓN */}
            <Environment preset="city" />
            <ambientLight intensity={0.7} />
            <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-5, 5, 5]} intensity={1} color="#6366f1" />
            <pointLight position={[5, 5, 5]} intensity={1} color="#ef4444" />

            {/* MESA Y ANILLO */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <circleGeometry args={[7, 64]} />
                <meshStandardMaterial color="#111827" roughness={0.2} metalness={0.5} />
            </mesh>
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
                <ringGeometry args={[2.2, 2.4, 64]} /> 
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} toneMapped={false} />
            </mesh>

            {/* --- CARTA ACTUAL --- */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
                <group position={[0, 0.5, 0]}>
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        {currentCard ? (
                            <Card3D 
                                key={`current-${animKey}`} 
                                suit={currentCard.suit} 
                                value={currentCard.value} 
                                position={[0, 0, 0]} 
                            />
                        ) : (
                            <Card3D suit="spades" value="A" position={[0, 0, 0]} isHidden={true} />
                        )}
                    </group>
                </group>
            </Float>

            {/* --- HISTORIAL (TEXTO CORREGIDO) --- */}
            <group position={[-3.5, -0.5, 0]}> 
                {history.slice(-5).map((c, i) => (
                    <group key={`hist-${i}`} position={[-i * 0.3, 0, i * 0.2]} rotation={[0, 0.4, 0]}>
                         <Card3D suit={c.suit} value={c.value} position={[0, 0, 0]} />
                    </group>
                ))}
                {history.length > 0 && (
                    // TEXTO: Más brillante, mejor posicionado y con outline para leerse bien
                    <Text 
                        position={[0.25, 1.1, 0]} // Más arriba para no chocar con las cartas
                        rotation={[0, 0.4, 0]} 
                        fontSize={0.30} 
                        color="#ffffff" 
                        anchorX="center"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                    >
                        ANTERIORES
                    </Text>
                )}
            </group>

            {/* --- FICHAS (NUEVAS POSICIONES MANUALES) --- */}
            {/* Las colocamos manualmente respecto al centro de ESTA mesa */}
            <group position={[0, -1, 0]}> {/* Grupo base en el suelo */}
                {/* Pila Roja: A la derecha del anillo */}
                <ChipStack position={[2.8, 0, 1.5]} color="#ef4444" count={5} />
                {/* Pila Azul: Un poco más atrás */}
                <ChipStack position={[3.2, 0, 0.8]} color="#3b82f6" count={3} />
                {/* Pila Negra: Cerca de la roja */}
                <ChipStack position={[2.4, 0, 2.0]} color="#1f2937" count={4} />
            </group>
        </>
    );
};
import React from 'react';

// Un cilindro simple que parece una ficha
const Chip: React.FC<{ position: [number, number, number], color: string }> = ({ position, color }) => (
    <mesh position={position} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        {/* Borde blanco de la ficha (detalle extra) */}
        <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.052, 32]} />
            <meshStandardMaterial color="white" opacity={0.2} transparent />
        </mesh>
    </mesh>
);

// Una pila de fichas
const ChipStack: React.FC<{ position: [number, number, number], color: string, count: number }> = ({ position, color, count }) => {
    return (
        <group position={position}>
            {Array.from({ length: count }).map((_, i) => (
                <Chip 
                    key={i} 
                    position={[0, i * 0.055, 0]} // Las apilamos en Y
                    color={color} 
                />
            ))}
        </group>
    );
};

export const ChipsDecor: React.FC = () => {
    return (
        <group>
            {/* Pila Roja (Jugador) */}
            <ChipStack position={[3, 0, 2]} color="#ef4444" count={5} />
            
            {/* Pila Azul (Jugador) */}
            <ChipStack position={[3.5, 0, 2.2]} color="#3b82f6" count={3} />
            
            {/* Pila Negra (Casa - cerca del mazo) */}
            <ChipStack position={[2.5, 0, -2]} color="#1f2937" count={8} />
        </group>
    );
};
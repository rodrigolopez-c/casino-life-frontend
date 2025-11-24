import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import cardBack from './assets/card_back.png'; // Asegúrate que la ruta sea correcta

export const TableDecor: React.FC = () => {
    // Cargamos la textura del dorso para el mazo de reserva
    const texture = useLoader(TextureLoader, cardBack);

    return (
        <group>
            {/* --- 1. BORDE DE LA MESA (Estilo Madera/Cuero) --- */}
            {/* Borde Superior */}
            <mesh position={[0, 0, -5.5]} receiveShadow>
                <boxGeometry args={[12, 1, 1]} />
                <meshStandardMaterial color="#3f2e20" roughness={0.4} />
            </mesh>
             {/* Borde Inferior */}
             <mesh position={[0, 0, 5]} receiveShadow>
                <boxGeometry args={[12, 1, 1]} />
                <meshStandardMaterial color="#3f2e20" roughness={0.4} />
            </mesh>
            {/* Borde Izquierdo */}
            <mesh position={[-6, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[10, 1, 1]} />
                <meshStandardMaterial color="#3f2e20" roughness={0.4} />
            </mesh>
            {/* Borde Derecho */}
            <mesh position={[6, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[10, 1, 1]} />
                <meshStandardMaterial color="#3f2e20" roughness={0.4} />
            </mesh>

            {/* --- 2. MAZO DE RESERVA (A la derecha del Dealer) --- */}
            <group position={[3.5, 0.2, -3]} rotation={[0, 0, 0]}>
                {/* El cuerpo del mazo (simulando muchas cartas) */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1, 0.6, 1.4]} /> 
                    <meshStandardMaterial color="#e5e7eb" /> {/* Bordes blancos de las cartas */}
                </mesh>
                
                {/* La carta superior (Tapa) */}
                <mesh position={[0, 0.305, 0]} rotation={[-Math.PI/2, 0, Math.PI/2]}>
                    <planeGeometry args={[1.4, 1]} />
                    <meshStandardMaterial map={texture} />
                </mesh>
            </group>

            {/* --- 3. FICHA DE "DEALER" (Botón blanco) --- */}
            <mesh position={[-2.5, 0.05, -2]} receiveShadow castShadow>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};
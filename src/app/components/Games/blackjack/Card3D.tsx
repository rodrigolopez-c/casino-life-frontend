import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, NearestFilter } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { type Suit } from './types';

// --- IMPORTS DE IMÁGENES (Mantenlos igual) ---
import cardBack from './assets/card_back.png';
import cardClubs2 from './assets/card_clubs_02.png';
import cardClubs3 from './assets/card_clubs_03.png';
import cardClubs4 from './assets/card_clubs_04.png';
import cardClubs5 from './assets/card_clubs_05.png';
import cardClubs6 from './assets/card_clubs_06.png';
import cardClubs7 from './assets/card_clubs_07.png';
import cardClubs8 from './assets/card_clubs_08.png';
import cardClubs9 from './assets/card_clubs_09.png';
import cardClubs10 from './assets/card_clubs_10.png';
import cardClubsJ from './assets/card_clubs_J.png';
import cardClubsQ from './assets/card_clubs_Q.png';
import cardClubsK from './assets/card_clubs_K.png';
import cardClubsA from './assets/card_clubs_A.png';

import cardDiamonds2 from './assets/card_diamonds_02.png';
import cardDiamonds3 from './assets/card_diamonds_03.png';
import cardDiamonds4 from './assets/card_diamonds_04.png';
import cardDiamonds5 from './assets/card_diamonds_05.png';
import cardDiamonds6 from './assets/card_diamonds_06.png';
import cardDiamonds7 from './assets/card_diamonds_07.png';
import cardDiamonds8 from './assets/card_diamonds_08.png';
import cardDiamonds9 from './assets/card_diamonds_09.png';
import cardDiamonds10 from './assets/card_diamonds_10.png';
import cardDiamondsJ from './assets/card_diamonds_J.png';
import cardDiamondsQ from './assets/card_diamonds_Q.png';
import cardDiamondsK from './assets/card_diamonds_K.png';
import cardDiamondsA from './assets/card_diamonds_A.png';

import cardHearts2 from './assets/card_hearts_02.png';
import cardHearts3 from './assets/card_hearts_03.png';
import cardHearts4 from './assets/card_hearts_04.png';
import cardHearts5 from './assets/card_hearts_05.png';
import cardHearts6 from './assets/card_hearts_06.png';
import cardHearts7 from './assets/card_hearts_07.png';
import cardHearts8 from './assets/card_hearts_08.png';
import cardHearts9 from './assets/card_hearts_09.png';
import cardHearts10 from './assets/card_hearts_10.png';
import cardHeartsJ from './assets/card_hearts_J.png';
import cardHeartsQ from './assets/card_hearts_Q.png';
import cardHeartsK from './assets/card_hearts_K.png';
import cardHeartsA from './assets/card_hearts_A.png';

import cardSpades2 from './assets/card_spades_02.png';
import cardSpades3 from './assets/card_spades_03.png';
import cardSpades4 from './assets/card_spades_04.png';
import cardSpades5 from './assets/card_spades_05.png';
import cardSpades6 from './assets/card_spades_06.png';
import cardSpades7 from './assets/card_spades_07.png';
import cardSpades8 from './assets/card_spades_08.png';
import cardSpades9 from './assets/card_spades_09.png';
import cardSpades10 from './assets/card_spades_10.png';
import cardSpadesJ from './assets/card_spades_J.png';
import cardSpadesQ from './assets/card_spades_Q.png';
import cardSpadesK from './assets/card_spades_K.png';
import cardSpadesA from './assets/card_spades_A.png';

const cardTextures: { [key: string]: string } = {
    'clubs-2': cardClubs2, 'clubs-3': cardClubs3, 'clubs-4': cardClubs4, 'clubs-5': cardClubs5, 'clubs-6': cardClubs6, 'clubs-7': cardClubs7, 'clubs-8': cardClubs8, 'clubs-9': cardClubs9, 'clubs-10': cardClubs10, 'clubs-J': cardClubsJ, 'clubs-Q': cardClubsQ, 'clubs-K': cardClubsK, 'clubs-A': cardClubsA,
    'diamonds-2': cardDiamonds2, 'diamonds-3': cardDiamonds3, 'diamonds-4': cardDiamonds4, 'diamonds-5': cardDiamonds5, 'diamonds-6': cardDiamonds6, 'diamonds-7': cardDiamonds7, 'diamonds-8': cardDiamonds8, 'diamonds-9': cardDiamonds9, 'diamonds-10': cardDiamonds10, 'diamonds-J': cardDiamondsJ, 'diamonds-Q': cardDiamondsQ, 'diamonds-K': cardDiamondsK, 'diamonds-A': cardDiamondsA,
    'hearts-2': cardHearts2, 'hearts-3': cardHearts3, 'hearts-4': cardHearts4, 'hearts-5': cardHearts5, 'hearts-6': cardHearts6, 'hearts-7': cardHearts7, 'hearts-8': cardHearts8, 'hearts-9': cardHearts9, 'hearts-10': cardHearts10, 'hearts-J': cardHeartsJ, 'hearts-Q': cardHeartsQ, 'hearts-K': cardHeartsK, 'hearts-A': cardHeartsA,
    'spades-2': cardSpades2, 'spades-3': cardSpades3, 'spades-4': cardSpades4, 'spades-5': cardSpades5, 'spades-6': cardSpades6, 'spades-7': cardSpades7, 'spades-8': cardSpades8, 'spades-9': cardSpades9, 'spades-10': cardSpades10, 'spades-J': cardSpadesJ, 'spades-Q': cardSpadesQ, 'spades-K': cardSpadesK, 'spades-A': cardSpadesA,
};

interface CardProps {
    suit: Suit;
    value: string;
    position: [number, number, number];
    isHidden?: boolean;
}

export const Card3D: React.FC<CardProps> = ({ suit, value, position, isHidden = false }) => {
    const cardKey = `${suit}-${value}`;
    const frontTexturePath = cardTextures[cardKey] || cardSpadesA;
    const [frontTexture, backTexture] = useLoader(TextureLoader, [frontTexturePath, cardBack]);

    // PIXEL PERFECT SETTINGS
    if (frontTexture) {
        frontTexture.minFilter = NearestFilter;
        frontTexture.magFilter = NearestFilter;
        frontTexture.anisotropy = 1;
    }
    if (backTexture) {
        backTexture.minFilter = NearestFilter;
        backTexture.magFilter = NearestFilter;
        backTexture.anisotropy = 1;
    }

    const targetRotation = [isHidden ? Math.PI / 2 : -Math.PI / 2, 0, 0];
    const deckPosition = [3.5, 0.8, -2]; 
    const startRotation = [Math.PI / 2, 0, 0];

    const { springPos } = useSpring({
        from: { springPos: deckPosition },
        to: { springPos: position },
        config: { mass: 1, tension: 180, friction: 26 }
    });

    const { springRot } = useSpring({
        from: { springRot: startRotation },
        to: { springRot: targetRotation },
        delay: isHidden ? 0 : 300, 
        config: { mass: 1, tension: 120, friction: 14 }
    });

    return (
        <animated.group position={springPos as any} rotation={springRot as any}>
            
            {/* CORRECCIÓN VISUAL: 
                1. castShadow={true}: La carta da sombra en la mesa.
                2. receiveShadow={false}: La carta NO se hace sombra a sí misma (evita que se ponga negra).
                3. transparent={false} + alphaTest={0.5}: Dibuja la carta sólida y nítida.
            */}

            {/* FRENTE */}
            <mesh position={[0, 0, 0.002]} visible={!isHidden} castShadow receiveShadow={false}>
                <planeGeometry args={[1, 1.4]} />
                <meshStandardMaterial 
                    map={frontTexture} 
                    transparent={false} // CAMBIO IMPORTANTE: Falso para evitar errores de orden
                    alphaTest={0.5} // Mantiene el recorte de los bordes
                    color="white" // Asegura que el tinte base sea blanco
                    roughness={1} 
                />
            </mesh>

            {/* DORSO */}
            <mesh position={[0, 0, -0.002]} rotation={[0, Math.PI, 0]} castShadow receiveShadow={false}>
                <planeGeometry args={[1, 1.4]} />
                <meshStandardMaterial 
                    map={backTexture} 
                    transparent={false} // CAMBIO IMPORTANTE
                    alphaTest={0.5} 
                    color="white"
                    roughness={1}
                />
            </mesh>
        </animated.group>
    );
};
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

interface CoinCanvasProps {
    flipTriggerRef: React.MutableRefObject<(() => void) | null>;
    resultRef: React.MutableRefObject<'heads' | 'tails' | null>;
    onCoinSettled: (side: 'heads' | 'tails') => void;
    canBet: boolean;
    onGameStart: () => void;
    currentBetMessage: string;
}

const CoinCanvas: React.FC<CoinCanvasProps> = ({ 
    flipTriggerRef, 
    resultRef, 
    onCoinSettled, 
    canBet, 
    onGameStart,
    currentBetMessage 
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<'intro' | 'table'>('intro');
    const [result, setResult] = useState<'heads' | 'tails' | null>(null);
    const hasNotifiedRef = useRef(false);

    // Referencias para exponer funciones
    const flipRef = useRef<() => void>(() => {});

    useEffect(() => {
        if (phase !== 'table') return;
        const mount = mountRef.current!;

        // ====== ESCENA Y CÁMARA ======
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0a0e1a');

        const ARENA = { w: 8, h: 8 };
        const viewMargin = 1.5;

        // Cámara ortográfica vista desde arriba
        const makeOrtho = () => {
            const aspect = mount.clientWidth / mount.clientHeight;
            const halfH = ARENA.h / 2 + viewMargin;
            const halfW = ARENA.w / 2 + viewMargin;
            let left = -halfW, right = halfW, top = halfH, bottom = -halfH;
            const targetAspect = (right - left) / (top - bottom);
            
            if (aspect > targetAspect) {
                const extra = (top - bottom) * aspect / 2;
                left = -extra;
                right = extra;
            } else {
                const extra = (right - left) / aspect / 2;
                bottom = -extra;
                top = extra;
            }
            
            const cam = new THREE.OrthographicCamera(left, right, top, bottom, 0.1, 50);
            cam.position.set(0, 15, 0.0001);
            cam.up.set(0, 0, -1);
            cam.lookAt(0, 0, 0);
            return cam;
        };
        const camera = makeOrtho();

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        // ====== LUCES ======
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 10, 5);
        dir.castShadow = true;
        dir.shadow.mapSize.set(2048, 2048);
        scene.add(dir);

        // ====== PISO ======
        const floorGeo = new THREE.CircleGeometry(4, 64);
        const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a2332, 
        roughness: 0.8, 
        metalness: 0.2 
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // ====== CREAR TEXTURAS DE LA MONEDA ======
        // Función para crear la textura de "Cara"
        const createHeadsTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 512;
            const ctx = canvas.getContext('2d')!;

            // Fondo dorado
            const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
            gradient.addColorStop(0, '#ffd700');
            gradient.addColorStop(0.7, '#ffed4e');
            gradient.addColorStop(1, '#d4af37');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(256, 256, 256, 0, Math.PI * 2);
            ctx.fill();

            // Borde
            ctx.strokeStyle = '#8b7500';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(256, 256, 248, 0, Math.PI * 2);
            ctx.stroke();

            // Emoji moneda CENTRADO Y GRANDE
            ctx.font = '280px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🪙', 256, 256);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        // Función para crear la textura de "Cruz"
        const createTailsTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 512;
            const ctx = canvas.getContext('2d')!;

            // Fondo plateado
            const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
            gradient.addColorStop(0, '#c0c0c0');
            gradient.addColorStop(0.7, '#e8e8e8');
            gradient.addColorStop(1, '#a8a8a8');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(256, 256, 256, 0, Math.PI * 2);
            ctx.fill();

            // Borde
            ctx.strokeStyle = '#505050';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(256, 256, 248, 0, Math.PI * 2);
            ctx.stroke();

            // Emoji espadas CENTRADO Y GRANDE
            ctx.font = '280px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚔️', 256, 256);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const headsTexture = createHeadsTexture();
        const tailsTexture = createTailsTexture();

        // ====== FÍSICA ======
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.allowSleep = true;

        const mat = new CANNON.Material('default');
        const cm = new CANNON.ContactMaterial(mat, mat, { 
            friction: 0.3, 
            restitution: 0.4 
        });
        world.addContactMaterial(cm);
        world.defaultContactMaterial = cm;

        // Piso físico
        const groundBody = new CANNON.Body({ mass: 0, material: mat });
        groundBody.addShape(new CANNON.Plane());
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(groundBody);

        // ====== CREAR MONEDA ======
        const coinRadius = 0.8;
        const coinThickness = 0.15;

        // Geometría de la moneda (cilindro)
        const coinGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 64);
        
        // Materiales: cara en la parte superior, cruz en la inferior
        const sideMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xd4af37, 
            roughness: 0.3, 
            metalness: 0.8 
        });
        
        const headsMaterial = new THREE.MeshStandardMaterial({ 
            map: headsTexture, 
            roughness: 0.2, 
            metalness: 0.7 
        });
        
        const tailsMaterial = new THREE.MeshStandardMaterial({ 
            map: tailsTexture, 
            roughness: 0.2, 
            metalness: 0.7 
        });

        // Array de materiales para el cilindro: [lateral, top, bottom]
        const coinMaterials = [
            sideMaterial,    // Lateral
            headsMaterial,   // Top (Cara)
            tailsMaterial    // Bottom (Cruz)
        ];

        const coinMesh = new THREE.Mesh(coinGeo, coinMaterials);
        coinMesh.castShadow = true;
        coinMesh.receiveShadow = true;
        scene.add(coinMesh);

        // Cuerpo físico de la moneda (cilindro)
        const coinBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Cylinder(coinRadius, coinRadius, coinThickness, 32),
            material: mat,
            position: new CANNON.Vec3(0, 3, 0),
            angularDamping: 0.3,
            linearDamping: 0.1,
            sleepSpeedLimit: 0.1,
            sleepTimeLimit: 1.0,
        });
        world.addBody(coinBody);

        // ====== DETECTAR RESULTADO ======
        let settled = false;
        let stableFrames = 0;
        const velThresh = 0.08;
        const angThresh = 0.1;
        const framesNeeded = 30;

        // Detecta qué lado está hacia arriba
        const getTopSide = (): 'heads' | 'tails' => {
            // Convierte el quaternion de Cannon a Three.js
            const q = new THREE.Quaternion(
                coinBody.quaternion.x,
                coinBody.quaternion.y,
                coinBody.quaternion.z,
                coinBody.quaternion.w
            );

            // El vector "arriba" de la moneda en su espacio local
            const localUp = new THREE.Vector3(0, 1, 0);
            
            // Transforma al espacio del mundo
            const worldUp = localUp.applyQuaternion(q);

            // Si apunta hacia arriba (+Y), es "heads" (cara)
            // Si apunta hacia abajo (-Y), es "tails" (cruz)
            return worldUp.y > 0 ? 'heads' : 'tails';
        };

        // Verifica si la moneda se detuvo
        const checkSettled = () => {
            const lv = coinBody.velocity.length();
            const av = coinBody.angularVelocity.length();

            if (lv < velThresh && av < angThresh) {
                stableFrames = Math.min(framesNeeded, stableFrames + 1);
            } else {
                stableFrames = 0;
            }

            if (!settled && stableFrames >= framesNeeded) {
                settled = true;

                // Detiene completamente la moneda
                coinBody.velocity.set(0, 0, 0);
                coinBody.angularVelocity.set(0, 0, 0);

                // Determina el resultado
                const side = getTopSide();
                setResult(side);
                resultRef.current = side;

                // Notifica al componente padre después de un pequeño delay
                if (!hasNotifiedRef.current) {
                hasNotifiedRef.current = true;
                setTimeout(() => {
                    onCoinSettled(side);
                }, 500);
                }
            }
        };

        // ====== FUNCIÓN FLIP ======
        const flipCoin = () => {
            hasNotifiedRef.current = false;
            resultRef.current = null;
            setResult(null);

            // Resetea la moneda
            coinBody.sleepState = 0;
            
            // Posición inicial
            coinBody.position.set(0, 4, 0);
            
            // Rotación aleatoria inicial
            const randomQuat = new CANNON.Quaternion();
            randomQuat.setFromEuler(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            coinBody.quaternion.copy(randomQuat);

            // Velocidad inicial (leve impulso hacia arriba y giro)
            coinBody.velocity.set(
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 3,
                (Math.random() - 0.5) * 2
            );

            // Giro rápido en el eje X para que dé vueltas
            coinBody.angularVelocity.set(
                (Math.random() - 0.5) * 15 + 10, // Giro principal
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );

            stableFrames = 0;
            settled = false;
        };

        flipRef.current = flipCoin;
        flipTriggerRef.current = flipCoin;

        // ====== LOOP DE ANIMACIÓN ======
        const fixedTimeStep = 1 / 120;
        const maxSubSteps = 3;
        let last = performance.now();
        let animationId: number;

        function animate(now = performance.now()) {
            animationId = requestAnimationFrame(animate);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            
            world.step(fixedTimeStep, dt, maxSubSteps);

            // Sincroniza la malla de Three.js con el cuerpo físico
            coinMesh.position.copy(coinBody.position as any);
            coinMesh.quaternion.copy(coinBody.quaternion as any);

            checkSettled();
            renderer.render(scene, camera);
        }
        animate();

        // ====== RESPONSIVE ======
        const onResize = () => {
            renderer.setSize(mount.clientWidth, mount.clientHeight);
            const newCamera = makeOrtho();
            camera.left = newCamera.left;
            camera.right = newCamera.right;
            camera.top = newCamera.top;
            camera.bottom = newCamera.bottom;
            camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        // ====== CLEANUP ======
        return () => {
            ro.disconnect();
            cancelAnimationFrame(animationId);
            
            // Limpiar texturas
            headsTexture.dispose();
            tailsTexture.dispose();
            
            // Limpiar materiales
            headsMaterial.dispose();
            tailsMaterial.dispose();
            sideMaterial.dispose();
            
            // Limpiar geometría
            coinGeo.dispose();
            
            renderer.dispose();
            mount.innerHTML = '';
            world.bodies.forEach(b => world.removeBody(b));
        };
    }, [phase, onCoinSettled]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0e1a' }}>
        {/* Pantalla de inicio */}
        {phase === 'intro' && (
            <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                background: 'radial-gradient(1200px 800px at 50% 30%, rgba(255,215,0,0.08), rgba(10,14,26,1))',
                color: '#e9edf6', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                zIndex: 100  // AGREGA ESTO
            }}>
            <div style={{ textAlign: 'center', maxWidth: 520, padding: '24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🪙</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Coin Flip</div>
                <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 24 }}>
                Lanza la moneda y apuesta por Cara o Cruz.
                </div>
                <button
                onClick={() => {
                    setPhase('table');
                    onGameStart();
                }}
                style={{
                    padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(255,215,0,0.3)',
                    background: 'linear-gradient(180deg, rgba(255,215,0,0.15), rgba(255,215,0,0.08))',
                    color: '#fff', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)'
                }}
                >
                Comenzar
                </button>
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
                Cada lado tiene exactamente 50% de probabilidad. ¡Buena suerte!
                </div>
            </div>
            </div>
        )}

        {/* Canvas y controles */}
        {phase === 'table' && (
            <>
            <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
            
            {/* Barra superior: resultado */}
            <div style={{
                position: 'absolute', top: 16, left: 16, right: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 12
            }}>
                <div style={{
                    padding: '8px 16px', borderRadius: 10, background: 'rgba(255,215,0,.12)', 
                    color: '#ffd700', backdropFilter: 'blur(6px)', 
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                    fontWeight: 700, fontSize: '18px'
                }}>
                <b style={{ color: '#fff' }}>Resultado:</b> {result ? (result === 'heads' ? '🪙 Cara' : '⚔️ Cruz') : '—'}
                </div>
            </div>

            {/* Barra inferior: mensaje de apuesta */}
            <div style={{
                position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 14,
                    background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,215,0,0.2)',
                    alignItems: 'center'
                }}>
                <div style={{
                    color: '#ffd700',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                    fontSize: '14px',
                    fontWeight: 600
                }}>
                    {currentBetMessage}
                </div>
                <button 
                    onClick={() => { 
                        setPhase('intro'); 
                        setResult(null); 
                    }}
                    style={{
                        padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,215,0,0.3)',
                        background: 'linear-gradient(180deg, rgba(255,215,0,0.12), rgba(255,215,0,0.06))',
                        color: '#fff', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Salir
                </button>
                </div>
            </div>
            </>
        )}
        </div>
    );
};

export default CoinCanvas;
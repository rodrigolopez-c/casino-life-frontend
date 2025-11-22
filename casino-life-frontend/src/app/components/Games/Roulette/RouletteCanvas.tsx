import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RouletteCanvasProps {
    spinTriggerRef: React.MutableRefObject<(() => void) | null>;
    resultRef: React.MutableRefObject<number | null>;
    onSpinComplete: (number: number) => void;
    onGameStart: () => void;
    currentBetMessage: string;
}

// Ruleta americana - orden físico correcto
const ROULETTE_NUMBERS = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5,
    '00', 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
];

const ROULETTE_COLORS: { [key: number | string]: string } = {
    0: 'green', '00': 'green',
    1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
    7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
    13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
    19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
    25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

const RouletteCanvas: React.FC<RouletteCanvasProps> = ({
    spinTriggerRef,
    resultRef,
    onSpinComplete,
    onGameStart,
    currentBetMessage
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [phase, setPhase] = useState<'intro' | 'table'>('intro');
    const [result, setResult] = useState<number | string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const hasNotifiedRef = useRef(false);

    useEffect(() => {
        if (phase !== 'table') return;
        const mount = mountRef.current!;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#053505');

        const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
        camera.position.set(0, 8, 0);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(5, 10, 5);
        dir.castShadow = true;
        scene.add(dir);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const baseGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.5, 64);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d1810, roughness: 0.4, metalness: 0.3 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -0.25;
        base.receiveShadow = true;
        scene.add(base);

        const rimGeo = new THREE.TorusGeometry(3.1, 0.15, 16, 64);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.1;
        scene.add(rim);

        const wheelGroup = new THREE.Group();
        scene.add(wheelGroup);

        const wheelDiscGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.2, 64);
        const wheelDiscMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
        const wheelDisc = new THREE.Mesh(wheelDiscGeo, wheelDiscMat);
        wheelDisc.castShadow = true;
        wheelGroup.add(wheelDisc);

        const centerCanvas = document.createElement('canvas');
        centerCanvas.width = 512;
        centerCanvas.height = 512;
        const centerCtx = centerCanvas.getContext('2d')!;
        centerCtx.fillStyle = '#ffffff';
        centerCtx.font = 'bold 120px Arial';
        centerCtx.textAlign = 'center';
        centerCtx.textBaseline = 'middle';
        centerCtx.fillText('¡Gira la', 256, 200);
        centerCtx.fillText('ruleta!', 256, 310);

        const centerTexture = new THREE.CanvasTexture(centerCanvas);
        const centerGeo = new THREE.CircleGeometry(1.25, 32);
        const centerMat = new THREE.MeshBasicMaterial({ map: centerTexture, transparent: true });
        const centerText = new THREE.Mesh(centerGeo, centerMat);
        centerText.rotation.x = -Math.PI / 2;
        centerText.position.y = 0.12;
        wheelGroup.add(centerText);

        const sectionAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;

        ROULETTE_NUMBERS.forEach((num, i) => {
            const angle = i * sectionAngle;
            const color = ROULETTE_COLORS[num];
            
            const sectionGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.02, 1, 1, false, angle - sectionAngle/2, sectionAngle);
            const sectionColor = color === 'red' ? 0xc41e3a : color === 'black' ? 0x1a1a1a : 0x0e6b0e;
            const sectionMat = new THREE.MeshStandardMaterial({ color: sectionColor, roughness: 0.5, side: THREE.DoubleSide });
            const section = new THREE.Mesh(sectionGeo, sectionMat);
            section.position.y = 0.11;
            wheelGroup.add(section);
            
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(num.toString(), 64, 64);

            const textTexture = new THREE.CanvasTexture(canvas);
            const textGeo = new THREE.PlaneGeometry(0.4, 0.4);
            const textMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
            const textMesh = new THREE.Mesh(textGeo, textMat);
            textMesh.rotation.x = -Math.PI / 2;

            const centerAngle = angle + sectionAngle / 2;
            textMesh.position.set(
                Math.cos(centerAngle) * 2.2,
                0.125,
                Math.sin(centerAngle) * 2.2
            );

            textMesh.rotation.z = centerAngle;
            textMesh.userData.index = i;
            textMesh.userData.number = num;

            wheelGroup.add(textMesh);
        });

        const centerBgGeo = new THREE.CircleGeometry(1.3, 32);
        const centerBgMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const centerBg = new THREE.Mesh(centerBgGeo, centerBgMat);
        centerBg.rotation.x = -Math.PI / 2;
        centerBg.position.y = 0.116;
        wheelGroup.add(centerBg);

        const ballGeo = new THREE.SphereGeometry(0.12, 32, 32);
        const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.8 });
        const ball = new THREE.Mesh(ballGeo, ballMat);
        ball.position.set(2.8, 0.3, 0);
        ball.castShadow = true;
        scene.add(ball);

        let wheelRotation = 0;
        let wheelSpeed = 0;
        let ballAngle = 0;
        let ballSpeed = 0;
        let ballRadius = 2.85;
        let spinning = false;

        const spinWheel = () => {
            if (spinning) return;
            
            spinning = true;
            setIsSpinning(true);
            hasNotifiedRef.current = false;
            resultRef.current = null;
            setResult(null);

            wheelSpeed = 0.08 + Math.random() * 0.02;
            ballSpeed = -(0.35 + Math.random() * 0.12);
            ballRadius = 2.85;
        };

        spinTriggerRef.current = spinWheel;

        let animationId: number;
        let lastTime = performance.now();

        function animate(now = performance.now()) {
            animationId = requestAnimationFrame(animate);
            lastTime = now;

            if (spinning) {
                wheelRotation += wheelSpeed;
                wheelGroup.rotation.y = wheelRotation;

                ballAngle += ballSpeed;
                ball.position.x = Math.cos(ballAngle) * ballRadius;
                ball.position.z = Math.sin(ballAngle) * ballRadius;
                ball.position.y = 0.3;

                wheelSpeed *= 0.985;
                ballSpeed *= 0.97;

                if (Math.abs(wheelSpeed) < 0.001) {
                    wheelSpeed = 0;
                }

                if (Math.abs(ballSpeed) < 0.002) {
                    spinning = false;
                    setIsSpinning(false);
                    wheelSpeed = 0;
                    ballSpeed = 0;

                    const ballAngleRelativeToWheel = ballAngle - wheelRotation;
                    const normalizedAngle = ((ballAngleRelativeToWheel % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
                    let sectionIndex = Math.floor(normalizedAngle / sectionAngle) % ROULETTE_NUMBERS.length;
                    sectionIndex = (sectionIndex + 8) % ROULETTE_NUMBERS.length;
                    const winningNumber = ROULETTE_NUMBERS[sectionIndex];

                    setResult(winningNumber);
                    resultRef.current = typeof winningNumber === 'string' ? -1 : winningNumber;

                    ball.position.y = 0.2;

                    if (!hasNotifiedRef.current) {
                        hasNotifiedRef.current = true;
                        setTimeout(() => {
                            onSpinComplete(typeof winningNumber === 'string' ? -1 : winningNumber);
                        }, 2000);
                    }
                }
            }

            renderer.render(scene, camera);
        }
        animate();

        const onResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(mount);

        return () => {
            ro.disconnect();
            cancelAnimationFrame(animationId);
            renderer.dispose();
            mount.innerHTML = '';
        };
    }, [phase, onSpinComplete]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#053505' }}>
            {phase === 'intro' && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                    background: 'radial-gradient(1200px 800px at 50% 30%, rgba(212, 175, 55, 0.08), rgba(10,14,26,1))',
                    color: '#e9edf6', 
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                    zIndex: 100
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 520, padding: '24px' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🔴⚫🟢</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Ruleta</div>
                        <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 24 }}>
                            Elige tu número, color o sección y observa la ruleta girar. Física 3D realista con resultados justos.
                        </div>
                        <button
                            onClick={() => {
                                setPhase('table');
                                onGameStart();
                            }}
                            style={{
                                padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(212, 175, 55, 0.3)',
                                background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.08))',
                                color: '#fff', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)'
                            }}
                        >
                            Comenzar
                        </button>
                        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
                            Apuesta roja/negra paga 2x, números específicos pagan 36x. ¡Buena suerte!
                        </div>
                    </div>
                </div>
            )}

            {phase === 'table' && (
                <>
                    <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
                    
                    <div style={{
                        position: 'absolute', top: 16, left: 16, right: 16, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 12
                    }}>
                        <div style={{
                            padding: '8px 16px', borderRadius: 10, 
                            background: result !== null ? (
                                ROULETTE_COLORS[result] === 'red' ? 'rgba(196, 30, 58, 0.3)' :
                                ROULETTE_COLORS[result] === 'black' ? 'rgba(26, 26, 26, 0.5)' :
                                'rgba(14, 107, 14, 0.3)'
                            ) : 'rgba(255,255,255,.08)',
                            color: '#fff', backdropFilter: 'blur(6px)', 
                            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                            fontWeight: 700, fontSize: '20px',
                            border: '2px solid #ffd700'
                        }}>
                            <b>Resultado:</b> {result !== null ? `${result}` : '—'}
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 14,
                            background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                color: '#d4af37',
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
                                    padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(212, 175, 55, 0.3)',
                                    background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.06))',
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

export default RouletteCanvas;
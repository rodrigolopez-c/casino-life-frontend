import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ROULETTE_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const ROULETTE_COLORS: Record<number, 'red' | 'black' | 'green'> = {
  0: 'green',
  1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red',
  10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
  19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red',
  28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red',
};

interface RouletteCanvasProps {
  spinTriggerRef: React.MutableRefObject<((resultNumber: number) => void) | null>;
  onSpinStart: () => void;
  onSpinEnd: (number: number, color: 'red' | 'black' | 'green') => void;
  canBet: boolean;
  onGameStart: () => void;
  currentBetMessage: string;
}

const RouletteCanvas: React.FC<RouletteCanvasProps> = ({
  spinTriggerRef,
  onSpinStart,
  onSpinEnd,
  canBet,
  onGameStart,
  currentBetMessage,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'intro' | 'table'>('intro');
  const rouletteGroupRef = useRef<THREE.Group | null>(null);
  const currentAngleRef = useRef(0);
  const isSpinningRef = useRef(false);
  const spinStartTimeRef = useRef(0);
  const targetAngleRef = useRef(0);

  useEffect(() => {
    if (phase !== 'table') return;

    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a3d2a');

    // Cámara ortográfica centrada
    const aspect = mount.clientWidth / mount.clientHeight;
    const height = 12;
    const width = height * aspect;
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grupo de ruleta
    const rouletteGroup = new THREE.Group();
    rouletteGroup.position.y = 1.2;
    scene.add(rouletteGroup);
    rouletteGroupRef.current = rouletteGroup;

    // Crear canvas para textura de ruleta
    const wheelCanvas = document.createElement('canvas');
    wheelCanvas.width = 2048;
    wheelCanvas.height = 2048;
    const wheelCtx = wheelCanvas.getContext('2d')!;

    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const outerRadius = 900;
    const innerRadius = 80;

    // Fondo negro del centro
    wheelCtx.fillStyle = '#000000';
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    wheelCtx.fill();

    const colorMap = { 
        red: '#FF1744', 
        black: '#0D0D0D', 
        green: '#00FF41' 
    };

    // Dibujar sectores
    const totalSpots = ROULETTE_NUMBERS.length;
    ROULETTE_NUMBERS.forEach((number, index) => {
      const angle1 = (index / totalSpots) * Math.PI * 2;
      const angle2 = ((index + 1) / totalSpots) * Math.PI * 2;

      const color = ROULETTE_COLORS[number];
      wheelCtx.fillStyle = colorMap[color];

      wheelCtx.beginPath();
      wheelCtx.moveTo(centerX, centerY);
      wheelCtx.arc(centerX, centerY, outerRadius, angle1, angle2, false);
      wheelCtx.lineTo(centerX, centerY);
      wheelCtx.closePath();
      wheelCtx.fill();

      // Líneas divisorias blancas
      wheelCtx.strokeStyle = '#ffffff';
      wheelCtx.lineWidth = 10;
      wheelCtx.beginPath();
      wheelCtx.moveTo(centerX, centerY);
      wheelCtx.lineTo(
        centerX + outerRadius * Math.cos(angle1),
        centerY + outerRadius * Math.sin(angle1)
      );
      wheelCtx.stroke();

      // Números
      const textAngle = (angle1 + angle2) / 2;
      const textRadius = outerRadius * 0.90;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);

      wheelCtx.save();
      wheelCtx.translate(textX, textY);
      wheelCtx.rotate(textAngle + Math.PI / 2);
      wheelCtx.fillStyle = '#ffffff';
      wheelCtx.font = 'bold 90px Arial';
      wheelCtx.textAlign = 'center';
      wheelCtx.textBaseline = 'middle';
      wheelCtx.fillText(number.toString(), 0, 0);
      wheelCtx.restore();
    });

    const wheelTexture = new THREE.CanvasTexture(wheelCanvas);
    wheelTexture.magFilter = THREE.LinearFilter;
    wheelTexture.minFilter = THREE.LinearFilter;

    // Crear la ruleta
    const wheelGeometry = new THREE.CylinderGeometry(4, 4, 0.001, 64);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      map: wheelTexture,
      roughness: 0.3,
      metalness: 0,
    });
    const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheelMesh.rotation.x = Math.PI / 2;
    wheelMesh.castShadow = true;
    rouletteGroup.add(wheelMesh);

    // Aguja
    const needleGeometry = new THREE.ConeGeometry(0.35, 1.8, 16);
    const needleMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffffff',
      roughness: 0.2,
      metalness: 0.3,
    });

    // Círculo negro al centro de la ruleta
    const centerCircleGeometry = new THREE.CylinderGeometry(0.9, 0.5, 0.3, 40);
    const centerCircleMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      roughness: 0.3,
      metalness: 0.5,
    });
    const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial);
    centerCircle.position.set(0, 1.2, 0.6);
    centerCircle.rotation.x = Math.PI / 2;
    centerCircle.castShadow = true;
    scene.add(centerCircle);


    const needle = new THREE.Mesh(needleGeometry, needleMaterial);
    needle.position.set(0, 5.3, 0.5);
    needle.rotation.z = Math.PI;
    needle.castShadow = true;
    needle.receiveShadow = true;
    scene.add(needle);

    // Función para obtener número que apunta hacia arriba
    const getNumberAtTop = (): number => {
      let normalizedAngle = currentAngleRef.current % (Math.PI * 2);
      if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
      
      const needleAngle = Math.PI / 2;
      
      const relativeAngle = (needleAngle + normalizedAngle + Math.PI / 2) % (Math.PI * 2);
      
      let bestNumber = ROULETTE_NUMBERS[0];
      let bestDiff = Math.PI;

      ROULETTE_NUMBERS.forEach((number, index) => {
        const sectorSize = (Math.PI * 2) / ROULETTE_NUMBERS.length;
        const numberCenterAngle = index * sectorSize + sectorSize / 2;
        
        let diff = Math.abs(relativeAngle - numberCenterAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < bestDiff) {
          bestDiff = diff;
          bestNumber = number;
        }
      });

      return bestNumber;
    };

    // Función girar
    const spin = (resultNumber: number) => {
      if (isSpinningRef.current) return;
      
      isSpinningRef.current = true;
      onSpinStart();
      velocity = 0.3; // Velocidad inicial
      spinStartTimeRef.current = performance.now();
    };

    spinTriggerRef.current = spin;

    // Variables para animación
    let animationId: number;
    let velocity = 0.3; // Velocidad inicial
    const friction = 0.99; // Fricción

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (isSpinningRef.current && velocity > 0.0005) {
        velocity *= friction;
        
        // Mover la ruleta
        currentAngleRef.current -= velocity;
        rouletteGroup.rotation.z = currentAngleRef.current;
      } else if (isSpinningRef.current && velocity <= 0.0005) {
        isSpinningRef.current = false;
        
        const resultNumber = getNumberAtTop();
        const resultColor = ROULETTE_COLORS[resultNumber];
        
        onSpinEnd(resultNumber, resultColor);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    const onResize = () => {
      const newAspect = mount.clientWidth / mount.clientHeight;
      const newWidth = height * newAspect;
      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [phase, onSpinStart, onSpinEnd, spinTriggerRef]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b0f1a' }}>
      {/* Intro Screen */}
      {phase === 'intro' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'radial-gradient(1200px 800px at 50% 30%, rgba(255,255,255,0.06), rgba(11,15,26,1))',
            color: '#e9edf6',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 520, padding: '24px' }}>
            <div style={{ fontSize: 70, marginBottom: 8 }}>🎡</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Roulette!</div>
            <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 24 }}>
              Prueba tu suerte en la ruleta clásica
            </div>
            <button
              onClick={() => {
                setPhase('table');
                onGameStart();
              }}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
              }}
            >
              Comenzar
            </button>
          </div>
        </div>
      )}

      {/* Table Screen */}
      {phase === 'table' && (
        <>
          <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Bottom Title */}
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#fff',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
              fontSize: '50px',
              fontWeight: 700,
              zIndex: 10,
            }}
          >
            ¡Gira la ruleta!
          </div>

          {/* Bottom message */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.12)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Apuesta actual: {currentBetMessage}
              </div>
              <button
                onClick={() => {
                  setPhase('intro');
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
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
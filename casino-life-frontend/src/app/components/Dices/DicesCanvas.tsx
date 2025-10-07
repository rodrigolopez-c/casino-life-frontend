/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

type Pip = 1|2|3|4|5|6

function createPipTexture(n: Pip, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#d4d7dd'
  ctx.lineWidth = size * 0.03
  const rad = size * 0.08
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(ctx.lineWidth, ctx.lineWidth, size - ctx.lineWidth * 2, size - ctx.lineWidth * 2, rad)
  } else {
    ctx.beginPath()
    ctx.rect(ctx.lineWidth, ctx.lineWidth, size - ctx.lineWidth * 2, size - ctx.lineWidth * 2)
  }
  ctx.fill()
  ctx.stroke()

  const pip = (x: number, y: number) => {
    ctx.beginPath()
    ctx.fillStyle = '#101318'
    ctx.arc(x, y, size * 0.12, 0, Math.PI * 2)
    ctx.fill()
  }
  const off = size * 0.22
  const center = size * 0.5
  const TL: [number, number] = [center - off, center - off]
  const TR: [number, number] = [center + off, center - off]
  const BL: [number, number] = [center - off, center + off]
  const BR: [number, number] = [center + off, center + off]
  const ML: [number, number] = [center - off, center]
  const MR: [number, number] = [center + off, center]
  const CC: [number, number] = [center, center]

  switch (n) {
    case 1: pip(...CC); break
    case 2: pip(...TL); pip(...BR); break
    case 3: pip(...TL); pip(...CC); pip(...BR); break
    case 4: pip(...TL); pip(...TR); pip(...BL); pip(...BR); break
    case 5: pip(...TL); pip(...TR); pip(...CC); pip(...BL); pip(...BR); break
    case 6: pip(...TL); pip(...TR); pip(...ML); pip(...MR); pip(...BL); pip(...BR); break
  }
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

// mapeo de cara superior
const FACE_NORMALS: Record<number, THREE.Vector3> = {
  1: new THREE.Vector3(0, 1, 0),
  6: new THREE.Vector3(0,-1, 0),
  2: new THREE.Vector3(0, 0, 1),
  5: new THREE.Vector3(0, 0,-1),
  3: new THREE.Vector3(1, 0, 0),
  4: new THREE.Vector3(-1,0, 0),
}

function getTopFaceFromQuaternion(q: THREE.Quaternion): number {
  const upWorld = new THREE.Vector3(0,1,0)
  let best = {face: 1, dot: -Infinity}
  for (const [faceStr, nLocal] of Object.entries(FACE_NORMALS)) {
    const nWorld = nLocal.clone().applyQuaternion(q)
    const d = nWorld.dot(upWorld)
    if (d > best.dot) best = {face: Number(faceStr), dot: d}
  }
  return best.face
}

// Snap suave: mantiene la MISMA cara superior y solo la alinea exactamente a +Y
function snapKeepCurrentTop(q: THREE.Quaternion): THREE.Quaternion {
  const face = getTopFaceFromQuaternion(q)
  const upWorld = new THREE.Vector3(0,1,0)
  const currentTopWorld = FACE_NORMALS[face].clone().applyQuaternion(q)
  const delta = new THREE.Quaternion().setFromUnitVectors(currentTopWorld.normalize(), upWorld)
  return q.clone().premultiply(delta).normalize()
}

// Quaternión aleatorio (uniforme)
function randomQuaternion(): THREE.Quaternion {
  const u1 = Math.random(), u2 = Math.random(), u3 = Math.random()
  const s1 = Math.sqrt(1 - u1), s2 = Math.sqrt(u1)
  const q = new THREE.Quaternion(
    s1 * Math.sin(2 * Math.PI * u2),
    s1 * Math.cos(2 * Math.PI * u2),
    s2 * Math.sin(2 * Math.PI * u3),
    s2 * Math.cos(2 * Math.PI * u3),
  )
  return q.normalize()
}

const DiceCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'intro'|'table'>('intro')
  const [resultA, setResultA] = useState<number | null>(null)
  const [resultB, setResultB] = useState<number | null>(null)

  // refs para acceder a roll desde los botones React
  const rollRef = useRef<() => void>(() => {})
  const readyRef = useRef<() => boolean>(() => false)

  useEffect(() => {
    if (phase !== 'table') return
    const mount = mountRef.current!
    // ====== ESCENA / CÁMARA ORTOGRÁFICA (VISTA CENITAL) ======
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#000')

    const ARENA = { w: 10, h: 10, wall: 0.6, wallHeight: 3.2, ceiling: 3.6 }
    const viewMargin = 1.5

    const makeOrtho = () => {
      const aspect = mount.clientWidth / mount.clientHeight
      const halfH = (ARENA.h/2 + viewMargin)
      const halfW = (ARENA.w/2 + viewMargin)
      let left = -halfW, right = halfW, top = halfH, bottom = -halfH
      const targetAspect = (right - left) / (top - bottom)
      if (aspect > targetAspect) {
        const extra = (top - bottom) * aspect / 2
        left = -extra; right = extra
      } else {
        const extra = (right - left) / aspect / 2
        bottom = -extra; top = extra
      }
      const cam = new THREE.OrthographicCamera(left, right, top, bottom, 0.1, 50)
      cam.position.set(0, 20, 0.0001)
      cam.up.set(0,0,-1)
      cam.lookAt(0, 0, 0)
      return cam
    }
    let camera = makeOrtho()

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    // luces
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.85)
    dir.position.set(6, 12, 6)
    dir.castShadow = true
    dir.shadow.mapSize.set(1024, 1024)
    dir.shadow.camera.near = 0.5
    dir.shadow.camera.far = 50
    scene.add(dir)

    // piso
    const floorGeo = new THREE.PlaneGeometry(ARENA.w, ARENA.h)
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x182035, roughness: 0.95, metalness: 0.03 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // paredes visuales
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x222a44, roughness: 0.9, metalness: 0.02 })
    const mkWall = (w: number, h: number, thick: number) => {
      const geo = new THREE.BoxGeometry(w, h, thick)
      const mesh = new THREE.Mesh(geo, wallMat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
      return mesh
    }
    const wallN = mkWall(ARENA.w, ARENA.wallHeight, ARENA.wall)
    wallN.position.set(0, ARENA.wallHeight/2, ARENA.h/2 + ARENA.wall/2)
    const wallS = mkWall(ARENA.w, ARENA.wallHeight, ARENA.wall)
    wallS.position.set(0, ARENA.wallHeight/2, -ARENA.h/2 - ARENA.wall/2)
    const wallE = mkWall(ARENA.wall, ARENA.wallHeight, ARENA.h)
    wallE.position.set(ARENA.w/2 + ARENA.wall/2, ARENA.wallHeight/2, 0)
    const wallW = mkWall(ARENA.wall, ARENA.wallHeight, ARENA.h)
    wallW.position.set(-ARENA.w/2 - ARENA.wall/2, ARENA.wallHeight/2, 0)

    // techo invisible (solo físico)
    const ceilGeo = new THREE.PlaneGeometry(ARENA.w, ARENA.h)
    const ceilMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0 })
    const ceilingMesh = new THREE.Mesh(ceilGeo, ceilMat)
    ceilingMesh.rotation.x = Math.PI / 2
    ceilingMesh.position.y = ARENA.ceiling
    scene.add(ceilingMesh)

    // texturas de dados
    const t1 = createPipTexture(1), t2 = createPipTexture(2), t3 = createPipTexture(3)
    const t4 = createPipTexture(4), t5 = createPipTexture(5), t6 = createPipTexture(6)
    const baseMats = [
      new THREE.MeshStandardMaterial({ map: t3, roughness: 0.5, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: t4, roughness: 0.5, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: t1, roughness: 0.5, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: t6, roughness: 0.5, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: t2, roughness: 0.5, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ map: t5, roughness: 0.5, metalness: 0.1 }),
    ]

    // ====== FÍSICA ======
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) })
    world.broadphase = new CANNON.SAPBroadphase(world)
    world.allowSleep = true
    world.solver.iterations = 20
    world.solver.tolerance = 0.001

    const mat = new CANNON.Material('default')
    const cm = new CANNON.ContactMaterial(mat, mat, { friction: 0.6, restitution: 0.05 })
    world.addContactMaterial(cm)
    world.defaultContactMaterial = cm

    const groundBody = new CANNON.Body({ mass: 0, material: mat })
    groundBody.addShape(new CANNON.Plane())
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(groundBody)

    const addStaticBox = (pos: CANNON.Vec3, size: [number, number, number]) => {
      const body = new CANNON.Body({ mass: 0, material: mat })
      body.addShape(new CANNON.Box(new CANNON.Vec3(size[0]/2, size[1]/2, size[2]/2)))
      body.position.copy(pos)
      world.addBody(body)
      return body
    }
    const halfW = ARENA.w/2, halfH = ARENA.h/2, th = ARENA.wall, wallH = ARENA.wallHeight
    addStaticBox(new CANNON.Vec3(0, wallH/2,  halfH + th/2), [ARENA.w, wallH, th])
    addStaticBox(new CANNON.Vec3(0, wallH/2, -halfH - th/2), [ARENA.w, wallH, th])
    addStaticBox(new CANNON.Vec3( halfW + th/2, wallH/2, 0), [th, wallH, ARENA.h])
    addStaticBox(new CANNON.Vec3(-halfW - th/2, wallH/2, 0), [th, wallH, ARENA.h])
    addStaticBox(new CANNON.Vec3(0, ARENA.ceiling + th/2, 0), [ARENA.w, th, ARENA.h]) // techo

    function createDie(position: CANNON.Vec3, tint = 0xffffff) {
      const size = 1
      const geo = new THREE.BoxGeometry(size, size, size)
      const mats = baseMats.map(m => m.clone()) as THREE.MeshStandardMaterial[]
      mats.forEach(m => { m.color = new THREE.Color(tint) })
      const mesh = new THREE.Mesh(geo, mats)
      mesh.castShadow = true
      scene.add(mesh)

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2)),
        material: mat,
        position: position.clone(),
        angularDamping: 0.45,
        linearDamping: 0.25,
        sleepSpeedLimit: 0.15,
        sleepTimeLimit: 0.8,
      })
      world.addBody(body)
      return { mesh, body }
    }

    const dieA = createDie(new CANNON.Vec3(-1.2, 2.2, -0.3), 0xffffff)
    const dieB = createDie(new CANNON.Vec3( 1.2, 2.5,  0.5), 0xf7f7ff)

    // ====== CONTROL DE RESULTADOS ======
    let settledA = false, settledB = false
    let snappedA = false, snappedB = false
    let stableFramesA = 0, stableFramesB = 0
    const velThresh = 0.10, angThresh = 0.15, framesNeeded = 20

    const setUIA = (v: number) => setResultA(v)
    const setUIB = (v: number) => setResultB(v)

    function checkSettled() {
      const check = (body: CANNON.Body, stableFrames: number) => {
        const lv = body.velocity.length()
        const av = body.angularVelocity.length()
        if (lv < velThresh && av < angThresh) return Math.min(framesNeeded, stableFrames + 1)
        return 0
      }
      stableFramesA = check(dieA.body, stableFramesA)
      stableFramesB = check(dieB.body, stableFramesB)

      const handle = (die: {body: CANNON.Body}, isA: boolean) => {
        const settled = isA ? settledA : settledB
        const snapped = isA ? snappedA : snappedB
        const frames = isA ? stableFramesA : stableFramesB
        if (!settled && frames >= framesNeeded) {
          if (isA) settledA = true; else settledB = true

          if (!snapped) {
            const q = new THREE.Quaternion(die.body.quaternion.x, die.body.quaternion.y, die.body.quaternion.z, die.body.quaternion.w)
            const qSnap = snapKeepCurrentTop(q) // mantiene la MISMA cara superior
            die.body.velocity.set(0,0,0)
            die.body.angularVelocity.set(0,0,0)
            die.body.quaternion.set(qSnap.x, qSnap.y, qSnap.z, qSnap.w)
            if (isA) snappedA = true; else snappedB = true
          }
          const qFinal = new THREE.Quaternion(die.body.quaternion.x, die.body.quaternion.y, die.body.quaternion.z, die.body.quaternion.w)
          const v = getTopFaceFromQuaternion(qFinal)
          if (isA) setUIA(v); else setUIB(v)
        }
      }
      handle(dieA, true)
      handle(dieB, false)
    }

    // ====== ROLL (expuesto por ref) ======
    function rollDice() {
      const vel = () => (Math.random() * 3 + 2) * (Math.random() < 0.5 ? -1 : 1)
      const spin = () => (Math.random() * 6 + 4) * (Math.random() < 0.5 ? -1 : 1)

      ;[dieA, dieB].forEach(({ body }, i) => {
        body.sleepState = 0
        const rq = randomQuaternion()
        body.quaternion.set(rq.x, rq.y, rq.z, rq.w)
        body.position.set(i ? 1.0 : -1.0, 2.3 + Math.random()*0.4, i ? 0.6 : -0.5)
        body.velocity.set(vel(), Math.random() * 2 + 1.5, vel())
        body.angularVelocity.set(spin(), spin(), spin())
      })
      stableFramesA = stableFramesB = 0
      settledA = settledB = false
      snappedA = snappedB = false
      setResultA(null); setResultB(null)
    }
    rollRef.current = rollDice
    readyRef.current = () => settledA && settledB

    // ====== LOOP ======
    const fixedTimeStep = 1/120
    const maxSubSteps = 3
    let last = performance.now()

    function animate(now = performance.now()) {
      requestAnimationFrame(animate)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      world.step(fixedTimeStep, dt, maxSubSteps)

      ;[dieA, dieB].forEach(({ mesh, body }) => {
        mesh.position.set(body.position.x, body.position.y, body.position.z)
        mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
      })

      checkSettled()
      renderer.render(scene, camera)
    }
    animate()

    // responsive
    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera = makeOrtho()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    // cleanup
    return () => {
      ro.disconnect()
      renderer.dispose()
      mount.innerHTML = ''
      world.bodies.forEach(b => world.removeBody(b))
    }
  }, [phase])

  const total = (resultA ?? 0) + (resultB ?? 0)
  const roll = () => rollRef.current?.()
  const bothReady = readyRef.current?.() ?? false

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b0f1a' }}>
      {/* Pantalla de inicio */}
      {phase === 'intro' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          background: 'radial-gradient(1200px 800px at 50% 30%, rgba(255,255,255,0.06), rgba(11,15,26,1))',
          color: '#e9edf6', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 520, padding: '24px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Casino Life</div>
            <div style={{ fontSize: 18, opacity: 0.85, marginBottom: 24 }}>
              Dos dados 3D con física realista. Vista cenital, arena cerrada y resultados legibles.
            </div>
            <button
              onClick={() => setPhase('table')}
              style={{
                padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                color: '#fff', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(6px)'
              }}
            >
              Comenzar
            </button>
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
              Consejo: puedes lanzar las veces que quieras. Siempre se mostrarán ambos números claramente.
            </div>
          </div>
        </div>
      )}

      {/* Canvas + Controles */}
      {phase === 'table' && (
        <>
          <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
          {/* Barra superior: resultados */}
          <div style={{
            position: 'absolute', top: 16, left: 16, right: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12
          }}>
            <div style={{
              padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,.08)', color: '#e9edf6',
              backdropFilter: 'blur(6px)', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
            }}>
              <b style={{ color: '#fff' }}>Resultado</b>: {resultA ?? '—'} + {resultB ?? '—'}
            </div>
            <div style={{
              padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,.35)', color: '#fff',
              fontWeight: 700, minWidth: 56, textAlign: 'center', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
            }}>
              {resultA !== null && resultB !== null ? total : '—'}
            </div>
          </div>

          {/* Barra inferior: botones */}
          <div style={{
            position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}>
              <button onClick={roll} title="Tirar"
                style={{
                  padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
                  color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>
                Tirar
              </button>
              <button onClick={() => { setPhase('intro'); setResultA(null); setResultB(null); }}
                style={{
                  padding: '10px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
                  color: '#fff', fontWeight: 600, cursor: 'pointer'
                }}>
                Salir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DiceCanvas
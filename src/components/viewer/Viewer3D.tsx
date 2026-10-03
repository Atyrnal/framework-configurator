import { Suspense, useRef, useEffect, type ComponentRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CAMERA_PRESETS } from '../../lib/constants';
import * as THREE from 'three';
import { LaptopModel } from './LaptopModel';
import CameraControls from '../configurator/CameraControls';
import { useDark } from '../../lib/theme';

const presetPoint = new THREE.Vector3();
const STAGE_DROP = 0.28;

function CameraRig({ controls }: { controls: RefObject<ComponentRef<typeof OrbitControls> | null> }) {
  const { cameraPreset } = useConfiguratorStore();
  const animating = useRef(false);

  useEffect(() => {
    animating.current = cameraPreset !== null;
  }, [cameraPreset]);

  useFrame((state, delta) => {
    const orbit = controls.current;
    if (!animating.current || !orbit || cameraPreset === null) return;
    const preset = CAMERA_PRESETS[cameraPreset];
    presetPoint.set(preset.x, preset.y, preset.z);
    const step = 1 - Math.exp(-8 * delta);
    state.camera.position.lerp(presetPoint, step);
    if (state.camera.position.distanceTo(presetPoint) < 0.04) {
      state.camera.position.copy(presetPoint);
      animating.current = false;
    }
    orbit.target.set(0, 0, 0);
    orbit.update();
  });

  return null;
}

function UnderFill() {
  const light = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    if (!light.current) return;
    light.current.intensity = state.camera.position.y < 0.2 ? 1.6 : 0.22;
  });

  return <directionalLight ref={light} position={[0.4, -7, 1.2]} intensity={0.22} />;
}

function SceneEnvironment() {
  const dark = useDark();

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={dark ? 0.38 : 0.5} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={dark ? 1.35 : 1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.05}
      />
      <UnderFill />
      <ContactShadows
        position={[0, -0.64 - STAGE_DROP, 0]}
        opacity={dark ? 0.5 : 0.32}
        scale={7}
        blur={2}
        far={5}
        resolution={256}
        color="#000000"
      />
    </>
  );
}

export default function Viewer3D() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const releaseCamera = useConfiguratorStore((state) => state.releaseCamera);

  return (
    <div className="relative h-full w-full bg-stage max-lg:h-[calc(100%-var(--sheet,0px))]">
      <CameraControls />
      <Canvas
        shadows
        camera={{ position: [0.8, 2.7, -4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <CameraRig controls={controls} />
        <SceneEnvironment />
        <Suspense fallback={<Html center className="whitespace-nowrap rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-muted shadow-dock">Loading Laptop 13 Pro…</Html>}>
          <group position={[0, -STAGE_DROP, 0]}>
            <LaptopModel />
          </group>
        </Suspense>
        <OrbitControls
          ref={controls}
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          enableRotate
          screenSpacePanning
          zoomToCursor
          minDistance={0.9}
          maxDistance={14}
          zoomSpeed={0.85}
          panSpeed={0.9}
          rotateSpeed={0.75}
          maxPolarAngle={Math.PI}
          onStart={releaseCamera}
        />
      </Canvas>
    </div>
  );
}

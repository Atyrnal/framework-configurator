import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CAMERA_PRESETS } from '../../lib/constants';
import * as THREE from 'three';
import { LaptopModel } from './LaptopModel';
import CameraControls from '../configurator/CameraControls';

function CameraRig() {
  const { cameraPreset } = useConfiguratorStore();
  const targetPosition = useRef(CAMERA_PRESETS[cameraPreset]);

  useEffect(() => {
    targetPosition.current = CAMERA_PRESETS[cameraPreset];
  }, [cameraPreset]);

  useFrame((state, delta) => {
    const target = targetPosition.current;
    const camera = state.camera;
    camera.position.x += (target.x - camera.position.x) * 5 * delta;
    camera.position.y += (target.y - camera.position.y) * 5 * delta;
    camera.position.z += (target.z - camera.position.z) * 5 * delta;
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
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
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.05}
      />
      <UnderFill />
      <ContactShadows
        position={[0, -0.64, 0]}
        opacity={0.5}
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
  return (
    <div className="relative w-full h-full">
      <CameraControls />
      <Canvas
        shadows
        camera={{ position: [0.8, 2.7, -4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        dpr={[1, 2]}
      >
        <CameraRig />
        <SceneEnvironment />
        <Suspense fallback={<Html center className="whitespace-nowrap rounded-md bg-white/90 px-4 py-2 text-sm text-gray-600 shadow">Loading Framework Laptop 13 Pro…</Html>}>
          <LaptopModel />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
}

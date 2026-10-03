import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { BEZEL_FINISHES, CARD_FINISHES, keySurface } from '../../lib/constants';
import { catalogKeycaps, type Keycap } from '../../lib/keyboardLayout';
import type { ExpansionCardType, ExpansionSlot, SurfaceFinish } from '../../types';
import { KeyboardDecals } from './KeyboardDecals';

const MODEL_PATH = '/models/framework-laptop-13-pro.glb';
const OPEN_LID_ANGLE = THREE.MathUtils.degToRad(-105);
// Rear lip of the lid, on the deck top. The barrel center sits lower and
// swings the bezel down through the keyboard.
const HINGE_AXIS_Y = 0.005;
const HINGE_AXIS_Z = 0.002;
// _1 is the outer lid skin (faces the exterior). _3/_4 and the thin bottom
// sheets are coplanar CAD duplicates that zebra-stripe when left visible.
const HIDDEN_CAD_SHELL = /^(POC_13_LCD_COVER_AL_1_[34]|LFP30_LOG_D_AL_[234])$/;
const CLOSED_LID_ANGLE = 0;
// The CAD export names the actual display glass `GFW30_135_FHD__HADS_A`,
// without LCD in its name. Include it explicitly or it stays with the base.
const DISPLAY_PART = /(LCD|DISPLAY|135LCM|135_FHD|BOE_NE135|CAMERA_BTN|MIC_BTN|LFP30_LOGO|LOG_LOW_MAGNET)/i;

const CHASSIS_COLOR = '#2e3032';
const TOUCHPAD_COLOR = '#242628';

function installBezelGrain(material: THREE.MeshPhysicalMaterial, enabled: boolean) {
  material.onBeforeCompile = enabled
    ? (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vBezelPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBezelPos = position;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vBezelPos;')
        .replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
             float bezelRib = sin(vBezelPos.y * 7800.0);
             float bezelGrain = sin(vBezelPos.x * 5200.0) * sin(vBezelPos.y * 3600.0);
             normal = normalize(normal + vec3(bezelGrain * 0.08, bezelRib * 0.16, 0.0));`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
             float bezelStripe = sin(vBezelPos.y * 7800.0) * 0.5 + 0.5;
             diffuseColor.rgb *= mix(0.78, 1.0, bezelStripe);`,
        );
    }
    : () => undefined;
  material.customProgramCacheKey = () => (enabled ? 'bezel-grain-v4' : 'bezel-solid');
  material.normalMap = null;
  material.needsUpdate = true;
}

function installAnodizeGrain(material: THREE.MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vChassisPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvChassisPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vChassisPos;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
         float chassisGrain = sin(vChassisPos.x * 14000.0) * sin(vChassisPos.y * 12800.0);
         normal = normalize(normal + vec3(chassisGrain * 0.05, chassisGrain * 0.035, 0.0));`,
      );
  };
  material.customProgramCacheKey = () => 'chassis-anodize';
  material.needsUpdate = true;
}

function isStandardMaterial(material: THREE.Material): material is THREE.MeshStandardMaterial {
  return material instanceof THREE.MeshStandardMaterial;
}

function physicalMaterials(
  mesh: THREE.Mesh,
  key: string,
  side: THREE.Side = THREE.FrontSide,
): THREE.MeshPhysicalMaterial[] {
  const cached = mesh.userData[key] as THREE.MeshPhysicalMaterial[] | undefined;
  if (cached) {
    cached.forEach((material) => {
      material.side = side;
    });
    return cached;
  }

  const count = Array.isArray(mesh.material) ? mesh.material.length : 1;
  const created = Array.from({ length: count }, () => new THREE.MeshPhysicalMaterial({ side }));
  mesh.material = created.length === 1 ? created[0] : created;
  mesh.userData[key] = created;
  return created;
}

function applySurface(materials: THREE.MeshPhysicalMaterial[], finish: SurfaceFinish) {
  materials.forEach((material) => {
    material.color.set(finish.color);
    material.metalness = finish.metalness;
    material.roughness = finish.roughness;
    material.transmission = finish.transmission;
    material.thickness = finish.thickness;
    material.ior = finish.ior;
    material.attenuationColor.set(finish.attenuationColor);
    material.attenuationDistance = finish.attenuationDistance;
    material.envMapIntensity = finish.envMapIntensity;
    material.specularIntensity = finish.specularIntensity ?? 1;
    material.clearcoat = 0;
    material.transparent = finish.transmission > 0.05;
    material.opacity = 1;
    material.depthWrite = true;
    material.emissive.set('#000000');
    material.emissiveIntensity = 0;
    material.needsUpdate = true;
  });
}

function applyFinish(
  materials: THREE.Material[],
  color: string,
  metalness: number,
  roughness: number,
  envMapIntensity: number,
) {
  materials.filter(isStandardMaterial).forEach((material) => {
    material.color.set(color);
    material.metalness = metalness;
    material.roughness = roughness;
    material.envMapIntensity = envMapIntensity;
    material.vertexColors = false;
    material.emissive.set('#000000');
    material.emissiveIntensity = 0;
    material.transparent = false;
    material.opacity = 1;
    material.needsUpdate = true;
  });
}

function prepareModel(source: THREE.Group) {
  const scene = source.clone(true);
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    if (HIDDEN_CAD_SHELL.test(object.name)) object.visible = false;
    // The export places both front feet on the right. The _001 pair is the left foot.
    if (object.name === 'LFP30_D_FOOT_RUB_F_R001' || object.name === 'LFP30_D_FOOT_RUB_F_P001') {
      object.scale.x = -1;
    }
  });

  const assembly = scene.getObjectByName('Unnamed2') ?? scene;
  const baseParts = new THREE.Group();
  baseParts.name = 'Laptop 13 Pro base';
  assembly.add(baseParts);
  const lidPivot = new THREE.Group();
  lidPivot.name = 'Laptop 13 Pro lid hinge';
  assembly.add(lidPivot);
  assembly.updateMatrixWorld(true);

  // Keep the closed CAD pose, but spin the lid around the hinge pin.
  lidPivot.position.set(0, HINGE_AXIS_Y, HINGE_AXIS_Z);
  assembly.updateMatrixWorld(true);

  for (const part of [...assembly.children]) {
    if (part === lidPivot || part === baseParts) continue;
    if (DISPLAY_PART.test(part.name)) {
      lidPivot.attach(part);
    } else {
      baseParts.attach(part);
    }
  }

  const placement = new THREE.Group();
  placement.name = 'Framework Laptop 13 Pro';
  // STEP export uses X=width, Y=depth, Z=thickness. Convert to Three.js Y-up
  // and rotate around world Y so the front edge faces the default camera.
  placement.rotation.set(-Math.PI / 2, Math.PI, 0);
  placement.add(scene);
  placement.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(placement);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.25 / size.x;
  placement.scale.setScalar(scale);
  placement.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  placement.updateMatrixWorld(true);
  lidPivot.rotation.x = OPEN_LID_ANGLE;

  return { scene, placement, lidPivot };
}

// Side openings in LFP30_LOG_D_AL. The card face matches the cutout: full
// slot height, the slot's length, outer face on the chassis side plane.
const CARD_INNER_X = 0.1168;
const CARD_OUTER_X = 0.14822;
const CARD_SIZE_X = CARD_OUTER_X - CARD_INNER_X;
const CARD_SIZE_Y = 0.0304;
const CARD_Z0 = 0.00395;
const CARD_Z1 = 0.01048;
const CARD_SIZE_Z = CARD_Z1 - CARD_Z0;
const SLOT_Y = [0.0425, 0.0835] as const;

function CardPort({ type, side }: { type: ExpansionCardType; side: -1 | 1 }) {
  const x = side * 0.00035;
  const metal = <meshStandardMaterial color="#d5dde4" metalness={0.72} roughness={0.28} />;
  const cavity = <meshStandardMaterial color="#121418" metalness={0.4} roughness={0.45} />;

  switch (type) {
    case 'empty':
      return null;
    case 'usb-c':
      return (
        <group position={[x, 0, 0]}>
          <mesh scale={[0.14, 1, 1]}>
            <capsuleGeometry args={[0.00155, 0.0054, 4, 12]} />
            {cavity}
          </mesh>
          <mesh position={[side * 0.0002, 0, 0]} scale={[0.1, 1, 1]}>
            <capsuleGeometry args={[0.00075, 0.0036, 3, 10]} />
            {metal}
          </mesh>
        </group>
      );
    case 'usb-a':
      return (
        <mesh position={[x, 0, 0]}>
          <boxGeometry args={[0.0004, 0.0132, 0.0052]} />
          {cavity}
        </mesh>
      );
    case 'hdmi':
      return (
        <mesh position={[x, 0, 0]}>
          <boxGeometry args={[0.0004, 0.0145, 0.0046]} />
          {metal}
        </mesh>
      );
    case 'displayport':
      return (
        <mesh position={[x, 0, -0.0002]}>
          <boxGeometry args={[0.0004, 0.0124, 0.0042]} />
          {cavity}
        </mesh>
      );
    case 'ethernet':
      return (
        <mesh position={[x, 0, 0.0003]}>
          <boxGeometry args={[0.0004, 0.012, 0.006]} />
          {cavity}
        </mesh>
      );
    case 'sd-card':
      return (
        <group>
          <mesh position={[-side * 0.0012, 0, 0.0004]}>
            <boxGeometry args={[0.0024, 0.014, 0.0015]} />
            {cavity}
          </mesh>
          <mesh position={[-side * 0.0026, 0, 0.0004]}>
            <boxGeometry args={[0.00045, 0.016, 0.0022]} />
            {cavity}
          </mesh>
        </group>
      );
    case 'microsd':
      return (
        <mesh position={[x, 0, 0.0012]}>
          <boxGeometry args={[0.00035, 0.009, 0.0011]} />
          {cavity}
        </mesh>
      );
    case 'audio-jack':
      return (
        <group>
          <mesh position={[-side * 0.0015, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0017, 0.0017, 0.003, 24]} />
            {cavity}
          </mesh>
          <mesh position={[-side * 0.0031, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.00205, 0.00205, 0.0004, 24]} />
            {cavity}
          </mesh>
        </group>
      );
    default: {
      const unreachable: never = type;
      return unreachable;
    }
  }
}

function CardShell({ finish }: { finish: SurfaceFinish }) {
  const material = useMemo(() => {
    const matte = finish.transmission > 0.05;
    const created = new THREE.MeshPhysicalMaterial({
      color: finish.color,
      metalness: finish.metalness,
      roughness: finish.roughness,
      transmission: finish.transmission,
      thickness: finish.thickness,
      ior: finish.ior,
      attenuationColor: finish.attenuationColor,
      attenuationDistance: finish.attenuationDistance,
      envMapIntensity: finish.envMapIntensity,
      specularIntensity: finish.specularIntensity ?? 1,
      transparent: matte,
    });
    if (matte) installBezelGrain(created, true);
    return created;
  }, [finish]);

  useEffect(() => () => material.dispose(), [material]);

  return <primitive object={material} attach="material" />;
}

function CardCircuit() {
  const pads: [number, number][] = [
    [-0.006, 0.0012],
    [-0.001, 0.0014],
    [0.005, 0.0008],
    [0.003, -0.001],
    [-0.004, -0.0012],
    [0.006, -0.0004],
  ];
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.0003, CARD_SIZE_Y * 0.72, CARD_SIZE_Z * 0.62]} />
        <meshStandardMaterial color="#5a3018" roughness={0.72} metalness={0.12} />
      </mesh>
      {pads.map(([y, z], index) => (
        <mesh key={index} position={[0.0002, y, z]}>
          <boxGeometry args={[0.0002, 0.0026, 0.0014]} />
          <meshStandardMaterial color="#d7b56a" roughness={0.35} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const SOCKET_COLOR = '#141618';

function ChassisPorts() {
  return (
    <group>
      {/* 3.5 mm jack in the left side wall. The disk is wider than the bore and
          sits just behind the outer face, so an angled view cannot see past it. */}
      <mesh position={[-0.1464, 0.1135, 0.0067]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0034, 0.0034, 0.0024, 28]} />
        <meshStandardMaterial color={SOCKET_COLOR} roughness={0.72} metalness={0.25} />
      </mesh>
      {/* Thin SD slot in the side wall, further forward. Both sides are open in the CAD. */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`sd-${side}`} position={[side * 0.1462, 0.1765, 0.0039]}>
          <boxGeometry args={[0.0022, 0.042, 0.0024]} />
          <meshStandardMaterial color={SOCKET_COLOR} roughness={0.72} metalness={0.25} />
        </mesh>
      ))}
      {/* Lock-button opening on the bottom, in the bridge between the two card bays. */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`lock-${side}`} position={[side * 0.1188, 0.0632, 0.0087]}>
          <boxGeometry args={[0.0054, 0.0066, 0.0018]} />
          <meshStandardMaterial color={SOCKET_COLOR} roughness={0.72} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function ExpansionCards({ slots }: { slots: ExpansionSlot[] }) {
  return (
    <group>
      {slots.map(({ id, card, color }) => {
        const side = id < 2 ? -1 : 1;
        const y = SLOT_Y[id % 2];
        const z = (CARD_Z0 + CARD_Z1) / 2;
        if (card === 'empty') {
          // Inner USB-C opening in the bay bracket, not the outer chassis cutout.
          const socketY = id % 2 === 0 ? 0.043 : 0.083;
          return (
            <mesh key={id} position={[side * 0.1149, socketY, 0.007]}>
              <boxGeometry args={[0.0016, 0.014, 0.0042]} />
              <meshStandardMaterial color={SOCKET_COLOR} roughness={0.72} metalness={0.25} />
            </mesh>
          );
        }
        const finish = CARD_FINISHES[color].finish;
        const x = side * ((CARD_INNER_X + CARD_OUTER_X) / 2);
        const showCircuit = finish.transmission > 0.05;

        return (
          <group key={id}>
            <RoundedBox
              args={[CARD_SIZE_X, CARD_SIZE_Y, CARD_SIZE_Z]}
              radius={0.0009}
              smoothness={3}
              position={[x, y, z]}
              castShadow
              receiveShadow
            >
              <CardShell finish={finish} />
            </RoundedBox>
            {showCircuit ? (
              <group position={[side * (CARD_OUTER_X - 0.0016), y, z]}>
                <CardCircuit />
              </group>
            ) : null}
            <group position={[side * CARD_OUTER_X, y, z]}>
              <CardPort type={card} side={side} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

export function LaptopModel() {
  const { scene: source } = useGLTF(MODEL_PATH);
  const { bezelColor, keyboardColor, expansionCards, isOpen } = useConfiguratorStore();
  const model = useMemo(() => prepareModel(source), [source]);
  const keycaps = useMemo(() => catalogKeycaps(source), [source]);
  const keyByName = useMemo(() => {
    const map = new Map<string, Keycap>();
    for (const cap of keycaps) {
      for (const name of cap.names) map.set(name, cap);
    }
    return map;
  }, [keycaps]);
  const touchpadGeometry = useMemo(() => {
    const width = 0.1252;
    const height = 0.0782;
    const radius = 0.006;
    const x = width / 2;
    const y = height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-x + radius, -y);
    shape.lineTo(x - radius, -y);
    shape.quadraticCurveTo(x, -y, x, -y + radius);
    shape.lineTo(x, y - radius);
    shape.quadraticCurveTo(x, y, x - radius, y);
    shape.lineTo(-x + radius, y);
    shape.quadraticCurveTo(-x, y, -x, y - radius);
    shape.lineTo(-x, -y + radius);
    shape.quadraticCurveTo(-x, -y, -x + radius, -y);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.00035, bevelEnabled: false });
  }, []);

  useEffect(() => {
    model.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const name = object.name.toUpperCase();
      // Multi-material CAD parts load as groups. Three names the child meshes
      // `PART_1`, `PART_2`, … so exact name checks never reach the back cover,
      // side walls, or the haptic touchpad.
      if (name.startsWith('00_LILAC_HAPTIC_MODULE')) {
        object.visible = false;
        return;
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];

      if (
        name.startsWith('SAKURA_LOG_UP_AL') ||
        name.startsWith('LFP30_LOG_D_AL') ||
        name.startsWith('POC_13_LCD_COVER_AL')
      ) {
        applyFinish(materials, CHASSIS_COLOR, 0.08, 0.6, 0.1);
        materials.filter(isStandardMaterial).forEach(installAnodizeGrain);
      }

      if (name.includes('LCD_BEZEL_CAP') || name.includes('LCD_BEZEL_1')) {
        object.visible = true;
        // Front faces only: the hollow channel's back faces were the orange
        // interior visible from the side.
        const finish = BEZEL_FINISHES[bezelColor];
        const bezelMaterials = physicalMaterials(object, 'bezelFinish', THREE.FrontSide);
        applySurface(bezelMaterials, finish);
        bezelMaterials.forEach((material) => installBezelGrain(material, finish.transmission > 0.05));
      }

      if (name === 'LFP30_LOGO' || name.startsWith('LFP30_LOGO_')) {
        applyFinish(materials, '#101114', 0.9, 0.16, 1.1);
      }

      if (name.startsWith('LILAC_FPR_ASSY')) {
        applyFinish(materials, '#101214', 0.1, 0.38, 0.22);
      }

      if (
        name.startsWith('LFP30_LOW_IO_CARD_BRK') ||
        name.startsWith('LFP30_LOG_LOW_CARD_LENS') ||
        name.startsWith('LFP30_LCD_HINGE_SUP_BRK') ||
        name.startsWith('LFP30_HINGE_')
      ) {
        applyFinish(materials, '#16181c', 0.42, 0.5, 0.22);
      }

      if (name.startsWith('LFP30_D_FOOT')) {
        applyFinish(materials, '#1a1a1a', 0.02, 0.92, 0.06);
        materials.filter(isStandardMaterial).forEach((material) => {
          material.side = THREE.DoubleSide;
        });
      }

      if (
        name.includes('LCD_CAMERA_LENS') ||
        name.includes('LCD_LED_LENS') ||
        name.includes('BEZEL_ALS_LENS') ||
        name.includes('MIC_BTN') ||
        name.includes('CAMERA_BTN')
      ) {
        applyFinish(materials, '#141416', 0.08, 0.42, 0.16);
      }

      if (name.startsWith('GFW30_KB_')) {
        const cap = keyByName.get(object.name);
        const keyMaterials = physicalMaterials(object, 'keyFinish');
        applySurface(keyMaterials, keySurface(keyboardColor, cap?.label ?? '', cap?.role ?? 'letter'));
        keyMaterials.forEach((material) => {
          if (material.transmission > 0.05) return;
          material.clearcoat = 0.14;
          material.clearcoatRoughness = 0.42;
        });
      }

      if (
        name.includes('LCD_MG_') ||
        name.includes('LCD_MAGNET') ||
        name.includes('LCD_PANEL_BRK') ||
        name.includes('LCD_HINGE_PLATE') ||
        name.includes('LCD_SLEEP_MG') ||
        name.includes('CAMERA_BTN_BRK') ||
        name.includes('CAMERA_BTN_SUPPORT') ||
        name.includes('MIC_BTN_BRK') ||
        name.includes('MIC_BTN_SUPPORT') ||
        name.includes('LOG_LOW_MAGNET')
      ) {
        const magnet = name.includes('MAGNET') && !name.includes('BRK') && !name.includes('MG_');
        const support = name.includes('SUPPORT') || name.includes('MG_CAM') || name.includes('PANEL_BRK');
        applyFinish(
          materials,
          magnet ? '#101114' : support ? '#e4eaf1' : '#c5ced6',
          magnet ? 0.15 : 0.9,
          magnet ? 0.45 : 0.22,
          magnet ? 0.25 : 1.1,
        );
        materials.filter(isStandardMaterial).forEach((material) => {
          material.side = THREE.DoubleSide;
          material.emissive.set(magnet ? '#000000' : '#4a545e');
          material.emissiveIntensity = magnet ? 0 : 0.35;
        });
      }

      if (name.includes('GFW30_135_FHD') || name.includes('135LCM_ASM')) {
        materials.filter(isStandardMaterial).forEach((material) => {
          material.color.set('#0c0e12');
          material.metalness = 0.04;
          material.roughness = 0.16;
          material.envMapIntensity = 0.22;
          material.emissive.set('#000000');
          material.emissiveIntensity = 0;
          material.needsUpdate = true;
        });
      }
    });
  }, [model.scene, bezelColor, keyboardColor, keyByName]);

  useFrame((_, delta) => {
    const target = isOpen ? OPEN_LID_ANGLE : CLOSED_LID_ANGLE;
    model.lidPivot.rotation.x = THREE.MathUtils.damp(model.lidPivot.rotation.x, target, 5, delta);
  });

  return (
    <primitive object={model.placement}>
      {/* Palm-rest top is the CAD z≈0 face. The glass starts a fraction below
          that face so the side wall stays in the pocket. */}
      <mesh geometry={touchpadGeometry} position={[0, 0.1807, 0.00022]} renderOrder={2} castShadow receiveShadow>
        <meshStandardMaterial
          color={TOUCHPAD_COLOR}
          metalness={0.03}
          roughness={0.32}
          envMapIntensity={0.12}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <KeyboardDecals caps={keycaps} color={keyboardColor} />
      <ChassisPorts />
      <ExpansionCards slots={expansionCards} />
      {/* Sits inside the bottom shell so the vent slots read as dark openings
          instead of a view into the keyboard and brackets. */}
      <mesh position={[0, 0.116, 0.008]} renderOrder={1}>
        <boxGeometry args={[0.2, 0.198, 0.001]} />
        <meshStandardMaterial color="#121418" roughness={0.92} metalness={0.04} />
      </mesh>
    </primitive>
  );
}

useGLTF.preload(MODEL_PATH);

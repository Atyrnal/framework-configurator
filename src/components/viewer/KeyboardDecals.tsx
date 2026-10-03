import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { legendInk } from '../../lib/constants';
import { keyGlyph, type Keycap } from '../../lib/keyboardLayout';
import type { KeyboardColor } from '../../types';

function drawFrameworkMark(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  context.beginPath();
  const teeth = 8;
  for (let i = 0; i < teeth * 2; i += 1) {
    const tooth = i % 2 === 0 ? radius : radius * 0.72;
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * tooth;
    const y = cy + Math.sin(angle) * tooth;
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.arc(cx, cy, radius * 0.34, 0, Math.PI * 2, true);
  context.fill('evenodd');
}

function drawIcon(context: CanvasRenderingContext2D, label: string, width: number, height: number) {
  const cx = width / 2;
  const y = height * 0.34;
  const s = height * 0.16;
  context.lineWidth = Math.max(2.5, height * 0.028);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  const screen = () => {
    context.strokeRect(cx - s * 1.15, y - s * 0.75, s * 2.3, s * 1.45);
  };

  switch (label) {
    case 'f1':
      screen();
      context.beginPath();
      context.moveTo(cx - s * 0.35, y - s * 0.05);
      context.lineTo(cx, y + s * 0.35);
      context.lineTo(cx + s * 0.35, y - s * 0.05);
      context.stroke();
      break;
    case 'f2':
      screen();
      context.beginPath();
      context.moveTo(cx - s * 0.35, y + s * 0.15);
      context.lineTo(cx, y - s * 0.25);
      context.lineTo(cx + s * 0.35, y + s * 0.15);
      context.stroke();
      break;
    case 'f3':
      context.beginPath();
      context.moveTo(cx - s, y - s * 0.35);
      context.lineTo(cx - s * 0.35, y - s * 0.35);
      context.lineTo(cx + s * 0.15, y - s * 0.85);
      context.lineTo(cx + s * 0.15, y + s * 0.85);
      context.lineTo(cx - s * 0.35, y + s * 0.35);
      context.lineTo(cx - s, y + s * 0.35);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.moveTo(cx - s * 0.2, y);
      context.lineTo(cx + s * 0.15, y);
      context.stroke();
      break;
    case 'f4':
    case 'f6': {
      const dir = label === 'f4' ? -1 : 1;
      context.beginPath();
      context.moveTo(cx + dir * s * 0.15, y - s * 0.7);
      context.lineTo(cx + dir * s * 0.95, y);
      context.lineTo(cx + dir * s * 0.15, y + s * 0.7);
      context.moveTo(cx - dir * s * 0.85, y - s * 0.7);
      context.lineTo(cx - dir * s * 0.05, y);
      context.lineTo(cx - dir * s * 0.85, y + s * 0.7);
      context.stroke();
      break;
    }
    case 'f5':
      context.beginPath();
      context.moveTo(cx - s * 0.15, y - s * 0.7);
      context.lineTo(cx + s * 0.75, y);
      context.lineTo(cx - s * 0.15, y + s * 0.7);
      context.closePath();
      context.fill();
      context.fillRect(cx - s * 0.85, y - s * 0.7, s * 0.28, s * 1.4);
      context.fillRect(cx - s * 0.45, y - s * 0.7, s * 0.28, s * 1.4);
      break;
    case 'f7':
    case 'f8':
      context.beginPath();
      context.arc(cx, y, s * 0.42, 0, Math.PI * 2);
      context.stroke();
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2;
        context.beginPath();
        context.moveTo(cx + Math.cos(angle) * s * 0.62, y + Math.sin(angle) * s * 0.62);
        context.lineTo(cx + Math.cos(angle) * s * 0.95, y + Math.sin(angle) * s * 0.95);
        context.stroke();
      }
      context.font = `700 ${Math.round(height * 0.16)}px Arial, Helvetica, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(label === 'f7' ? '−' : '+', cx, y + s * 0.02);
      break;
    case 'f9':
      context.strokeRect(cx - s, y - s * 0.85, s * 2, s * 1.35);
      context.beginPath();
      context.moveTo(cx, y + s * 0.5);
      context.lineTo(cx, y + s * 0.9);
      context.moveTo(cx - s * 0.45, y + s * 0.9);
      context.lineTo(cx + s * 0.45, y + s * 0.9);
      context.stroke();
      break;
    case 'f10':
      context.beginPath();
      context.moveTo(cx - s, y + s * 0.15);
      context.lineTo(cx + s * 0.2, y - s * 0.55);
      context.lineTo(cx + s * 1.05, y + s * 0.15);
      context.lineTo(cx + s * 0.35, y + s * 0.15);
      context.lineTo(cx - s * 0.15, y + s * 0.7);
      context.lineTo(cx - s * 0.55, y + s * 0.15);
      context.closePath();
      context.stroke();
      break;
    case 'f11':
      context.font = `700 ${Math.round(height * 0.16)}px Arial, Helvetica, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('PRT', cx, y - s * 0.28);
      context.fillText('SCR', cx, y + s * 0.38);
      break;
    case 'f12':
      drawFrameworkMark(context, cx, y, s * 0.85);
      break;
    default:
      break;
  }
}

const FACE = '500 FONT_SIZE "Helvetica Neue", Helvetica, Arial, sans-serif';

function setFont(context: CanvasRenderingContext2D, pixels: number) {
  context.font = FACE.replace('FONT_SIZE', `${Math.round(pixels)}px`);
}

function drawBacklightIcon(context: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  context.lineCap = 'round';
  context.lineWidth = Math.max(2.2, size * 0.11);
  for (const angle of [-0.62, 0, 0.62]) {
    context.beginPath();
    context.moveTo(cx + Math.sin(angle) * size * 0.22, cy - size * 0.02);
    context.lineTo(cx + Math.sin(angle) * size * 0.95, cy - Math.cos(angle) * size * 0.92);
    context.stroke();
  }
  const dash = size * 0.34;
  const y = cy + size * 0.42;
  for (const offset of [-1, 0, 1]) {
    const x = cx + offset * size * 0.48;
    context.beginPath();
    context.moveTo(x - dash / 2, y);
    context.lineTo(x + dash / 2, y);
    context.stroke();
  }
}

function drawArrowHead(context: CanvasRenderingContext2D, cx: number, cy: number, direction: 'left' | 'right' | 'up' | 'down', size: number) {
  context.beginPath();
  if (direction === 'left') {
    context.moveTo(cx - size, cy);
    context.lineTo(cx + size * 0.72, cy - size * 0.78);
    context.lineTo(cx + size * 0.72, cy + size * 0.78);
  } else if (direction === 'right') {
    context.moveTo(cx + size, cy);
    context.lineTo(cx - size * 0.72, cy - size * 0.78);
    context.lineTo(cx - size * 0.72, cy + size * 0.78);
  } else if (direction === 'up') {
    context.moveTo(cx, cy - size);
    context.lineTo(cx - size * 0.78, cy + size * 0.72);
    context.lineTo(cx + size * 0.78, cy + size * 0.72);
  } else {
    context.moveTo(cx, cy + size);
    context.lineTo(cx - size * 0.78, cy - size * 0.72);
    context.lineTo(cx + size * 0.78, cy - size * 0.72);
  }
  context.closePath();
  context.fill();
}

function legendTexture(cap: Keycap, color: string) {
  const aspect = Math.max(1, cap.width / Math.max(cap.depth, 0.004));
  const height = cap.depth < 0.012 ? 160 : 256;
  const width = Math.round(height * aspect);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  context.clearRect(0, 0, width, height);
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = Math.max(2, height * 0.02);
  const { label } = cap;
  const padX = width * 0.12;
  const padY = height * 0.1;

  if (label === 'super') {
    drawFrameworkMark(context, width / 2, height / 2, height * 0.16);
  } else if (label === 'space') {
    drawBacklightIcon(context, width * 0.042, height / 2, height * 0.2);
  } else if (label === 'esc') {
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    setFont(context, height * 0.24);
    context.fillText('esc', padX, height * 0.5);
    const escWidth = context.measureText('esc').width;
    setFont(context, height * 0.12);
    context.fillText('fn lock', padX + escWidth + width * 0.04, height * 0.52);
  } else if (/^f\d+$/.test(label)) {
    drawIcon(context, label, width, height);
    context.fillStyle = color;
    context.textAlign = 'right';
    context.textBaseline = 'bottom';
    setFont(context, height * 0.16);
    context.fillText(label.toUpperCase(), width * 0.9, height * 0.9);
  } else if (label === 'up' || label === 'down') {
    drawArrowHead(context, width * 0.28, height * 0.5, label, height * 0.22);
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    setFont(context, height * 0.3);
    context.fillText('pg', width * 0.5, height * 0.52);
  } else if (label === 'left' || label === 'right') {
    const word = label === 'left' ? 'home' : 'end';
    drawArrowHead(context, width / 2, height * 0.3, label, height * 0.13);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    setFont(context, height * 0.16);
    context.fillText(word, width / 2, height * 0.68);
  } else if (label === 'enter' || label === 'rshift' || label === 'bksp') {
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    setFont(context, height * (label === 'bksp' ? 0.2 : 0.24));
    context.fillText(keyGlyph(label).main, width * 0.88, height * 0.5);
  } else if (label === 'del') {
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    setFont(context, height * 0.24);
    context.fillText('del', width / 2, height * 0.5);
  } else {
    const glyph = keyGlyph(label);
    const word = glyph.main.length > 1 && !glyph.shift;
    if (glyph.shift) {
      context.textAlign = 'left';
      context.textBaseline = 'top';
      setFont(context, height * 0.2);
      context.fillText(glyph.shift, padX, padY);
      setFont(context, height * 0.26);
      context.fillText(glyph.main, padX, height * 0.5);
    } else if (word) {
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      setFont(context, height * (glyph.main.length > 6 ? 0.18 : 0.22));
      context.fillText(glyph.main, padX, height * 0.5);
    } else if (glyph.main) {
      context.textAlign = 'left';
      context.textBaseline = 'top';
      setFont(context, height * 0.4);
      context.fillText(glyph.main, padX, padY);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

const switchShell = new THREE.MeshStandardMaterial({ color: '#d9d4c8', roughness: 0.48, metalness: 0 });
const switchWell = new THREE.MeshStandardMaterial({ color: '#8f897e', roughness: 0.7, metalness: 0 });
const switchDome = new THREE.MeshStandardMaterial({ color: '#c9c3b6', roughness: 0.38, metalness: 0 });
const switchStem = new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 0.24, metalness: 0 });
const switchTooth = new THREE.MeshStandardMaterial({ color: '#b7b1a4', roughness: 0.55, metalness: 0 });

function SwitchFrame({ size, lip, material }: { size: number; lip: number; material: THREE.Material }) {
  const inner = size - lip * 2;
  return (
    <group>
      <mesh position={[0, size / 2 - lip / 2, 0]} material={material}>
        <boxGeometry args={[size, lip, 0.00032]} />
      </mesh>
      <mesh position={[0, -size / 2 + lip / 2, 0]} material={material}>
        <boxGeometry args={[size, lip, 0.00032]} />
      </mesh>
      <mesh position={[size / 2 - lip / 2, 0, 0]} material={material}>
        <boxGeometry args={[lip, inner, 0.00032]} />
      </mesh>
      <mesh position={[-size / 2 + lip / 2, 0, 0]} material={material}>
        <boxGeometry args={[lip, inner, 0.00032]} />
      </mesh>
    </group>
  );
}

function SwitchTop({ size }: { size: number }) {
  const s = size;
  return (
    <group>
      <mesh position={[0, 0, 0.00035]} material={switchWell}>
        <boxGeometry args={[s * 0.96, s * 0.96, 0.00025]} />
      </mesh>
      <group position={[0, 0, -0.00015]}>
        <SwitchFrame size={s} lip={s * 0.09} material={switchShell} />
      </group>
      <mesh position={[0, 0, 0.00005]} material={switchTooth}>
        <boxGeometry args={[s * 0.7, s * 0.7, 0.0002]} />
      </mesh>
      <group position={[0, 0, -0.00045]}>
        <SwitchFrame size={s * 0.68} lip={s * 0.05} material={switchShell} />
      </group>
      <mesh position={[0, 0, -0.0007]} rotation={[Math.PI / 2, 0, 0]} material={switchDome}>
        <cylinderGeometry args={[s * 0.18, s * 0.2, 0.00055, 24]} />
      </mesh>
      <mesh position={[0, 0, -0.00105]} rotation={[Math.PI / 2, 0, 0]} material={switchTooth}>
        <torusGeometry args={[s * 0.13, s * 0.03, 8, 24]} />
      </mesh>
      <mesh position={[0, 0, -0.00135]} material={switchStem}>
        <boxGeometry args={[s * 0.34, s * 0.08, 0.0004]} />
      </mesh>
      <mesh position={[0, 0, -0.00135]} material={switchStem}>
        <boxGeometry args={[s * 0.08, s * 0.34, 0.0004]} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
        <mesh
          key={`${sx}${sy}`}
          position={[sx * s * 0.34, sy * s * 0.34, -0.00055]}
          rotation={[Math.PI / 2, 0, 0]}
          material={switchDome}
        >
          <cylinderGeometry args={[s * 0.04, s * 0.05, 0.00045, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function ClearSwitch({ cap }: { cap: Keycap }) {
  const unit = Math.min(cap.width, cap.depth);
  const size = unit * 0.62;
  const stabilized = cap.width > cap.depth * 1.45;
  const z = cap.zTop + 0.00205;
  if (cap.label === 'space') {
    const barW = cap.width * 0.88;
    const barD = cap.depth * 0.58;
    const lip = barD * 0.14;
    return (
      <group position={[cap.x, cap.y, z]}>
        <mesh material={switchWell}>
          <boxGeometry args={[barW * 0.96, barD * 0.9, 0.00018]} />
        </mesh>
        <mesh position={[0, barD / 2 - lip / 2, -0.00012]} material={switchShell}>
          <boxGeometry args={[barW, lip, 0.00028]} />
        </mesh>
        <mesh position={[0, -barD / 2 + lip / 2, -0.00012]} material={switchShell}>
          <boxGeometry args={[barW, lip, 0.00028]} />
        </mesh>
        <mesh position={[barW / 2 - lip / 2, 0, -0.00012]} material={switchShell}>
          <boxGeometry args={[lip, barD - lip * 2, 0.00028]} />
        </mesh>
        <mesh position={[-barW / 2 + lip / 2, 0, -0.00012]} material={switchShell}>
          <boxGeometry args={[lip, barD - lip * 2, 0.00028]} />
        </mesh>
        {[-0.3, 0.3].map((side) => (
          <mesh key={side} position={[barW * side, 0, -0.0002]} material={switchWell}>
            <boxGeometry args={[barW * 0.08, barD * 0.42, 0.00024]} />
          </mesh>
        ))}
        <group position={[0, 0, -0.0002]}>
          <SwitchTop size={unit * 0.46} />
        </group>
      </group>
    );
  }
  return (
    <group position={[cap.x, cap.y, z]}>
      {stabilized && (
        <mesh material={switchShell}>
          <boxGeometry args={[cap.width * 0.72, unit * 0.1, 0.00022]} />
        </mesh>
      )}
      <SwitchTop size={size} />
    </group>
  );
}

export function KeyboardDecals({ caps, color }: { caps: Keycap[]; color: KeyboardColor }) {
  const showLegends = color !== 'blank' && color !== 'clear';
  const decals = useMemo(() => {
    if (!showLegends) return [];
    return caps
      .filter((cap) => cap.label.length > 0)
      .map((cap) => ({
        cap,
        texture: legendTexture(cap, legendInk(color, cap.label, cap.role)),
      }));
  }, [caps, color, showLegends]);

  useEffect(() => {
    return () => {
      decals.forEach((decal) => decal.texture.dispose());
    };
  }, [decals]);

  return (
    <group>
      {color === 'clear' && caps.map((cap) => <ClearSwitch key={cap.names[0]} cap={cap} />)}
      {decals.map(({ cap, texture }) => (
        <mesh
          key={cap.names[0]}
          position={[cap.x, cap.y, cap.zTop - 0.00008]}
          rotation={[Math.PI, 0, 0]}
          renderOrder={3}
        >
          <planeGeometry args={[cap.width * 0.92, cap.depth * 0.88]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.15}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
          />
        </mesh>
      ))}
    </group>
  );
}

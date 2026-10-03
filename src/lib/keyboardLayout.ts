import * as THREE from 'three';

export type KeyRole = 'letter' | 'edge' | 'mark';

export interface Keycap {
  names: string[];
  x: number;
  y: number;
  zTop: number;
  width: number;
  depth: number;
  label: string;
  role: KeyRole;
}

interface KeySpec {
  label: string;
  role: KeyRole;
}

const letter = (label: string): KeySpec => ({ label, role: 'letter' });
const edge = (label: string): KeySpec => ({ label, role: 'edge' });
const mark = (label: string): KeySpec => ({ label, role: 'mark' });

// US English ANSI. The CAD top row is Esc + F1–F12 + Delete (no separate Insert).
// Edge keys are the gray/lavender caps; mark keys are the orange accents.
const LABEL_ROWS: KeySpec[][] = [
  [
    edge('esc'),
    ...Array.from({ length: 11 }, (_, index) => letter(`f${index + 1}`)),
    mark('f12'),
    edge('del'),
  ],
  [edge('`'), ...'1234567890-='.split('').map(letter), edge('bksp')],
  [edge('tab'), ...'qwertyuiop'.split('').map(letter), letter('['), letter(']'), edge('\\')],
  [edge('caps'), ...'asdfghjkl'.split('').map(letter), letter(';'), letter("'"), edge('enter')],
  [edge('lshift'), ...'zxcvbnm'.split('').map(letter), letter(','), letter('.'), letter('/'), edge('rshift')],
  [
    edge('ctrl'),
    edge('fn'),
    mark('super'),
    letter('alt'),
    letter('space'),
    letter('alt'),
    edge('rctrl'),
    edge('left'),
    edge('up'),
    edge('down'),
    edge('right'),
  ],
];

const GLYPHS: Record<string, { main: string; shift?: string }> = {
  esc: { main: 'esc' },
  del: { main: 'del' },
  bksp: { main: 'backspace' },
  tab: { main: 'tab' },
  caps: { main: 'caps lock' },
  enter: { main: 'enter' },
  lshift: { main: 'shift' },
  rshift: { main: 'shift' },
  ctrl: { main: 'ctrl' },
  rctrl: { main: 'ctrl' },
  fn: { main: 'fn' },
  alt: { main: 'alt' },
  space: { main: '' },
  super: { main: '' },
  left: { main: '←' },
  up: { main: '↑' },
  down: { main: '↓' },
  right: { main: '→' },
  '`': { main: '`', shift: '~' },
  '1': { main: '1', shift: '!' },
  '2': { main: '2', shift: '@' },
  '3': { main: '3', shift: '#' },
  '4': { main: '4', shift: '$' },
  '5': { main: '5', shift: '%' },
  '6': { main: '6', shift: '^' },
  '7': { main: '7', shift: '&' },
  '8': { main: '8', shift: '*' },
  '9': { main: '9', shift: '(' },
  '0': { main: '0', shift: ')' },
  '-': { main: '-', shift: '_' },
  '=': { main: '=', shift: '+' },
  '[': { main: '[', shift: '{' },
  ']': { main: ']', shift: '}' },
  '\\': { main: '\\', shift: '|' },
  ';': { main: ';', shift: ':' },
  "'": { main: "'", shift: '"' },
  ',': { main: ',', shift: '<' },
  '.': { main: '.', shift: '>' },
  '/': { main: '/', shift: '?' },
};

export function keyGlyph(label: string): { main: string; shift?: string } {
  const known = GLYPHS[label];
  if (known) return known;
  if (/^f\d+$/.test(label)) return { main: label.toUpperCase() };
  if (/^[a-z]$/.test(label)) return { main: label.toUpperCase() };
  return { main: label };
}

interface RawKey {
  name: string;
  x: number;
  y: number;
  zTop: number;
  width: number;
  depth: number;
}

export function catalogKeycaps(root: THREE.Object3D): Keycap[] {
  root.updateMatrixWorld(true);
  const raw: RawKey[] = [];
  const scraps: { name: string; x: number; y: number }[] = [];
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !object.name.includes('GFW30_KB_')) return;
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    if (size.y < 0.006) {
      scraps.push({ name: object.name, x: center.x, y: center.y });
      return;
    }
    raw.push({
      name: object.name,
      x: center.x,
      y: center.y,
      zTop: box.min.z,
      width: size.x,
      depth: size.y,
    });
  });

  const clusters: RawKey[][] = [];
  for (const key of raw) {
    const cluster = clusters.find(
      (group) => Math.abs(group[0].x - key.x) < 0.003 && Math.abs(group[0].y - key.y) < 0.003,
    );
    if (cluster) cluster.push(key);
    else clusters.push([key]);
  }

  const caps = clusters.map((group) => {
    const top = group.reduce((best, item) => (item.zTop < best.zTop ? item : best));
    return {
      names: group.map((item) => item.name),
      x: top.x,
      y: top.y,
      zTop: Math.min(...group.map((item) => item.zTop)),
      width: Math.max(...group.map((item) => item.width)),
      depth: Math.max(...group.map((item) => item.depth)),
    };
  });

  caps.sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: (typeof caps)[] = [];
  for (const cap of caps) {
    const row = rows.find((items) => Math.abs(items[0].y - cap.y) < 0.012);
    if (row) row.push(cap);
    else rows.push([cap]);
  }
  for (const row of rows) row.sort((a, b) => a.x - b.x || a.y - b.y);

  const labeled = rows.flatMap((row, index) => {
    const labels = LABEL_ROWS[index] ?? [];
    return row.map((cap, column) => {
      const spec = labels[column] ?? letter('');
      return { ...cap, label: spec.label, role: spec.role };
    });
  });

  for (const scrap of scraps) {
    const cap = nearestKeycap(labeled, scrap.x, scrap.y);
    if (cap) cap.names.push(scrap.name);
  }

  return labeled;
}

export function nearestKeycap(caps: Keycap[], x: number, y: number): Keycap | undefined {
  let best: Keycap | undefined;
  let bestDistance = Infinity;
  for (const cap of caps) {
    const distance = (cap.x - x) ** 2 + (cap.y - y) ** 2;
    if (distance < bestDistance) {
      best = cap;
      bestDistance = distance;
    }
  }
  return best;
}

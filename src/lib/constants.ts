import {
  BezelColor,
  KeyboardColor,
  CameraPosition,
  Environment,
  ExpansionCard,
  ExpansionCardType,
  CardFinishId,
  SurfaceFinish,
} from '../types';

function solid(color: string, metalness: number, roughness: number, envMapIntensity = 0.2): SurfaceFinish {
  return {
    color,
    metalness,
    roughness,
    transmission: 0,
    thickness: 0.2,
    ior: 1.45,
    attenuationColor: color,
    attenuationDistance: 1,
    envMapIntensity,
  };
}

function clearPlastic(color: string, attenuationColor: string, attenuationDistance: number, transmission = 0.86): SurfaceFinish {
  return {
    color,
    metalness: 0,
    roughness: 0.08,
    transmission,
    thickness: 0.35,
    ior: 1.48,
    attenuationColor,
    attenuationDistance,
    envMapIntensity: 1,
  };
}

function matteCard(color: string, attenuationColor: string, attenuationDistance: number, transmission = 0.78): SurfaceFinish {
  return {
    color,
    metalness: 0,
    roughness: 0.14,
    transmission,
    thickness: 0.008,
    ior: 1.46,
    attenuationColor,
    attenuationDistance,
    envMapIntensity: 0.05,
    specularIntensity: 0.16,
  };
}

function matteClear(color: string, attenuationColor: string, attenuationDistance: number, transmission = 0.82): SurfaceFinish {
  return {
    ...clearPlastic(color, attenuationColor, attenuationDistance, transmission),
    roughness: 0.1,
    thickness: 0.016,
    ior: 1.48,
    envMapIntensity: 0.06,
    specularIntensity: 0.28,
  };
}

export const BEZEL_OPTIONS: { id: BezelColor; name: string; finish: SurfaceFinish }[] = [
  { id: 'black', name: 'Black', finish: solid('#1c1c1c', 0.04, 0.55, 0.15) },
  { id: 'red', name: 'Red', finish: solid('#a43133', 0.04, 0.48, 0.2) },
  { id: 'translucent', name: 'Translucent', finish: matteClear('#f7f7f8', '#ffffff', 0.06, 0.9) },
  { id: 'orange', name: 'Orange', finish: solid('#ff5a1f', 0.04, 0.48, 0.2) },
  { id: 'lavender', name: 'Lavender', finish: solid('#c9b6ea', 0.04, 0.5, 0.2) },
  { id: 'gray', name: 'Gray', finish: solid('#8d929a', 0.06, 0.5, 0.2) },
  { id: 'translucent-orange', name: 'Translucent Orange', finish: matteClear('#ffb088', '#ff4d00', 0.22, 0.84) },
  { id: 'translucent-purple', name: 'Translucent Purple', finish: matteClear('#d7c4ff', '#7a3dff', 0.28, 0.84) },
  { id: 'translucent-green', name: 'Translucent Green', finish: matteClear('#b7f0c4', '#1fa85a', 0.28, 0.84) },
  { id: 'translucent-black', name: 'Translucent Black', finish: matteClear('#dedee2', '#b4b4b8', 0.06, 0.9) },
];

export const BEZEL_FINISHES: Record<BezelColor, SurfaceFinish> = Object.fromEntries(
  BEZEL_OPTIONS.map((option) => [option.id, option.finish]),
) as Record<BezelColor, SurfaceFinish>;

const BEZEL_ALIASES: Record<string, BezelColor> = {
  white: 'gray',
  green: 'translucent-green',
};

export function parseBezelColor(value: string | null): BezelColor | null {
  if (!value) return null;
  const aliased = BEZEL_ALIASES[value] ?? value;
  return BEZEL_OPTIONS.some((option) => option.id === aliased) ? (aliased as BezelColor) : null;
}

const KEY_GRAPHITE = solid('#2a2c30', 0.02, 0.48, 0.16);
const KEY_BLACK = solid('#232528', 0.02, 0.46, 0.16);
const KEY_GRAY = solid('#8a8e94', 0.02, 0.5, 0.12);
const KEY_LAVENDER = solid('#7d76b0', 0.02, 0.5, 0.12);
const KEY_ORANGE = solid('#e04a18', 0.02, 0.46, 0.14);
const KEY_CLEAR = { ...clearPlastic('#ffffff', '#ffffff', 4, 0.98), thickness: 0.003, roughness: 0.04 };

export const KEYBOARD_OPTIONS: { id: KeyboardColor; name: string; finish: SurfaceFinish }[] = [
  { id: 'graphite', name: 'Graphite', finish: KEY_GRAPHITE },
  { id: 'gray-black', name: 'Gray/Black', finish: KEY_GRAY },
  { id: 'lavender-black', name: 'Lavender/Black', finish: KEY_LAVENDER },
  { id: 'blank', name: 'Blank', finish: KEY_GRAPHITE },
  { id: 'clear', name: 'Transparent', finish: KEY_CLEAR },
];

const KEYBOARD_ALIASES: Record<string, KeyboardColor> = {
  black: 'graphite',
  gray: 'gray-black',
  transparent: 'clear',
  lavender: 'lavender-black',
};

export function keySurface(color: KeyboardColor, label: string, role: 'letter' | 'edge' | 'mark'): SurfaceFinish {
  switch (color) {
    case 'graphite':
    case 'blank':
      return KEY_GRAPHITE;
    case 'clear':
      return KEY_CLEAR;
    case 'gray-black':
      if (label === 'f12' || label === 'super') return KEY_ORANGE;
      return role === 'edge' ? KEY_GRAY : KEY_BLACK;
    case 'lavender-black':
      if (label === 'f12' || label === 'super' || role === 'edge') return KEY_LAVENDER;
      return KEY_BLACK;
    default: {
      const unreachable: never = color;
      return unreachable;
    }
  }
}

export function legendInk(color: KeyboardColor, label: string, role: 'letter' | 'edge' | 'mark'): string {
  void label;
  void role;
  switch (color) {
    case 'graphite':
    case 'blank':
    case 'clear':
    case 'gray-black':
    case 'lavender-black':
      return '#ffffff';
    default: {
      const unreachable: never = color;
      return unreachable;
    }
  }
}

export function parseKeyboardColor(value: string | null): KeyboardColor | null {
  if (!value) return null;
  const aliased = KEYBOARD_ALIASES[value] ?? value;
  return KEYBOARD_OPTIONS.some((option) => option.id === aliased) ? (aliased as KeyboardColor) : null;
}

export const CAMERA_PRESETS: Record<string, CameraPosition> = {
  front: { x: 0.8, y: 2.7, z: -4.5 },
  rear: { x: 0, y: 2.2, z: 5 },
  left: { x: -5, y: 2.2, z: 0 },
  right: { x: 5, y: 2.2, z: 0 },
  top: { x: 0, y: 6, z: 0 },
  bottom: { x: 0.55, y: -4.2, z: 1.15 },
  open: { x: 0.8, y: 2.7, z: -4.5 },
  closed: { x: 0.8, y: 2.7, z: -4.5 },
};

export const ENVIRONMENTS: Record<string, Environment> = {
  studio: {
    name: 'studio',
    background: '#f5f5f5',
    ambientLight: 0.5,
    directionalLight: 1,
    showGrid: false,
    gridColor: '#e5e7eb',
  },
  'dark-studio': {
    name: 'dark-studio',
    background: '#1a1a1a',
    ambientLight: 0.3,
    directionalLight: 0.8,
    showGrid: false,
    gridColor: '#2d2d2d',
  },
  desk: {
    name: 'desk',
    background: '#8b7355',
    ambientLight: 0.4,
    directionalLight: 0.9,
    showGrid: false,
    gridColor: '#6b5344',
  },
  floating: {
    name: 'floating',
    background: '#0f172a',
    ambientLight: 0.3,
    directionalLight: 1,
    showGrid: true,
    gridColor: '#1e293b',
  },
  blueprint: {
    name: 'blueprint',
    background: '#1e3a5f',
    ambientLight: 0.4,
    directionalLight: 0.7,
    showGrid: true,
    gridColor: '#2563eb',
  },
};

export const EXPANSION_CARDS: ExpansionCard[] = [
  { id: 'empty', name: 'Empty', icon: '○' },
  { id: 'usb-c', name: 'USB-C', icon: '⚡' },
  { id: 'usb-a', name: 'USB-A', icon: '🔌' },
  { id: 'hdmi', name: 'HDMI', icon: '📺' },
  { id: 'displayport', name: 'DisplayPort', icon: '🖥️' },
  { id: 'ethernet', name: 'Ethernet', icon: '🌐' },
  { id: 'sd-card', name: 'SD', icon: '💾' },
  { id: 'microsd', name: 'MicroSD', icon: '📱' },
  { id: 'audio-jack', name: 'Audio', icon: '🎧' },
];

const METAL = ['aluminum-graphite', 'aluminum-silver'] as const;
const USB_A_COLORS = ['black', 'aluminum-graphite', 'lavender', 'aluminum-silver', 'sage', 'bubblegum', 'gray'] as const;
const USB_C_COLORS = [
  'aluminum-graphite',
  'aluminum-silver',
  'orange',
  'lavender',
  'sage',
  'bubblegum',
  'black',
  'gray',
  'translucent',
  'translucent-orange',
  'translucent-green',
  'translucent-purple',
  'translucent-black',
  'translucent-pink',
] as const;

export const CARD_FINISH_OPTIONS: Record<ExpansionCardType, readonly CardFinishId[]> = {
  empty: [],
  'usb-c': USB_C_COLORS,
  'usb-a': USB_A_COLORS,
  hdmi: METAL,
  displayport: METAL,
  ethernet: METAL,
  'sd-card': METAL,
  microsd: METAL,
  'audio-jack': METAL,
};

export const CARD_FINISHES: Record<CardFinishId, { name: string; finish: SurfaceFinish }> = {
  'aluminum-graphite': { name: 'Aluminum Graphite', finish: solid('#2e3032', 0.08, 0.6, 0.1) },
  'aluminum-silver': { name: 'Aluminum Silver', finish: solid('#d5d8dc', 0.82, 0.28, 0.55) },
  orange: { name: 'Orange', finish: solid('#ff5a1f', 0.02, 0.52, 0.15) },
  lavender: { name: 'Lavender', finish: solid('#c9b6ea', 0.02, 0.52, 0.15) },
  sage: { name: 'Sage', finish: solid('#a3b39a', 0.02, 0.55, 0.15) },
  bubblegum: { name: 'Bubblegum', finish: solid('#f3a4c8', 0.02, 0.5, 0.15) },
  black: { name: 'Black', finish: solid('#1c1c1c', 0.04, 0.55, 0.15) },
  gray: { name: 'Gray', finish: solid('#8d929a', 0.06, 0.5, 0.2) },
  translucent: { name: 'Translucent', finish: matteCard('#f4f4f6', '#ffffff', 0.08, 0.8) },
  'translucent-orange': { name: 'Translucent Orange', finish: matteCard('#ffb088', '#ff4d00', 0.12, 0.78) },
  'translucent-green': { name: 'Translucent Green', finish: matteCard('#b7f0c4', '#1fa85a', 0.12, 0.78) },
  'translucent-purple': { name: 'Translucent Purple', finish: matteCard('#d7c4ff', '#7a3dff', 0.12, 0.78) },
  'translucent-black': { name: 'Translucent Black', finish: matteCard('#b9b9bd', '#3a3a3e', 0.07, 0.7) },
  'translucent-pink': { name: 'Translucent Pink', finish: matteCard('#ffc4e4', '#ff5aa8', 0.12, 0.78) },
};

export function defaultCardColor(card: ExpansionCardType): CardFinishId {
  return CARD_FINISH_OPTIONS[card][0] ?? 'aluminum-graphite';
}

export function isCardFinish(value: string): value is CardFinishId {
  return value in CARD_FINISHES;
}

export function isExpansionCard(value: string): value is ExpansionCardType {
  return EXPANSION_CARDS.some((card) => card.id === value);
}

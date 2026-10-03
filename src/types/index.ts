export type BezelColor =
  | 'black'
  | 'red'
  | 'translucent'
  | 'orange'
  | 'lavender'
  | 'gray'
  | 'translucent-orange'
  | 'translucent-purple'
  | 'translucent-green'
  | 'translucent-black';

export type KeyboardColor = 'graphite' | 'gray-black' | 'lavender-black' | 'blank' | 'clear';

export type ExpansionCardType =
  | 'usb-c'
  | 'usb-a'
  | 'hdmi'
  | 'displayport'
  | 'ethernet'
  | 'sd-card'
  | 'microsd'
  | 'audio-jack'
  | 'empty';

export type CardFinishId =
  | 'aluminum-graphite'
  | 'aluminum-silver'
  | 'orange'
  | 'lavender'
  | 'sage'
  | 'bubblegum'
  | 'black'
  | 'gray'
  | 'translucent'
  | 'translucent-orange'
  | 'translucent-green'
  | 'translucent-purple'
  | 'translucent-black'
  | 'translucent-pink';

export interface SurfaceFinish {
  color: string;
  metalness: number;
  roughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  attenuationColor: string;
  attenuationDistance: number;
  envMapIntensity: number;
  specularIntensity?: number;
}
export type CameraPreset = 'front' | 'rear' | 'left' | 'right' | 'top' | 'bottom' | 'open' | 'closed';
export type EnvironmentPreset = 'studio' | 'dark-studio' | 'desk' | 'floating' | 'blueprint';

export interface LaptopModel {
  id: string;
  name: string;
  glbPath: string;
  slots: number;
}

export interface ExpansionCard {
  id: ExpansionCardType;
  name: string;
  icon: string;
}

export interface ExpansionSlot {
  id: number;
  card: ExpansionCardType;
  color: CardFinishId;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

export interface Environment {
  name: EnvironmentPreset;
  background: string;
  ambientLight: number;
  directionalLight: number;
  showGrid: boolean;
  gridColor: string;
}

export interface ConfiguratorState {
  bezelColor: BezelColor;
  keyboardColor: KeyboardColor;
  expansionCards: ExpansionSlot[];
  isOpen: boolean;
  cameraPreset: CameraPreset;
  environment: EnvironmentPreset;
}

export interface BezelColors {
  [key: string]: string;
}

export interface KeyboardColors {
  [key: string]: string;
}

import { create } from 'zustand';
import {
  ConfiguratorState,
  BezelColor,
  KeyboardColor,
  ExpansionCardType,
  ExpansionSlot,
  CardFinishId,
  CameraPreset,
  EnvironmentPreset,
} from '../types';
import {
  CARD_FINISH_OPTIONS,
  defaultCardColor,
  isCardFinish,
  isExpansionCard,
  parseBezelColor,
  parseKeyboardColor,
} from '../lib/constants';

function readSlots(value: string | null): ExpansionSlot[] | null {
  if (!value) return null;
  const parts = value.split(',');
  if (parts.length !== 4) return null;

  const slots = parts.map((part, id) => {
    const [cardValue, colorValue] = part.split(':');
    if (!cardValue || !isExpansionCard(cardValue)) return null;
    const allowed = colorValue && isCardFinish(colorValue) ? colorValue : defaultCardColor(cardValue);
    return { id, card: cardValue, color: allowed };
  });

  if (slots.some((slot) => slot === null)) return null;
  return slots as ExpansionSlot[];
}

function readUrl(): Partial<ConfiguratorState> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const bezelColor = parseBezelColor(params.get('bezel'));
  const keyboardColor = parseKeyboardColor(params.get('keyboard'));
  const expansionCards = readSlots(params.get('cards'));
  return {
    ...(bezelColor ? { bezelColor } : {}),
    ...(keyboardColor ? { keyboardColor } : {}),
    ...(expansionCards ? { expansionCards } : {}),
  };
}

const getInitialState = (): ConfiguratorState => {
  return {
    bezelColor: 'black',
    keyboardColor: 'graphite',
    expansionCards: Array.from({ length: 4 }, (_, id) => ({
      id,
      card: 'empty' as const,
      color: 'aluminum-graphite' as const,
    })),
    isOpen: true,
    cameraPreset: 'front',
    environment: 'studio',
    ...readUrl(),
  };
};

interface ConfiguratorActions {
  setBezelColor: (color: BezelColor) => void;
  setKeyboardColor: (color: KeyboardColor) => void;
  setExpansionCard: (slotId: number, card: ExpansionCardType) => void;
  setExpansionCardColor: (slotId: number, color: CardFinishId) => void;
  setIsOpen: (isOpen: boolean) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  releaseCamera: () => void;
  setEnvironment: (environment: EnvironmentPreset) => void;
  resetConfiguration: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState & ConfiguratorActions>((set) => ({
  ...getInitialState(),

  setBezelColor: (bezelColor) => {
    set({ bezelColor });
  },

  setKeyboardColor: (keyboardColor) => {
    set({ keyboardColor });
  },

  setExpansionCard: (slotId, card) => {
    set((state) => ({
      expansionCards: state.expansionCards.map((slot) => {
        if (slot.id !== slotId) return slot;
        const color = CARD_FINISH_OPTIONS[card].includes(slot.color) ? slot.color : defaultCardColor(card);
        return { ...slot, card, color };
      }),
    }));
  },

  setExpansionCardColor: (slotId, color) => {
    set((state) => ({
      expansionCards: state.expansionCards.map((slot) =>
        slot.id === slotId ? { ...slot, color } : slot,
      ),
    }));
  },

  setIsOpen: (isOpen) => {
    set({ isOpen });
  },

  setCameraPreset: (cameraPreset) => {
    set({ cameraPreset });
  },

  releaseCamera: () => {
    set({ cameraPreset: null });
  },

  setEnvironment: (environment) => {
    set({ environment });
  },

  resetConfiguration: () => {
    set({
      bezelColor: 'black',
      keyboardColor: 'graphite',
      expansionCards: Array.from({ length: 4 }, (_, id) => ({
        id,
        card: 'empty' as const,
        color: 'aluminum-graphite' as const,
      })),
      isOpen: true,
      cameraPreset: 'front',
      environment: 'studio',
    });
  },
}));

function writeUrl(state: ConfiguratorState) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  params.set('bezel', state.bezelColor);
  params.set('keyboard', state.keyboardColor);
  params.set('cards', state.expansionCards.map((slot) => `${slot.card}:${slot.color}`).join(','));
  const next = `${window.location.pathname}?${params.toString()}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next !== current) window.history.replaceState(null, '', next);
}

writeUrl(useConfiguratorStore.getState());
useConfiguratorStore.subscribe((state) => {
  writeUrl(state);
});

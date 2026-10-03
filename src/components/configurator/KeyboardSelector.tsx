import { useConfiguratorStore } from '../../store/configuratorStore';
import { KEYBOARD_OPTIONS } from '../../lib/constants';
import { Section } from '../ui/Section';
import type { KeyboardColor } from '../../types';

const NOTES: Record<KeyboardColor, string> = {
  graphite: 'Every key in dark graphite',
  'gray-black': 'Gray edges, black letters, orange super',
  'lavender-black': 'Lavender edges, black letters',
  blank: 'Dark keys with no legends',
  clear: 'Clear caps, switches visible',
};

const PREVIEW: Record<KeyboardColor, [string, string, string]> = {
  graphite: ['#2a2c30', '#2a2c30', '#2a2c30'],
  'gray-black': ['#8a8e94', '#232528', '#e04a18'],
  'lavender-black': ['#7d76b0', '#232528', '#7d76b0'],
  blank: ['#2a2c30', '#2a2c30', '#2a2c30'],
  clear: ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.72)'],
};

export default function KeyboardSelector() {
  const { keyboardColor, setKeyboardColor } = useConfiguratorStore();
  const selected = KEYBOARD_OPTIONS.find((option) => option.id === keyboardColor) ?? KEYBOARD_OPTIONS[0];

  return (
    <Section title="Keyboard" value={selected.name}>
      <div className="space-y-2">
        {KEYBOARD_OPTIONS.map((option) => {
          const selectedOption = keyboardColor === option.id;
          const [edge, letter, mark] = PREVIEW[option.id];
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selectedOption}
              onClick={() => setKeyboardColor(option.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selectedOption ? 'bg-stage' : 'hover:bg-black/[0.03]'
              }`}
            >
              <span className="flex shrink-0 gap-0.5 rounded-md bg-white p-1" aria-hidden="true">
                {[edge, letter, mark].map((color, index) => (
                  <span
                    key={index}
                    className="h-4 w-3 rounded-[3px] border border-black/10"
                    style={{ background: color }}
                  />
                ))}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-ink">{option.name}</span>
                <span className="block truncate text-[11px] text-muted">{NOTES[option.id]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

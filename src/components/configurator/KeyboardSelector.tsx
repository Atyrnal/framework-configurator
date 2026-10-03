import { useConfiguratorStore } from '../../store/configuratorStore';
import { KEYBOARD_OPTIONS } from '../../lib/constants';
import { ColorSwatch } from '../ui/ColorSwatch';

export default function KeyboardSelector() {
  const { keyboardColor, setKeyboardColor } = useConfiguratorStore();
  const selected = KEYBOARD_OPTIONS.find((option) => option.id === keyboardColor) ?? KEYBOARD_OPTIONS[0];

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Keyboard</h2>
        <span className="truncate text-xs text-zinc-700">{selected.name}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {KEYBOARD_OPTIONS.map((option) => (
          <ColorSwatch
            key={option.id}
            name={option.name}
            finish={option.finish}
            selected={keyboardColor === option.id}
            onSelect={() => setKeyboardColor(option.id)}
          />
        ))}
      </div>
    </section>
  );
}

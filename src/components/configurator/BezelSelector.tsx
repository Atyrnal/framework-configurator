import { useConfiguratorStore } from '../../store/configuratorStore';
import { BEZEL_OPTIONS } from '../../lib/constants';
import { ColorSwatch } from '../ui/ColorSwatch';

export default function BezelSelector() {
  const { bezelColor, setBezelColor } = useConfiguratorStore();
  const selected = BEZEL_OPTIONS.find((option) => option.id === bezelColor) ?? BEZEL_OPTIONS[0];

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Bezel</h2>
        <span className="truncate text-xs text-zinc-700">{selected.name}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BEZEL_OPTIONS.map((option) => (
          <ColorSwatch
            key={option.id}
            name={option.name}
            finish={option.finish}
            selected={bezelColor === option.id}
            onSelect={() => setBezelColor(option.id)}
          />
        ))}
      </div>
    </section>
  );
}

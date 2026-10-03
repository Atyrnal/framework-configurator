import { useConfiguratorStore } from '../../store/configuratorStore';
import { BEZEL_OPTIONS } from '../../lib/constants';
import { ColorSwatch } from '../ui/ColorSwatch';
import { Section } from '../ui/Section';

export default function BezelSelector() {
  const { bezelColor, setBezelColor } = useConfiguratorStore();
  const selected = BEZEL_OPTIONS.find((option) => option.id === bezelColor) ?? BEZEL_OPTIONS[0];

  return (
    <Section title="Bezel" value={selected.name}>
      <div className="flex flex-wrap gap-0.5">
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
    </Section>
  );
}

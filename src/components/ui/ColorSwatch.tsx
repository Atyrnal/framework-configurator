import type { SurfaceFinish } from '../../types';

interface ColorSwatchProps {
  name: string;
  finish: SurfaceFinish;
  selected: boolean;
  onSelect: () => void;
}

export function ColorSwatch({ name, finish, selected, onSelect }: ColorSwatchProps) {
  const glassy = finish.transmission > 0.2;

  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={selected}
      onClick={onSelect}
      className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className={`h-5 w-5 rounded-full border border-ink/10 ${
          selected ? 'ring-1 ring-ink ring-offset-2 ring-offset-paper' : ''
        }`}
        style={{
          background: glassy
            ? `linear-gradient(145deg, ${finish.color}ee, ${finish.color}66 58%, rgba(255,255,255,0.9))`
            : finish.color,
        }}
      />
    </button>
  );
}

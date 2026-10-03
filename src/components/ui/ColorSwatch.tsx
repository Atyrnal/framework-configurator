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
      className={`h-6 w-6 shrink-0 rounded-full border transition-shadow ${
        selected ? 'border-zinc-900 ring-2 ring-orange-500 ring-offset-1' : 'border-black/15 hover:border-zinc-400'
      }`}
      style={{
        background: glassy
          ? `linear-gradient(145deg, ${finish.color}ee, ${finish.color}66 58%, rgba(255,255,255,0.85))`
          : finish.color,
      }}
    />
  );
}

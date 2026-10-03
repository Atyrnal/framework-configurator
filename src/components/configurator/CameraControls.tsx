import type { ReactNode } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';

type ViewIconName = 'front' | 'rear' | 'left' | 'right' | 'top' | 'bottom' | 'open' | 'close';

function ViewIcon({ view }: { view: ViewIconName }) {
  const side = (
    <>
      <path d="M3.5 17h13" />
      <path d="M13.5 17 6 7.5" />
    </>
  );

  let body: ReactNode;
  switch (view) {
    case 'front':
      body = (
        <>
          <path d="M7.5 16V7h9v9" />
          <path d="M4 16h16" />
        </>
      );
      break;
    case 'rear':
      body = (
        <>
          <path d="M7.5 6.5h9V16h-9Z" />
          <circle cx="12" cy="11" r="0.9" fill="currentColor" stroke="none" />
          <path d="M5 17.5h14" />
        </>
      );
      break;
    case 'left':
      body = side;
      break;
    case 'right':
      body = <g transform="translate(24 0) scale(-1 1)">{side}</g>;
      break;
    case 'top':
      body = (
        <>
          <rect x="3" y="6.5" width="18" height="11" rx="1.5" />
          <rect x="9.5" y="12.2" width="5" height="2.8" rx="0.45" />
        </>
      );
      break;
    case 'bottom':
      body = (
        <>
          <rect x="3" y="6.5" width="18" height="11" rx="1.5" />
          <path d="M6.5 14.2h2.4M15.1 14.2h2.4" />
        </>
      );
      break;
    case 'open':
      body = (
        <>
          <path d="M4 17h13" />
          <path d="M14 17 7 8" />
        </>
      );
      break;
    case 'close':
      body = (
        <>
          <path d="M4 13h13" />
          <path d="M4 17h13" />
        </>
      );
      break;
    default: {
      const unreachable: never = view;
      return unreachable;
    }
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {body}
    </svg>
  );
}

function ViewButton({
  label,
  pressed,
  marked = false,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  marked?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        marked ? 'bg-ink text-white' : 'text-ink/70 hover:bg-black/[0.04] hover:text-ink'
      }`}
    >
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
      {children}
    </button>
  );
}

export default function CameraControls() {
  const { cameraPreset, setCameraPreset, isOpen, setIsOpen } = useConfiguratorStore();

  const presets = [
    { id: 'front', name: 'Front' },
    { id: 'rear', name: 'Rear' },
    { id: 'left', name: 'Left' },
    { id: 'right', name: 'Right' },
    { id: 'top', name: 'Top' },
    { id: 'bottom', name: 'Bottom' },
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3 lg:bottom-5">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/80 p-1 shadow-dock backdrop-blur-xl" aria-label="View controls">
        {presets.map((preset) => (
          <ViewButton
            key={preset.id}
            label={preset.name}
            pressed={cameraPreset === preset.id}
            marked={cameraPreset === preset.id}
            onClick={() => setCameraPreset(preset.id)}
          >
            <ViewIcon view={preset.id} />
          </ViewButton>
        ))}
        <span className="mx-1 h-4 w-px shrink-0 bg-black/10" />
        <ViewButton
          label={isOpen ? 'Close' : 'Open'}
          pressed={isOpen}
          marked={false}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ViewIcon view={isOpen ? 'close' : 'open'} />
        </ViewButton>
      </div>
    </div>
  );
}

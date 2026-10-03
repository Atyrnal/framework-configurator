import { useConfiguratorStore } from '../../store/configuratorStore';

type ViewIconName = 'front' | 'rear' | 'left' | 'right' | 'top' | 'bottom' | 'open' | 'close';

function ViewIcon({ view }: { view: ViewIconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden="true" {...common}>
      {view === 'front' && <><rect x="5" y="3.5" width="14" height="11" rx="1.2" /><path d="M3 17h18l-2 3H5l-2-3Z" /><path d="M9 17v1m6-1v1" /></>}
      {view === 'rear' && <><rect x="5" y="3.5" width="14" height="11" rx="1.2" /><circle cx="12" cy="9" r="1.5" /><path d="M3 17h18l-2 3H5l-2-3Z" /></>}
      {(view === 'left' || view === 'right') && <g transform={view === 'right' ? 'translate(24 0) scale(-1 1)' : undefined}>
        <path d="M3 16.5h18l-2 2H5l-2-2Z" /><path d="M15 16.5V6.2l-1.2-1.5H6v11.8" /><path d="M3.8 15h3.5" /><circle cx="5" cy="17.4" r="0.35" fill="currentColor" stroke="none" /><circle cx="7" cy="17.4" r="0.35" fill="currentColor" stroke="none" />
      </g>}
      {view === 'top' && <><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M6.5 7h11M6.5 9.5h11M6.5 12h11" /><rect x="8.5" y="14.5" width="7" height="4" rx=".7" /></>}
      {view === 'bottom' && <><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><rect x="3.5" y="6" width="2.2" height="4.2" rx="0.4" /><rect x="3.5" y="13.2" width="2.2" height="4.2" rx="0.4" /><rect x="18.3" y="6" width="2.2" height="4.2" rx="0.4" /><rect x="18.3" y="13.2" width="2.2" height="4.2" rx="0.4" /></>}
      {view === 'open' && <><rect x="5" y="3.5" width="14" height="11" rx="1.2" /><path d="M3 17h18l-2 3H5l-2-3Z" /><path d="M12 12V8m-2 2 2-2 2 2" /></>}
      {view === 'close' && <><path d="M3 15h18l-2 3H5l-2-3Z" /><path d="M5 13.5h14" /><path d="M12 4v6m-2-2 2 2 2-2" /></>}
    </svg>
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
    <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-gray-200 bg-white/90 p-1.5 shadow-lg backdrop-blur-md sm:right-4" aria-label="View controls">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={`${preset.name} view`}
          aria-label={`${preset.name} view`}
          aria-pressed={cameraPreset === preset.id}
          onClick={() => setCameraPreset(preset.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
            cameraPreset === preset.id
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ViewIcon view={preset.id} />
        </button>
      ))}
      <div className="mx-1 my-0.5 border-t border-gray-200" />
      <button
        type="button"
        title={isOpen ? 'Close laptop' : 'Open laptop'}
        aria-label={isOpen ? 'Close laptop' : 'Open laptop'}
        aria-pressed={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isOpen ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
      >
        <ViewIcon view={isOpen ? 'close' : 'open'} />
      </button>
    </div>
  );
}

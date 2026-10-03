import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { BEZEL_OPTIONS, KEYBOARD_OPTIONS } from '../../lib/constants';
import ConfiguratorSidebar from './ConfiguratorSidebar';

const OPEN_RATIO = 0.62;

export default function MobileConfigurator() {
  const headerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; height: number; moved: boolean } | null>(null);
  const heightRef = useRef(96);
  const [sheetHeight, setSheetHeight] = useState(96);
  heightRef.current = sheetHeight;
  const { bezelColor, keyboardColor } = useConfiguratorStore();
  const bezel = BEZEL_OPTIONS.find((option) => option.id === bezelColor)?.name ?? 'Bezel';
  const keyboard = KEYBOARD_OPTIONS.find((option) => option.id === keyboardColor)?.name ?? 'Keyboard';

  const collapsedHeight = () => headerRef.current?.offsetHeight ?? 96;
  const expanded = sheetHeight > collapsedHeight() + 36;

  useEffect(() => {
    const min = headerRef.current?.offsetHeight;
    if (min) setSheetHeight(min);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const apply = () => {
      if (!query.matches) {
        document.documentElement.style.removeProperty('--sheet');
        return;
      }
      document.documentElement.style.setProperty('--sheet', `${sheetHeight}px`);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 32);
    };
    apply();
    query.addEventListener('change', apply);
    return () => {
      query.removeEventListener('change', apply);
      document.documentElement.style.removeProperty('--sheet');
    };
  }, [sheetHeight]);

  const clamp = (height: number) => {
    const min = collapsedHeight();
    const max = Math.min(window.innerHeight * 0.86, 720);
    return Math.min(max, Math.max(min, height));
  };

  const openSheet = () => {
    setSheetHeight(clamp(Math.min(window.innerHeight * OPEN_RATIO, 640)));
  };

  const closeSheet = () => {
    setSheetHeight(collapsedHeight());
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { y: event.clientY, height: heightRef.current, moved: false };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable for some synthetic events.
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = drag.current;
    if (!active) return;
    const delta = active.y - event.clientY;
    if (Math.abs(delta) > 3) active.moved = true;
    if (!active.moved) return;
    setSheetHeight(clamp(active.height + delta));
  };

  const onPointerUp = () => {
    const active = drag.current;
    drag.current = null;
    if (!active) return;
    if (!active.moved) {
      if (heightRef.current > collapsedHeight() + 36) closeSheet();
      else openSheet();
      return;
    }
    if (heightRef.current < collapsedHeight() + 48) closeSheet();
  };

  return (
    <section
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden border-t border-line bg-paper shadow-sheet lg:hidden"
      style={{ height: sheetHeight }}
    >
      <div ref={headerRef} className="shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize configuration"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((sheetHeight / window.innerHeight) * 100)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex w-full cursor-ns-resize touch-none justify-center py-2.5"
        >
          <span className="h-1 w-8 rounded-full bg-ink/20" />
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">Laptop 13 Pro</p>
            <p className="truncate text-xs text-muted">{bezel} bezel · {keyboard}</p>
          </div>
          <button
            type="button"
            onClick={() => (expanded ? closeSheet() : openSheet())}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              expanded ? 'bg-stage text-ink' : 'bg-ink text-paper'
            }`}
          >
            {expanded ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>
      <div id="configurator-sheet" inert={!expanded ? true : undefined} className="min-h-0 flex-1 border-t border-line">
        <ConfiguratorSidebar compact />
      </div>
    </section>
  );
}

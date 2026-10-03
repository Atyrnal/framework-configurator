import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useConfiguratorStore } from '../../store/configuratorStore';

const STAGE = '#f3f1ee';

type ActionIconName = 'save' | 'link' | 'reset';
type ExportMode = 'stage' | 'transparent';

function ActionIcon({ name }: { name: ActionIconName }) {
  let body: ReactNode;
  switch (name) {
    case 'save':
      body = (
        <>
          <path d="M12 4.5v8" />
          <path d="m8.5 10 3.5 3.5L15.5 10" />
          <path d="M5.5 16.5h13" />
        </>
      );
      break;
    case 'link':
      body = (
        <>
          <path d="M10 14.5 8.2 16.3a3.2 3.2 0 0 1-4.5-4.5L5.5 10" />
          <path d="M14 9.5 15.8 7.7a3.2 3.2 0 0 1 4.5 4.5L18.5 14" />
          <path d="m9.5 14.5 5-5" />
        </>
      );
      break;
    case 'reset':
      body = (
        <>
          <path d="M7 8.5A5.5 5.5 0 1 1 6.2 13" />
          <path d="M7 5.5v3.2H3.8" />
        </>
      );
      break;
    default: {
      const unreachable: never = name;
      return unreachable;
    }
  }

  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {body}
    </svg>
  );
}

function caption(mode: ExportMode) {
  switch (mode) {
    case 'stage':
      return 'Keeps the gray stage behind the laptop, the way it looks on the page.';
    case 'transparent':
      return 'Removes the stage. The file background is transparent.';
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}

function captureExports(): { stage: string; transparent: string } | null {
  const canvas = document.querySelector('canvas');
  if (!canvas) return null;

  const stageCanvas = document.createElement('canvas');
  stageCanvas.width = canvas.width;
  stageCanvas.height = canvas.height;
  const stageCtx = stageCanvas.getContext('2d');
  if (!stageCtx) return null;
  stageCtx.fillStyle = STAGE;
  stageCtx.fillRect(0, 0, stageCanvas.width, stageCanvas.height);
  stageCtx.drawImage(canvas, 0, 0);

  const clearCanvas = document.createElement('canvas');
  clearCanvas.width = canvas.width;
  clearCanvas.height = canvas.height;
  const clearCtx = clearCanvas.getContext('2d');
  if (!clearCtx) return null;
  clearCtx.drawImage(canvas, 0, 0);
  const image = clearCtx.getImageData(0, 0, clearCanvas.width, clearCanvas.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
  }
  clearCtx.putImageData(image, 0, 0);

  return {
    stage: stageCanvas.toDataURL('image/png'),
    transparent: clearCanvas.toDataURL('image/png'),
  };
}

type ExportShots = { stage: string; transparent: string };

const listeners = new Set<() => void>();
let shots: ExportShots | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function currentShots() {
  return shots;
}

function openShots(next: ExportShots) {
  shots = next;
  listeners.forEach((listener) => listener());
}

function closeShots() {
  shots = null;
  listeners.forEach((listener) => listener());
}

function downloadPng(url: string) {
  const link = document.createElement('a');
  link.download = `framework-laptop-${Date.now()}.png`;
  link.href = url;
  link.click();
}

function ExportPreview({
  stageUrl,
  transparentUrl,
  onClose,
}: {
  stageUrl: string;
  transparentUrl: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ExportMode>('stage');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const url = mode === 'stage' ? stageUrl : transparentUrl;
  const option = 'h-8 rounded-lg text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-3 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-paper p-4 shadow-dock"
      >
        <h2 id="export-title" className="text-[15px] font-medium tracking-tight text-ink">Save image</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{caption(mode)}</p>
        <div role="radiogroup" aria-label="Background" className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-stage p-1">
          <button type="button" role="radio" aria-checked={mode === 'stage'} onClick={() => setMode('stage')} className={`${option} ${mode === 'stage' ? 'bg-ink text-white' : 'text-muted'}`}>
            With background
          </button>
          <button type="button" role="radio" aria-checked={mode === 'transparent'} onClick={() => setMode('transparent')} className={`${option} ${mode === 'transparent' ? 'bg-ink text-white' : 'text-muted'}`}>
            Transparent
          </button>
        </div>
        <div className={`mt-3 overflow-hidden rounded-xl ${mode === 'transparent' ? 'export-checker' : 'bg-stage'}`}>
          <img src={url} alt="" className="max-h-[46vh] w-full object-contain" />
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-3.5 py-2 text-[13px] text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              downloadPng(url);
              onClose();
            }}
            className="rounded-full bg-ink px-3.5 py-2 text-[13px] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Download
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ExportHost() {
  const preview = useSyncExternalStore(subscribe, currentShots);
  if (!preview) return null;
  return (
    <ExportPreview
      stageUrl={preview.stage}
      transparentUrl={preview.transparent}
      onClose={closeShots}
    />
  );
}

export default function ActionButtons() {
  const { resetConfiguration } = useConfiguratorStore();
  const [copied, setCopied] = useState(false);

  const shareConfiguration = () => {
    const url = window.location.href;
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    };
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(done).catch(() => undefined);
  };

  const openPreview = () => {
    const captured = captureExports();
    if (captured) openShots(captured);
  };

  const item = 'flex h-9 items-center gap-2 rounded-lg bg-stage px-2.5 text-left text-[12px] text-ink transition hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" onClick={openPreview} className={`${item} col-span-2`}>
          <ActionIcon name="save" />
          Save image
        </button>
        <button type="button" onClick={shareConfiguration} className={item}>
          <ActionIcon name="link" />
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button type="button" onClick={resetConfiguration} className={`${item} text-muted hover:text-ink`}>
          <ActionIcon name="reset" />
          Reset
        </button>
      </div>
    </>
  );
}

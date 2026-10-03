const MODELS = [
  { id: '13-pro', name: 'Framework 13 Pro', detail: '2.8K · 13.5″', soon: false },
  { id: '13', name: 'Framework 13', detail: 'Soon', soon: true },
  { id: '16', name: 'Framework 16', detail: 'Soon', soon: true },
] as const;

export default function ModelSelector() {
  return (
    <div>
      <h2 className="mb-2 text-[13px] font-medium tracking-tight text-ink">Model</h2>
      <div className="space-y-0.5">
        {MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            disabled={model.soon}
            aria-pressed={!model.soon}
            className={`flex h-9 w-full items-center justify-between gap-3 rounded-lg px-2.5 text-left ${
              model.soon ? 'cursor-default text-muted' : 'bg-stage text-ink'
            }`}
          >
            <span className="text-[13px]">{model.name}</span>
            <span className="text-[11px] text-muted">{model.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  value?: string;
  hint?: string;
  children: ReactNode;
}

export function Section({ title, value, hint, children }: SectionProps) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-medium tracking-tight text-ink">{title}</h2>
        {value && <p className="truncate text-xs text-muted">{value}</p>}
      </div>
      {children}
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-muted">{hint}</p>}
    </section>
  );
}

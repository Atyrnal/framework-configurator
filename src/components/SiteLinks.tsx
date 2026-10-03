const REPO_URL = 'https://github.com/durguto/framework-configurator';
const DURGUTO_URL = 'https://durguto.com';

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function GithubLink({ floating = false }: { floating?: boolean }) {
  if (floating) {
    return (
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
        className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.06] bg-white/80 text-ink/80 shadow-dock backdrop-blur-xl transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          GitHub
        </span>
        <GithubIcon />
      </a>
    );
  }

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] text-ink/70 transition hover:bg-black/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <GithubIcon />
      durguto/framework-configurator
    </a>
  );
}

export function DurgutoLink() {
  return (
    <a
      href={DURGUTO_URL}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      durguto.com
    </a>
  );
}

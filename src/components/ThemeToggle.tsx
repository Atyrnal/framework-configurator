import { toggleTheme, useDark } from '../lib/theme';

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16.5 14.2A6.2 6.2 0 0 1 9.8 7.5 6.2 6.2 0 1 0 16.5 14.2Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.5v1.8M12 17.7v1.8M4.5 12h1.8M17.7 12h1.8M6.7 6.7l1.3 1.3M16 16l1.3 1.3M17.3 6.7 16 8M8 16l-1.3 1.3" />
    </svg>
  );
}

export function ThemeToggle({ floating = false }: { floating?: boolean }) {
  const dark = useDark();
  const label = dark ? 'Light mode' : 'Dark mode';

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={dark}
      onClick={toggleTheme}
      className={
        floating
          ? 'flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-paper/80 text-ink/80 shadow-dock backdrop-blur-xl transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/70 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      }
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

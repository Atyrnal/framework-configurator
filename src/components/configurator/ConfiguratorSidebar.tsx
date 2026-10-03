import ModelSelector from './ModelSelector';
import BezelSelector from './BezelSelector';
import KeyboardSelector from './KeyboardSelector';
import ExpansionCardSelector from './ExpansionCardSelector';
import ActionButtons, { ExportHost } from './ActionButtons';
import { DurgutoLink, GithubLink } from '../SiteLinks';
import { ThemeToggle } from '../ThemeToggle';

interface ConfiguratorSidebarProps {
  compact?: boolean;
}

export default function ConfiguratorSidebar({ compact = false }: ConfiguratorSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-paper">
      {!compact && (
        <div className="flex items-center justify-between gap-2 px-2.5 pt-2.5">
          <GithubLink />
          <ThemeToggle />
        </div>
      )}
      <div className="panel-scroll min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-4">
        <ModelSelector />
        <BezelSelector />
        <KeyboardSelector />
        <ExpansionCardSelector />
        {compact && (
          <>
            <ActionButtons />
            <DurgutoLink />
          </>
        )}
      </div>
      {!compact && <ExportHost />}
      {!compact && (
        <footer className="border-t border-line px-4 py-3">
          <ActionButtons />
          <div className="mt-3">
            <DurgutoLink />
          </div>
        </footer>
      )}
    </div>
  );
}

import ModelSelector from './ModelSelector';
import BezelSelector from './BezelSelector';
import KeyboardSelector from './KeyboardSelector';
import ExpansionCardSelector from './ExpansionCardSelector';
import ActionButtons from './ActionButtons';

export default function ConfiguratorSidebar() {
  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col border-r border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h1 className="text-base font-semibold tracking-tight text-zinc-900">Framework</h1>
        <p className="text-[11px] text-zinc-500">Configure your laptop</p>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <ModelSelector />
        <BezelSelector />
        <KeyboardSelector />
        <ExpansionCardSelector />
        <ActionButtons />
      </div>
    </div>
  );
}

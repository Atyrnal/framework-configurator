import Viewer3D from './components/viewer/Viewer3D';
import ConfiguratorSidebar from './components/configurator/ConfiguratorSidebar';
import MobileConfigurator from './components/configurator/MobileConfigurator';
import { GithubLink } from './components/SiteLinks';
import { ThemeToggle } from './components/ThemeToggle';

export default function App() {
  return (
    <div className="relative h-dvh overflow-hidden bg-stage text-ink lg:flex">
      <aside className="hidden h-full w-[340px] shrink-0 border-r border-line bg-paper lg:flex lg:flex-col">
        <ConfiguratorSidebar />
      </aside>
      <main className="relative h-full min-w-0 overflow-hidden lg:flex-1">
        <div className="absolute left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex items-center gap-2 lg:hidden">
          <GithubLink floating />
          <ThemeToggle floating />
        </div>
        <Viewer3D />
      </main>
      <MobileConfigurator />
    </div>
  );
}

import Viewer3D from './components/viewer/Viewer3D';
import ConfiguratorSidebar from './components/configurator/ConfiguratorSidebar';

export default function App() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-50">
      <ConfiguratorSidebar />
      <div className="flex-1 relative">
        <Viewer3D />
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { ChaseSettingsPanel } from './components/ChaseSettingsPanel';
import { IOSettingsPanel } from './components/IOSettingsPanel';
import { PanelGrid } from './components/PanelGrid';
import { PresetSidebar } from './components/PresetSidebar';
import { StatusPanel } from './components/StatusPanel';
import { TopBar } from './components/TopBar';
import { TransportControls } from './components/TransportControls';
import { useAppStore } from './store/useAppStore';

const App = (): JSX.Element => {
  const setFromMain = useAppStore((s) => s.setFromMain);

  useEffect(() => {
    window.chaserApi.getState().then((state) => setFromMain(state));
    window.chaserApi.onState((state) => setFromMain(state as any));
    window.chaserApi.onDebug((item) => {
      useAppStore.setState((prev) => ({ debug: [item as any, ...prev.debug].slice(0, 20) }));
    });
  }, [setFromMain]);

  return (
    <div className="app-root">
      <TopBar />
      <div className="layout">
        <main>
          <TransportControls />
          <ChaseSettingsPanel />
          <PanelGrid />
          <IOSettingsPanel />
          <StatusPanel />
        </main>
        <PresetSidebar />
      </div>
    </div>
  );
};

export default App;

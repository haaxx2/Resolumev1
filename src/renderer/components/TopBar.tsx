import { APP_NAME } from '../../shared/constants';
import { useAppStore } from '../store/useAppStore';

export const TopBar = (): JSX.Element => {
  const savePresetAs = useAppStore((s) => s.savePresetAs);
  const loadPreset = useAppStore((s) => s.loadPreset);
  const running = useAppStore((s) => s.transportState.running);
  const paused = useAppStore((s) => s.transportState.paused);

  return (
    <header className="topbar">
      <h1>{APP_NAME}</h1>
      <div className="topbar-actions">
        <button onClick={() => void loadPreset()}>Load Preset</button>
        <button onClick={() => void savePresetAs()}>Save As</button>
        <div className={`status-pill ${running ? 'running' : 'stopped'}`}>
          {running ? (paused ? 'Paused' : 'Running') : 'Stopped'}
        </div>
      </div>
    </header>
  );
};

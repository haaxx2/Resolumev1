import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const PresetSidebar = (): JSX.Element => {
  const presets = useAppStore((s) => s.presets);
  const listPresets = useAppStore((s) => s.listPresets);
  const loadPreset = useAppStore((s) => s.loadPreset);
  const deletePreset = useAppStore((s) => s.deletePreset);

  useEffect(() => {
    void listPresets();
  }, [listPresets]);

  return (
    <aside className="sidebar">
      <h2>Scenes / Presets</h2>
      <button onClick={() => void loadPreset()}>Load...</button>
      <ul>
        {presets.map((preset) => (
          <li key={preset}>
            <span>{preset}</span>
            <button onClick={() => void deletePreset(preset)}>Delete</button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

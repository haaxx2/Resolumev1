import { PanelCard } from './PanelCard';
import { useAppStore } from '../store/useAppStore';

export const PanelGrid = (): JSX.Element => {
  const panels = useAppStore((s) => s.panels);
  const setPanels = useAppStore((s) => s.setPanels);

  const toggleManual = (panelId: string): void => {
    const next = panels.map((panel) => panel.id === panelId ? { ...panel, active: !panel.active } : panel);
    void setPanels(next);
  };

  return (
    <section className="panel-block">
      <h2>Panel Grid</h2>
      <div className="panel-grid">
        {panels.map((panel) => (
          <PanelCard key={panel.id} panel={panel} onToggle={toggleManual} />
        ))}
      </div>
    </section>
  );
};

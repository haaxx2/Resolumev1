import type { Panel } from '../../shared/types';

interface Props {
  panel: Panel;
  onToggle: (panelId: string) => void;
}

export const PanelCard = ({ panel, onToggle }: Props): JSX.Element => (
  <button className={`panel-card ${panel.active ? 'active' : ''}`} onClick={() => onToggle(panel.id)}>
    <div>{panel.name}</div>
    <small>Group {panel.group}</small>
  </button>
);

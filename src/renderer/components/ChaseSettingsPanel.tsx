import type { ChaseMode } from '../../shared/types';
import { useAppStore } from '../store/useAppStore';

const MODES: ChaseMode[] = ['left-to-right', 'right-to-left', 'ping-pong', 'random', 'center-out', 'center-in', 'odd-even', 'custom-order'];

export const ChaseSettingsPanel = (): JSX.Element => {
  const chase = useAppStore((s) => s.chase);
  const setChase = useAppStore((s) => s.setChase);

  return (
    <section className="panel-block">
      <h2>Chase Settings</h2>
      <div className="row">
        <label>
          Mode
          <select value={chase.mode} onChange={(e) => void setChase({ mode: e.target.value as ChaseMode })}>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </label>
        <label>
          Direction
          <select value={chase.direction} onChange={(e) => void setChase({ direction: e.target.value as 'forward' | 'reverse' })}>
            <option value="forward">forward</option>
            <option value="reverse">reverse</option>
          </select>
        </label>
        <label>
          Step Size
          <input type="number" min={1} value={chase.stepSize} onChange={(e) => void setChase({ stepSize: Number(e.target.value) })} />
        </label>
        <label>
          Random Seed
          <input type="number" value={chase.randomSeed ?? ''} onChange={(e) => void setChase({ randomSeed: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </label>
      </div>
    </section>
  );
};
